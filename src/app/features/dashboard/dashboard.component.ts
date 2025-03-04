import { Component } from '@angular/core';
import { Card } from 'primeng/card';
import { PrimeTemplate } from 'primeng/api';
import { WeatherCardComponent } from '../dashboard-cards/weather-card/weather-card.component';
import { DroughtDataCardComponent } from '../dashboard-cards/drought-data-card/drought-data-card.component';

@Component({
  selector: 'app-dashboard',
  imports: [
    Card,
    PrimeTemplate,
    WeatherCardComponent,
    DroughtDataCardComponent
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent {
}
