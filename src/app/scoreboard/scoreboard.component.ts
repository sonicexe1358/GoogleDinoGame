import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PadzeroPipe } from '../padzero.pipe';
import { DecimalPipe } from '@angular/common';

@Component({
  selector: 'app-scoreboard',
  standalone: true,
  imports: [CommonModule, PadzeroPipe],
  providers: [DecimalPipe],
  templateUrl: './scoreboard.component.html',
  styleUrls: ['./scoreboard.component.css']
})
export class ScoreboardComponent {
  @Input() score = 0;
  @Input() highScore = 0;

  mode: 'score' | 'high' = 'score'; // для ngSwitch

  constructor(private decimalPipe: DecimalPipe) {}

  get formattedScore(): string {
    // 👇 форматируем число через пайп прямо в TS
    return this.decimalPipe.transform(this.score, '1.0-0') ?? '0';
  }

  get formattedHighScore(): string {
    return this.decimalPipe.transform(this.highScore, '1.0-0') ?? '0';
}
}
