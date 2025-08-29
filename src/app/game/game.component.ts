import { Component, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GameControllerComponent } from '../game-controller/game-controller.component';

@Component({
  selector: 'app-game',
  standalone: true,
  imports: [CommonModule, GameControllerComponent],
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.css']
})
export class GameComponent {
  @ViewChild('gameController') gameController!: GameControllerComponent;

  isGameRunning = false;

  startGame() {
    this.isGameRunning = true;
    this.gameController.startGame();
  }

  onGameOver() {
    this.isGameRunning = false;
  }
}
