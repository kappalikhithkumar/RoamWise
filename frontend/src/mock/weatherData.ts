import { DailyForecastItem, HourlyForecastItem, WeatherSensor } from '../types';

export const JAIPUR_CURRENT_WEATHER: WeatherSensor = {
  temperature: 28,
  condition: 'Mostly Sunny',
  highTemp: 31,
  lowTemp: 18,
  uvIndex: 4,
  uvLevel: 'Moderate',
  humidity: 45,
  wind: '12 km/h NE',
  daylight: '10h 48m',
  sunrise: '06:42 AM',
  sunset: '05:30 PM',
  rainRisk: 10,
  isIllustrative: true
};

export const JAIPUR_HOURLY_FORECAST: HourlyForecastItem[] = [
  { time: '09:00 AM', temp: 24, condition: 'Sunny', icon: 'wb_sunny', pop: 5, isCurrent: true },
  { time: '11:00 AM', temp: 28, condition: 'Sunny', icon: 'wb_sunny', pop: 10 },
  { time: '01:00 PM', temp: 31, condition: 'Partly Cloudy', icon: 'partly_cloudy_day', pop: 25 },
  { time: '02:00 PM', temp: 27, condition: 'Rain Approaching', icon: 'thunderstorm', pop: 65, isAlert: true },
  { time: '03:00 PM', temp: 25, condition: 'Showers & Gusts', icon: 'rainy', pop: 70, isAlert: true },
  { time: '05:00 PM', temp: 26, condition: 'Passing Clouds', icon: 'cloud', pop: 30 },
  { time: '07:00 PM', temp: 23, condition: 'Clear Sky', icon: 'nights_stay', pop: 5 },
  { time: '09:00 PM', temp: 20, condition: 'Cool Night', icon: 'clear_night', pop: 0 }
];

export const JAIPUR_DAILY_FORECAST: DailyForecastItem[] = [
  { day: 'Sat', date: 'Nov 14', tempHigh: 31, tempLow: 18, condition: 'Sunny', icon: 'wb_sunny', rainRisk: 10 },
  { day: 'Sun', date: 'Nov 15', tempHigh: 27, tempLow: 19, condition: 'Afternoon Showers', icon: 'thunderstorm', rainRisk: 65, hasAlert: true },
  { day: 'Mon', date: 'Nov 16', tempHigh: 29, tempLow: 17, condition: 'Pleasant Sun', icon: 'wb_sunny', rainRisk: 15 },
  { day: 'Tue', date: 'Nov 17', tempHigh: 28, tempLow: 16, condition: 'Partly Cloudy', icon: 'partly_cloudy_day', rainRisk: 20 },
  { day: 'Wed', date: 'Nov 18', tempHigh: 30, tempLow: 18, condition: 'Clear & Bright', icon: 'wb_sunny', rainRisk: 5 }
];
