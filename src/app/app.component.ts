import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ButtonModule } from 'primeng/button'; // import Button Module

@Component({
  selector: 'app-root',
  imports: [ButtonModule], // Add Button Module to imports
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'FarmWebUI';
}
