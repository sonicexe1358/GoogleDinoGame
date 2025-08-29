import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ResultService, GameResult } from '../result.service';
import { GameControllerComponent } from '../game-controller/game-controller.component';

interface FakePlayer {
  name: string;
  score: number;
}

@Component({
  selector: 'app-results',
  standalone: true,
  imports: [CommonModule, GameControllerComponent],
  templateUrl: './results.component.html',
  styleUrls: ['./results.component.css']
})
export class ResultsComponent implements OnInit {
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
