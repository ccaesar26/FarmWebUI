import { Component, OnInit, signal, WritableSignal } from '@angular/core';
import { WeatherService } from '../../../core/services/weather.service';
import { FieldService } from '../../../core/services/field.service';
import { DailyForecastWithAnimationResponse, WeatherResponse } from '../../../core/models/weather.model';
import { CityOption, GetFieldCoordinatesResponse, GetFieldsCitiesResponse } from '../../../core/models/field.model';
import { DatePipe, DecimalPipe, NgForOf, NgIf } from '@angular/common';
import { AnimationOptions, LottieComponent } from 'ngx-lottie';
import { FormsModule } from '@angular/forms';
import { DropdownModule } from 'primeng/dropdown';
import { ProgressSpinner } from 'primeng/progressspinner';
import { Card } from 'primeng/card';
import { ScrollPanel } from 'primeng/scrollpanel';
import { Select } from 'primeng/select';

@Component({
  selector: 'app-weather-card',
  templateUrl: './weather-card.component.html',
  imports: [
    Card,
    DropdownModule,
    FormsModule,
    ProgressSpinner,
    NgIf,
    LottieComponent,
    ScrollPanel,
    DecimalPipe,
    Select,
    NgForOf
  ]
})
export class WeatherCardComponent implements OnInit {
  cities = signal<CityOption[]>([]);
  selectedCity = signal<CityOption | null>(null);
  weatherData = signal<WeatherResponse | null>(null);
  dailyForecast = signal<DailyForecastWithAnimationResponse[]>([]);
  loading = signal(false);
  debugText = signal('No updates yet');
  debugCounter = 0;
  currentWeatherAnimationOptions: AnimationOptions = { // Renamed for clarity
    animationData: {},
    loop: true,
    autoplay: true,
  };
  dailyForecastAnimationOptions = signal<AnimationOptions[]>([]); // New signal for forecast animations
  isDarkMode: WritableSignal<boolean> = signal(false);

  constructor(
    private weatherService: WeatherService,
    private fieldService: FieldService
  ) {
    this.isDarkMode.set(window.matchMedia('(prefers-color-scheme: dark)').matches);
  }

  ngOnInit(): void {
    this.fetchCities();

    this.weatherService.onDebugUpdate = (msg) => {
      this.debugText.set(`Debug update received: ${msg}`);
    }

    this.weatherService.onWeatherUpdate = () => {
      this.fetchWeatherAndForecast(this.selectedCity());
      this.debugCounter++;
      this.debugText.set(`Weather update received: ${this.debugCounter}`);
    }

    this.weatherService.startConnection();
  }

  fetchCities(): void {
    this.fieldService.getFieldsCities().subscribe({
      next: (response) => {
        this.cities.set(response.map(city => city));
        this.selectedCity.set(this.cities()[0]);
        this.fetchWeatherAndForecast(this.selectedCity());
      },
      error: (error) => {
        console.error('Error fetching cities:', error);
      },
    });
  }

  fetchWeatherAndForecast(city: CityOption | null): void {
    if (!city) return;
    this.loading.set(true);
    this.weatherData.set(null);
    this.dailyForecast.set([]);

    this.weatherService.getWeatherByCoords(city.lat, city.lon).subscribe({
      next: (data) => {
        this.weatherData.set(data);
        this.loading.set(false);
        this.currentWeatherAnimationOptions = { // Updated property name
          ...this.currentWeatherAnimationOptions,
          animationData: JSON.parse(data.lottieAnimation)
        };
        this.fetchForecast(city.lat, city.lon);
      },
      error: (error) => {
        console.error('Error fetching weather:', error);
        this.loading.set(false);
      },
    });
  }

  fetchForecast(lat: number, lon: number): void {
    this.weatherService.getDailyForecast(lat, lon, 16).subscribe({
      next: (forecastData) => {
        this.dailyForecast.set(forecastData);
        this.dailyForecastAnimationOptions.set(
          forecastData.map(forecast => ({ // Create animation options for each day
            animationData: JSON.parse(forecast.lottieAnimation),
            loop: true,
            autoplay: true,
          }))
        );
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Error fetching 16-day forecast:', error);
        this.loading.set(false);
      }
    });
  }

  onCityChange(newCity: CityOption) {
    this.selectedCity.set(newCity);
    this.fetchWeatherAndForecast(newCity);
  }

  getForecastClass(): string {
    let cls = this.isDarkMode() ? 'bg-surface-950' : '';
    cls = cls.concat(' flex flex-col items-center rounded-lg p-4 shadow-md m-2');
    return cls;
  }
}
