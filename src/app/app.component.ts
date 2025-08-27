import { Component, ViewChild, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { GameControllerComponent } from './game-controller/game-controller.component';
import { ResultService, GameResult } from './result.service';

interface FakePlayer {
  name: string;
  score: number;
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, GameControllerComponent],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'GoogleDinoGame';

  @ViewChild('gameController') gameController!: GameControllerComponent;

  savedResults: GameResult[] = [];
  fakePlayers: FakePlayer[] = [];

  constructor(private resultService: ResultService) {}

  ngOnInit() {
    this.resultService.results$.subscribe(results => {
      this.savedResults = results;
    });
  }

  onFakePlayersLoaded(players: FakePlayer[]) {
    this.fakePlayers = players;
  }

  loadFakePlayers() {
    this.gameController.loadFakePlayers();
  }
}

