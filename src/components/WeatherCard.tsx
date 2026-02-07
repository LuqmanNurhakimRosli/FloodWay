import type { WeatherData } from '../types/flood';

interface WeatherCardProps {
    weather: WeatherData;
    locationName: string;
}

export function WeatherCard({ weather, locationName }: WeatherCardProps) {
    const getWeatherIcon = (condition: WeatherData['condition']) => {
        switch (condition) {
            case 'clear':
                return '☀️';
            case 'cloudy':
                return '☁️';
            case 'rainy':
                return '🌧️';
            case 'stormy':
                return '⛈️';
            default:
                return '🌤️';
        }
    };

    const getWeatherBg = (condition: WeatherData['condition']) => {
        switch (condition) {
            case 'clear':
                return 'from-yellow-400 to-orange-500';
            case 'cloudy':
                return 'from-gray-400 to-gray-600';
            case 'rainy':
                return 'from-blue-400 to-blue-600';
            case 'stormy':
                return 'from-purple-600 to-gray-800';
            default:
                return 'from-blue-300 to-blue-500';
        }
    };

    return (
        <div className={`rounded-2xl bg-gradient-to-br ${getWeatherBg(weather.condition)} p-6 text-white shadow-xl`}>
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-lg font-medium opacity-90">Current Weather</h2>
                    <p className="text-2xl font-bold">{locationName}</p>
                </div>
                <div className="text-6xl">{getWeatherIcon(weather.condition)}</div>
            </div>

            <div className="mt-6">
                <div className="text-5xl font-bold">
                    {Math.round(weather.temperature)}°C
                </div>
                <p className="mt-1 text-lg capitalize opacity-90">{weather.condition}</p>
            </div>

            <div className="mt-6 grid grid-cols-3 gap-4">
                <div className="rounded-xl bg-white/20 p-3 backdrop-blur-sm">
                    <p className="text-sm opacity-80">Humidity</p>
                    <p className="text-xl font-semibold">{Math.round(weather.humidity)}%</p>
                </div>
                <div className="rounded-xl bg-white/20 p-3 backdrop-blur-sm">
                    <p className="text-sm opacity-80">Rainfall</p>
                    <p className="text-xl font-semibold">{weather.rainfall} mm</p>
                </div>
                <div className="rounded-xl bg-white/20 p-3 backdrop-blur-sm">
                    <p className="text-sm opacity-80">Wind</p>
                    <p className="text-xl font-semibold">{Math.round(weather.windSpeed)} km/h</p>
                </div>
            </div>
        </div>
    );
}
