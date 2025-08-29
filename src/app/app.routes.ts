import { Routes } from '@angular/router';
import { GameComponent } from './game/game.component';
import { ResultsComponent } from './results/results.component';

export const routes: Routes = [
  { path: '', component: GameComponent },
  { path: 'results', component: ResultsComponent },
  { path: '**', redirectTo: '' }
];
