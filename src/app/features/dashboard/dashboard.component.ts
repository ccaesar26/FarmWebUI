import { Component } from '@angular/core';
import { Card } from 'primeng/card';
import { PrimeTemplate } from 'primeng/api';
import { WeatherCardComponent } from '../dashboard-cards/weather-card/weather-card.component';

@Component({
  selector: 'app-dashboard',
  imports: [
    Card,
    PrimeTemplate,
    WeatherCardComponent
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent {
}
