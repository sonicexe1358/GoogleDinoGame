import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { GameControllerComponent } from './game-controller/game-controller.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, GameControllerComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'GoogleDinoGame';
}
