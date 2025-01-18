import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import {LoginComponent} from './login/login.component'; // import Button Module

@Component({
  selector: 'app-root',
  imports: [ButtonModule, LoginComponent], // Add Button Module to imports
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'FarmWebUI';
}
