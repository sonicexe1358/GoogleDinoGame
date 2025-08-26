import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-obstacle',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './obstacle.component.html',
  styleUrls: ['./obstacle.component.css']
})
export class ObstacleComponent {
  @Input() isRunning = false;
  x = 820;
  h = 40;
  w = 20;
  y = 0;

  tick(dt: number, speed: number) {
    if (!this.isRunning) return;
    this.x -= speed * (dt / 16) * 4;
    if (this.x < -this.w) {
      this.randomize();
      this.x = 820;
    }
  }

  randomize() {
    // случайный тип препятствия
    const types = [
      { w: 20, h: 40, y: 0 },   // кактус
      { w: 28, h: 60, y: 0 },   // высокий кактус
      { w: 40, h: 28, y: 60 }   // птица
    ];
    const t = types[Math.floor(Math.random()*types.length)];
    this.w = t.w; this.h = t.h; this.y = t.y;
  }

  getBounds() {
    return { x: this.x, y: this.y, w: this.w, h: this.h };
  }

  reset() {
  this.x = 800;  // например, за пределами экрана
}
}
