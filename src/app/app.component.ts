import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { GameControllerComponent } from './game-controller/game-controller.component';
import { ResultService, GameResult } from './result.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, GameControllerComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'GoogleDinoGame';
  savedResults: GameResult[] = [];

  constructor(private resultService: ResultService) {}

  ngOnInit() {
    this.resultService.results$.subscribe(results => {
      this.savedResults = results;
    });
  }
}
