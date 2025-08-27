import { Component, ViewChild, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DinoComponent } from '../dino/dino.component';
import { ResultService, GameResult } from '../result.service';
import { ObstacleComponent } from '../obstacle/obstacle.component';
import { GroundComponent } from '../ground/ground.component';
import { ScoreboardComponent } from '../scoreboard/scoreboard.component';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';

type Rect = { x: number; y: number; w: number; h: number };

interface FakePlayer {
  name: string;
  score: number;
}

@Component({
  selector: 'app-game-controller',
  standalone: true,
  imports: [
    CommonModule,
    DinoComponent,
    ObstacleComponent,
    GroundComponent,
    ScoreboardComponent,
    ReactiveFormsModule,
    HttpClientModule
  ],
  templateUrl: './game-controller.component.html',
  styleUrls: ['./game-controller.component.css']
})
export class GameControllerComponent {
  @Output() fakePlayersLoaded = new EventEmitter<FakePlayer[]>();
  resultForm: FormGroup;
  errorMessage: string | null = null;

  fakePlayers: FakePlayer[] = [];
  isRunning = false;
  gameOver = false;
  score = 0;
  highScore = 0;
  speed = 2;
  lastFrame = 0;
  private loopHandle: number | null = null;
  private scoreTimer = 0;

  @ViewChild(DinoComponent) dino!: DinoComponent;
  @ViewChild(ObstacleComponent) obstacle!: ObstacleComponent;

  constructor(private fb: FormBuilder, private resultService: ResultService, private http: HttpClient) {
    this.resultForm = this.fb.group({
      playerName: ['', Validators.required],
      scoreLimit: ['', [Validators.required, Validators.min(100)]],
      level: [''],
      notes: ['']
    });
  }

  startGame() {
    this.isRunning = true;
    this.gameOver = false;
    this.score = 0;
    this.speed = 2;
    this.scoreTimer = 0;

    if (this.loopHandle) cancelAnimationFrame(this.loopHandle);
    this.lastFrame = performance.now();

    const loop = (t: number) => {
      if (!this.isRunning) return;
      const dt = Math.min(32, t - this.lastFrame);
      this.lastFrame = t;

      this.scoreTimer += dt;
      if (this.scoreTimer >= 100) {
        this.score += Math.floor(this.scoreTimer / 100);
        this.scoreTimer %= 100;
      }
      if (this.score > this.highScore) this.highScore = this.score;

      if (this.score > 0 && this.score % 100 === 0) this.speed += 0.002;

      if (this.obstacle) this.obstacle.tick(dt, this.speed);

      if (this.dino && this.obstacle) {
        const dinoBounds = this.dino.getBounds();
        for (const obs of this.obstacle.obstacles) {
          if (this.intersects(dinoBounds, obs)) {
            this.endGame();
            return;
          }
        }
      }

      this.loopHandle = requestAnimationFrame(loop);
    };

    this.loopHandle = requestAnimationFrame(loop);
  }

  intersects(a: Rect, b: Rect): boolean {
    return !(a.x + a.w < b.x || b.x + b.w < a.x || a.y + a.h < b.y || b.y + b.h < a.y);
  }

  endGame() {
    this.isRunning = false;
    this.gameOver = true;
    if (this.loopHandle) cancelAnimationFrame(this.loopHandle);
    this.resultForm.patchValue({ scoreLimit: this.score });
  }

  get savedResults() {
    return this.resultService.getResults();
  }

  saveResult() {
    const { playerName, scoreLimit, level, notes } = this.resultForm.value;
    const minScore = 100;
    this.errorMessage = null;

    if (!playerName || playerName.trim() === '') {
      this.errorMessage = 'Ошибка: введите имя игрока!';
      return;
    }

    if (this.score < minScore) {
      this.errorMessage = `Ошибка: ваш результат ${this.score} меньше минимального ${minScore}!`;
      return;
    }

    const newResult: GameResult = { playerName, scoreLimit, level, notes, score: this.score };
    this.resultService.addResult(newResult);

    this.sendResultToFakeAPI(newResult);

    this.resultForm.reset();
    this.gameOver = false;
    this.errorMessage = null;
  }

  restart() {
    this.gameOver = false;
    this.isRunning = false;

    if (this.loopHandle) cancelAnimationFrame(this.loopHandle);

    if (this.dino) this.dino.reset?.();
    if (this.obstacle) this.obstacle.reset?.();

    this.startGame();
  }

  loadFakePlayers() {
    this.http.get<any>('https://fakerapi.it/api/v1/users?_quantity=5&_locale=ru_RU')
      .subscribe({
        next: (res) => {
          this.fakePlayers = res.data.map((u: any) => ({
            name: `${u.firstname} ${u.lastname}`,
            score: Math.floor(Math.random() * 900) + 100
          }));
          this.fakePlayersLoaded.emit(this.fakePlayers);
        },
        error: (err) => console.error('Ошибка при GET:', err)
      });
  }


  sendResultToFakeAPI(result: GameResult) {
    const payload: FakePlayer = { name: result.playerName, score: result.score };
    this.http.post('https://fakerapi.it/api/v1/users', payload)
      .subscribe({
        next: (res) => console.log('POST response:', res),
        error: (err) => console.error('Ошибка при POST:', err)
      });
  }
}
