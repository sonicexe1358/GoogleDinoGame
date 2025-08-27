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
  savedResults: { playerName: string; scoreLimit: number; level: string; notes: string; score: number }[] = [];

  constructor(private fb: FormBuilder, private resultService: ResultService) {
    this.resultForm = this.fb.group({
      playerName: ['', Validators.required],
      scoreLimit: ['', [Validators.required, Validators.min(100)]],
      level: [''],
      notes: ['']
    });
  }

  submitResult() {
    if (this.resultForm.valid) {
      console.log(this.resultForm.value);
    } else {
      console.log(this.resultForm.errors);
    }
  }

  isRunning = false;
  gameOver = false;
  score = 0;
  highScore = 0;
  speed = 2;              // медленнее старт
  lastFrame = 0;
  private loopHandle: number | null = null;
  private scoreTimer = 0; // таймер для подсчёта очков

  @ViewChild(DinoComponent) dino!: DinoComponent;
  @ViewChild(ObstacleComponent) obstacle!: ObstacleComponent;

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

      // обновляем счёт раз в 100 мс
      this.scoreTimer += dt;
      if (this.scoreTimer >= 100) {
        this.score += Math.floor(this.scoreTimer / 100);
        this.scoreTimer %= 100;
      }
      if (this.score > this.highScore) this.highScore = this.score;

      // плавное ускорение: каждые 100 очков +0.002 к скорости
      if (this.score > 0 && this.score % 100 === 0) {
        this.speed += 0.002;
      }

      // двигаем препятствие
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
  }

  saveResult() {
  const { playerName, scoreLimit, level, notes } = this.resultForm.value;

  // Проверка имени
  if (!playerName || playerName.trim() === '') {
    console.log('Введите имя игрока!');
    return;
  }

  // Проверка минимального результата
  const minScore = 100; // допустим минимальный результат
  if (this.score < minScore) {
    console.log(`Ваш результат ${this.score} меньше минимального ${minScore}!`);
    return;
  }

  // Если все условия выполнены, сохраняем результат
  const newResult: GameResult = {
    playerName,
    scoreLimit,
    level,
    notes,
    score: this.score
  };

  this.resultService.addResult(newResult);
  console.log('Результат записан!', newResult);

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
