import { Component, OnInit, signal } from '@angular/core';
import { WeatherService } from '../../../core/services/weather.service';
import { FieldService } from '../../../core/services/field.service';
import { WeatherResponse } from '../../../core/models/weather.model';
import { CityOption, GetFieldCoordinatesResponse, GetFieldsCitiesResponse } from '../../../core/models/field.model';
import { DatePipe, NgForOf, NgIf } from '@angular/common';
import { AnimationOptions, LottieComponent } from 'ngx-lottie';
import { FormsModule } from '@angular/forms';
import { DropdownModule } from 'primeng/dropdown';
import { ProgressSpinner } from 'primeng/progressspinner';
import { Card } from 'primeng/card';

interface WeatherData {
  temperature: number;
  description: string;
  humidity: number;
  pressure: number;
  windSpeed: number;
}

@Component({
  selector: 'app-weather-card',
  templateUrl: './weather-card.component.html',
  imports: [
    Card,
    DropdownModule,
    FormsModule,
    ProgressSpinner,
    NgIf,
    LottieComponent
  ]
})
export class WeatherCardComponent implements OnInit {
  cities = signal<CityOption[]>([]);
  selectedCity = signal<CityOption | null>(null);
  weatherData = signal<WeatherResponse | null>(null);
  loading = signal(false);
  debugText = signal('DEBUG\n');
  animationOptions: AnimationOptions = {
    animationData: {},
    loop: true,
    autoplay: true,
  };

  constructor(
    private weatherService: WeatherService,
    private fieldService: FieldService
  ) {}

  ngOnInit(): void {
    this.debugText.update((text) => text + 'Initializing WeatherCardComponent\n');
    this.fetchCities();
  }

  fetchCities(): void {
    this.debugText.update((text) => text + 'Fetching cities\n');
    this.fieldService.getFieldsCities().subscribe({
      next: (response) => {
        this.cities.set(response.map(city => city));
        this.selectedCity.set(this.cities()[0]);
        this.fetchWeather(this.selectedCity());
      },
      error: (error) => {
        console.error('Error fetching cities:', error);
      },
    });
  }

  fetchWeather(city: CityOption | null): void {
    if (!city) return;
    this.loading.set(true);

    this.weatherService.getWeatherByCoords(city.lat, city.lon).subscribe({
      next: (data) => {
        this.weatherData.set(data);
        this.loading.set(false);
        this.animationOptions = {
          ...this.animationOptions,
          animationData: JSON.parse(data.lottieAnimation)
        };
      },
      error: (error) => {
        console.error('Error fetching weather:', error);
        this.debugText.update((text) => text + `Error fetching weather: ${error}\n`);
        this.loading.set(false);
      },
    });
  }

  onCityChange(newCity: CityOption) {
    this.selectedCity.set(newCity);
    this.fetchWeather(newCity);
  }
}
