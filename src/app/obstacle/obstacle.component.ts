import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

type Obstacle = { x: number; y: number; w: number; h: number };

@Component({
  selector: 'app-obstacle',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './obstacle.component.html',
  styleUrls: ['./obstacle.component.css']
})
export class ObstacleComponent {
  @Input() isRunning = false;

  // массив препятствий
  obstacles: Obstacle[] = [
    this.createRandomObstacle(820),
    this.createRandomObstacle(1200)
  ];

  /** Двигаем все препятствия */
  tick(dt: number, speed: number) {
    if (!this.isRunning) return;
    this.obstacles.forEach(obs => {
      obs.x -= speed * (dt / 16) * 4;
      if (obs.x < -obs.w) {
        // возвращаем вправо + чуть дальше, чтобы не слипались
        obs.x = 820 + Math.random() * 300;
        const newObs = this.randomize();
        obs.w = newObs.w;
        obs.h = newObs.h;
        obs.y = newObs.y;
      }
    });
  }

  /** Генерация случайного типа */
  randomize(): Obstacle {
    const types = [
      { w: 20, h: 40, y: 0, x: 0 },   // низкий кактус
      { w: 28, h: 60, y: 0, x: 0 },   // высокий кактус
      { w: 40, h: 28, y: 60, x: 0 }   // птица
    ];
    return types[Math.floor(Math.random() * types.length)];
  }

  /** Создать препятствие на определённой позиции */
  private createRandomObstacle(x: number): Obstacle {
    const base = this.randomize();
    return { x, y: base.y, w: base.w, h: base.h };
  }

  /** Для коллизии (проверяем первое ближайшее) */
  getBounds(): Obstacle {
    return this.obstacles[0]; // можно доработать на ближайший
  }

  reset() {
    this.obstacles = [
      this.createRandomObstacle(820),
      this.createRandomObstacle(1200)
    ];
  }
}
