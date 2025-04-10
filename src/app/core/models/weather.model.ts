export interface WeatherResponse {
  location: string;
  temperature: number;
  feelslike: string;
  humidity: number;
  pressure: number;
  windSpeed: number;
  windGust: number;
  cloudCoverage: number;
  sunrise: string;
  sunset: string;
  lottieAnimation: string;
  description: string;
}

export interface DailyForecastWithAnimationResponse {
  date: string;
  dayTemperature: number;
  minTemperature: number;
  maxTemperature: number;
  humidity: number;
  pressure: number;
  windSpeed: number;
  windGust: number;
  cloudCoverage: number;
  precipitationProbability: number;
  rain?: number;
  snow?: number;
  lottieAnimationName: string;
  lottieAnimation: string;
}
