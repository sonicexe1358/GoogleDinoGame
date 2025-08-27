import { Component, ViewChild, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DinoComponent } from '../dino/dino.component';
import { ResultService, GameResult } from '../result.service';
import { ObstacleComponent } from '../obstacle/obstacle.component';
import { GroundComponent } from '../ground/ground.component';
import { ScoreboardComponent } from '../scoreboard/scoreboard.component';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';

type Rect = { x: number; y: number; w: number; h: number };

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
export class GameControllerComponent implements OnInit {
  resultForm: FormGroup;
  errorMessage: string | null = null;

  isRunning = false;
  gameOver = false;
  score = 0;
  highScore = 0;
  speed = 2;
  lastFrame = 0;
  private loopHandle: number | null = null;
  private scoreTimer = 0;

  private apiUrl = 'http://localhost:3000/results'; // замените на свой API

  @ViewChild(DinoComponent) dino!: DinoComponent;
  @ViewChild(ObstacleComponent) obstacle!: ObstacleComponent;

  constructor(
    private fb: FormBuilder,
    private resultService: ResultService,
    private http: HttpClient
  ) {
    this.resultForm = this.fb.group({
      playerName: ['', Validators.required],
      scoreLimit: ['', [Validators.required, Validators.min(100)]],
      level: [''],
      notes: ['']
    });
  }

  ngOnInit() {
    this.fetchSavedResultsFromAPI();
  }

  /** Получение сохранённых результатов с внешнего API */
  fetchSavedResultsFromAPI() {
    this.http.get<GameResult[]>(this.apiUrl).subscribe({
      next: (results) => {
        // добавляем результаты из API в локальный сервис
        results.forEach(r => this.resultService.addResult(r));
      },
      error: (err) => console.error('Ошибка загрузки результатов с API:', err)
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

      if (this.score > 0 && this.score % 100 === 0) {
        this.speed += 0.002;
      }

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

  /** Сохранение результата игры */
  saveResult() {
    const { playerName, level, notes } = this.resultForm.value;
    const minScore = 100;

    this.errorMessage = null;

    if (!playerName?.trim()) {
      this.errorMessage = 'Ошибка: введите имя игрока!';
      return;
    }

    if (this.score < minScore) {
      this.errorMessage = `Ошибка: ваш результат ${this.score} меньше минимального ${minScore}!`;
      return;
    }

    const newResult: GameResult = {
      playerName,
      scoreLimit: this.score,
      level,
      notes,
      score: this.score
    };

    // Сохраняем локально через сервис
    this.resultService.addResult(newResult);

    // Отправка на внешний API
    this.http.post<GameResult>(this.apiUrl, newResult).subscribe({
      next: res => console.log('Результат отправлен на сервер', res),
      error: err => console.error('Ошибка отправки результата на сервер', err)
    });

    this.resultForm.reset();
    this.gameOver = false;
  }

  restart() {
    this.gameOver = false;
    this.isRunning = false;

    if (this.loopHandle) cancelAnimationFrame(this.loopHandle);

    if (this.dino) this.dino.reset?.();
    if (this.obstacle) this.obstacle.reset?.();

    this.startGame();
  }
}
