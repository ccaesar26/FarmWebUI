import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import {LandingComponent} from './landing/landing.component'; // import Button Module

@Component({
  selector: 'app-root',
  imports: [
    LandingComponent,
    RouterOutlet
  ], // Add Button Module to imports
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'FarmWebUI';
}
