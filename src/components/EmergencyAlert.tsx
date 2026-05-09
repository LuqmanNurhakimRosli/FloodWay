import { useEffect, useState, useRef } from 'react';
import { useApp } from '../store/AppContext';
import { useNavigate } from 'react-router-dom';
import { calculateDistance, IOT_SENSOR_LOCATION } from '../data/locations';

export function EmergencyAlert() {
    const { iotStatus, userPosition } = useApp();
    const [isDismissed, setIsDismissed] = useState(false);
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const navigate = useNavigate();

    // Reset dismissal if status becomes safe
    useEffect(() => {
        if (iotStatus === 'SAFE') {
            setIsDismissed(false);
        }
    }, [iotStatus]);

    useEffect(() => {
        const distance = calculateDistance(userPosition, IOT_SENSOR_LOCATION.position);
        const isWithinRange = distance <= 3.0;

        if (iotStatus === 'DANGER' && !isDismissed && isWithinRange) {
            if (navigator.vibrate) {
                navigator.vibrate([200, 100, 200]);
            }
            
            const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
            if (AudioContext) {
                try {
                    const audioCtx = new AudioContext();
                    const oscillator = audioCtx.createOscillator();
                    const gainNode = audioCtx.createGain();
                    
                    oscillator.connect(gainNode);
                    gainNode.connect(audioCtx.destination);
                    
                    oscillator.type = 'square';
                    
                    const duration = 5; // 5 seconds
                    const now = audioCtx.currentTime;
                    
                    for (let i = 0; i < duration * 4; i++) {
                        const time = now + i * 0.25;
                        oscillator.frequency.setValueAtTime(i % 2 === 0 ? 800 : 1000, time);
                        
                        gainNode.gain.setValueAtTime(0.1, time);
                        gainNode.gain.exponentialRampToValueAtTime(0.01, time + 0.2);
                    }
                    
                    oscillator.start(now);
                    oscillator.stop(now + duration);
                } catch (e) {
                    console.warn("AudioContext not supported for alarm", e);
                }
            }
        }
    }, [iotStatus, isDismissed, userPosition]);

    const distance = calculateDistance(userPosition, IOT_SENSOR_LOCATION.position);
    const isWithinRange = distance <= 3.0;

    if (iotStatus !== 'DANGER' || isDismissed || !isWithinRange) {
        return null;
    }

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Dimmed pulsing background overlay */}
            <div className="absolute inset-0 bg-red-950/80 backdrop-blur-sm animate-pulse-slow"></div>

            <div className="relative bg-slate-900 border-2 border-red-500 rounded-3xl p-6 shadow-2xl shadow-red-500/50 max-w-sm w-full overflow-hidden text-center">
                {/* Red warning bar */}
                <div className="absolute top-0 left-0 right-0 h-2 bg-red-500"></div>
                
                <div className="w-20 h-20 mx-auto bg-red-500/20 rounded-full flex items-center justify-center mb-4 border border-red-500/50">
                    <span className="text-4xl animate-bounce">🚨</span>
                </div>

                <h2 className="text-2xl font-black text-white mb-2 tracking-tight">
                    FLASH FLOOD IMMINENT
                </h2>
                <p className="text-red-200 mb-6 text-sm">
                    Water levels in your vicinity have reached critical levels. Evacuate to the nearest shelter immediately.
                </p>

                <div className="flex flex-col gap-3">
                    <button 
                        onClick={() => {
                            setIsDismissed(true);
                            navigate('/shelters');
                        }}
                        className="w-full bg-red-600 hover:bg-red-500 text-white font-bold py-4 px-6 rounded-2xl transition-all active:scale-95 shadow-lg shadow-red-600/30 text-lg flex items-center justify-center gap-2"
                    >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        Find Shelter Now
                    </button>

                    <button 
                        onClick={() => setIsDismissed(true)}
                        className="w-full bg-white/5 hover:bg-white/10 text-white/70 py-3 px-6 rounded-xl transition-colors font-medium text-sm"
                    >
                        Dismiss Warning
                    </button>
                </div>
            </div>
        </div>
    );
}
