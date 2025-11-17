import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrls: ['./app.css'] // 👈 corregido
})
export class AppComponent { // 👈 renombrado
  protected readonly title = signal('frontend');
}
