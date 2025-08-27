import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface GameResult {
  playerName: string;
  scoreLimit: number;
  level: string;
  notes: string;
  score: number;
}

@Injectable({
  providedIn: 'root'
})

export class ResultService {
  // BehaviorSubject хранит актуальный массив результатов
  private resultsSubject = new BehaviorSubject<GameResult[]>([]);
  results$ = this.resultsSubject.asObservable();

  // Получить текущие результаты
  getResults(): GameResult[] {
    return this.resultsSubject.value;
  }

  // Добавить новый результат
  addResult(result: GameResult) {
    const updated = [...this.resultsSubject.value, result];
    this.resultsSubject.next(updated);
  }
}
