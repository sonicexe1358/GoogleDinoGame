import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-ground',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './ground.component.html',
  styleUrls: ['./ground.component.css']
})
export class GroundComponent {
  @Input() running = false;
  @Input() speed = 6;
  offset = 0;
  private raf: number | null = null;
  private last = performance.now();

  ngOnInit() {
    const loop = (t: number) => {
      const dt = Math.min(32, t - this.last);
      this.last = t;

      if (this.running) {
        this.offset = (this.offset - this.speed * (dt / 16) * 4) % 240; 
        // 240 — ширина тайла, подгони под размер своей земли
      }

      this.raf = requestAnimationFrame(loop);
    };

    this.raf = requestAnimationFrame(loop);
  }
  
  ngOnDestroy() { if (this.raf) cancelAnimationFrame(this.raf); }
}
