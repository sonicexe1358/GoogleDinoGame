import { Component, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DinoComponent } from '../dino/dino.component';
import { ResultService, GameResult } from '../result.service';
import { ObstacleComponent } from '../obstacle/obstacle.component';
import { GroundComponent } from '../ground/ground.component';
import { ScoreboardComponent } from '../scoreboard/scoreboard.component';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';

type Rect = { x: number; y: number; w: number; h: number };

@Component({
  selector: 'app-game-controller',
  standalone: true,
  imports: [CommonModule, DinoComponent, ObstacleComponent, GroundComponent, ScoreboardComponent, ReactiveFormsModule],
  templateUrl: './game-controller.component.html',
  styleUrls: ['./game-controller.component.css']
})
export class GameControllerComponent {
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

  @ViewChild(DinoComponent) dino!: DinoComponent;
  @ViewChild(ObstacleComponent) obstacle!: ObstacleComponent;

  constructor(private fb: FormBuilder, private resultService: ResultService) {
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

      // обновляем счёт
      this.scoreTimer += dt;
      if (this.scoreTimer >= 100) {
        this.score += Math.floor(this.scoreTimer / 100);
        this.scoreTimer %= 100;
      }
      if (this.score > this.highScore) this.highScore = this.score;

      // плавное ускорение
      if (this.score > 0 && this.score % 100 === 0) {
        this.speed += 0.002;
      }

      // двигаем препятствия
      if (this.obstacle) this.obstacle.tick(dt, this.speed);

      // проверяем коллизию
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
    this.resultForm.patchValue({ scoreLimit: this.score }); // автозаполнение текущего счета
  }

  get savedResults() {
  return this.resultService.getResults(); // метод сервиса, который возвращает массив GameResult
}

  saveResult() {
    const { playerName, scoreLimit, level, notes } = this.resultForm.value;
    const minScore = 100; // минимальный допустимый результат

    // Сбрасываем предыдущую ошибку
    this.errorMessage = null;

    // Проверка имени
    if (!playerName || playerName.trim() === '') {
      this.errorMessage = 'Ошибка: введите имя игрока!';
      return;
    }

    // Проверка минимального результата
    if (this.score < minScore) {
      this.errorMessage = `Ошибка: ваш результат ${this.score} меньше минимального ${minScore}!`;
      return;
    }

    // Если всё ок, сохраняем результат через сервис
    const newResult: GameResult = { playerName, scoreLimit, level, notes, score: this.score };
    this.resultService.addResult(newResult);

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
}