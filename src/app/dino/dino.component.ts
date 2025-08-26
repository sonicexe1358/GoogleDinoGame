import { Component, EventEmitter, HostListener, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-dino',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dino.component.html',
  styleUrls: ['./dino.component.css']
})
export class DinoComponent {
  @Input() isRunning = false;
  @Output() crash = new EventEmitter<void>();

  // позиция
  bottom = 0;
  private velocity = 0;
  private gravity = -0.9;
  private jumpVelocity = 14;
  private minBottom = 0;
  private maxBottom = 120;
  private crouching = false;
  y = 0;                // текущая высота динозаврика
  isJumping = false;    // прыгает ли сейчас

  private lastTime = performance.now();
  private raf: number | null = null;

  ngOnInit() {
    const loop = (t: number) => {
      const dt = Math.min(32, t - this.lastTime);
      this.lastTime = t;
      // физика прыжка
      this.velocity += this.gravity * (dt / 16);
      this.bottom += this.velocity * (dt / 16);
      if (this.bottom <= this.minBottom) {
        this.bottom = this.minBottom;
        this.velocity = 0;
      }
      if (this.bottom >= this.maxBottom) {
        this.bottom = this.maxBottom;
        this.velocity = -Math.abs(this.velocity);
      }
      this.raf = requestAnimationFrame(loop);
    };
    this.raf = requestAnimationFrame(loop);
  }

  ngOnDestroy() { if (this.raf) cancelAnimationFrame(this.raf); }

  @HostListener('document:keydown', ['$event'])
  onKeyDown(e: KeyboardEvent) {
    if (!this.isRunning) return;
    if ((e.code === 'Space' || e.code === 'ArrowUp')) {
      // прыжок
      if (this.bottom <= this.minBottom + 1) {
        this.velocity = this.jumpVelocity;
      }
      e.preventDefault();
    } else if (e.code === 'ArrowDown') {
      this.crouching = true; // приём, чтобы содержимое .ts оставалось минимальным здесь
      this.maxBottom = 80;
    }
  }

  @HostListener('document:keyup', ['$event'])
  onKeyUp(e: KeyboardEvent) {
    if (e.code === 'ArrowDown') {
      this.crouching = false;
      this.maxBottom = 120;
    }
  }

  getBounds() {
    // фиксированное положение динозавра
    const x = 60;
    const w = 44;
    const h = this.crouching ? 28 : 44;
    return { x, y: this.bottom, w, h };
  }

  reset() {
  this.y = 0;       // координата внизу
  this.isJumping = false;
}
}
