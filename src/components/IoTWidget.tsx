import { useApp } from '../store/AppContext';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { calculateDistance, IOT_SENSOR_LOCATION } from '../data/locations';
import { MapPin, Minus } from 'lucide-react';

export function IoTWidget() {
    const { iotConnected, iotLevel, iotStatus, connectIoT, userPosition } = useApp();
    const [isSupported, setIsSupported] = useState(true);
    const [isMinimized, setIsMinimized] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        if (!('serial' in navigator)) {
            setIsSupported(false);
        }
    }, []);


    if (!iotConnected) {
        return (
            <div className="fixed bottom-24 right-4 z-50 bg-[#E3F4FF]/95 backdrop-blur-md border border-[#C7D0DA] rounded-2xl p-4 shadow-xl pointer-events-auto">
                <div className="flex flex-col items-center gap-2 text-center">
                    <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">IoT Sensor</p>
                    {isSupported ? (
                        <button 
                            onClick={connectIoT}
                            className="bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold py-2 px-6 rounded-xl transition-all shadow-lg shadow-blue-500/20 active:scale-95"
                        >
                            Connect USB/COM
                        </button>
                    ) : (
                        <div className="bg-white border border-[#C7D0DA] text-slate-400 text-xs font-bold py-2 px-3 rounded-xl">
                            Offline (Unsupported)
                        </div>
                    )}
                </div>
            </div>
        );
    }

    // Color mapping based on status
    const colors = {
        DANGER: { fill: '#ef4444', text: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200' },
        WARNING: { fill: '#eab308', text: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-200' },
        SAFE: { fill: '#3b82f6', text: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200' }
    };

    const currentStyle = colors[iotStatus] || colors.SAFE;
    const distance = (Math.round(calculateDistance(userPosition, IOT_SENSOR_LOCATION.position) * 10) / 10).toFixed(1);

    if (isMinimized) {
        return (
            <button 
                onClick={() => setIsMinimized(false)}
                className={`fixed bottom-24 right-4 z-50 ${currentStyle.bg} backdrop-blur-xl border ${currentStyle.border} rounded-full px-4 py-3 shadow-xl pointer-events-auto flex items-center gap-3 transition-all hover:scale-105 active:scale-95`}
            >
                <div className={`relative flex h-3 w-3`}>
                  <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${currentStyle.text.replace('text-', 'bg-')} opacity-75`}></span>
                  <span className={`relative inline-flex rounded-full h-3 w-3 ${currentStyle.text.replace('text-', 'bg-')}`}></span>
                </div>
                <span className={`text-xs font-bold uppercase tracking-wider ${currentStyle.text}`}>
                    {iotStatus} • {iotLevel}%
                </span>
            </button>
        );
    }

    return (
        <div className={`fixed bottom-24 right-4 z-50 bg-[#E3F4FF]/95 backdrop-blur-xl border border-[#C7D0DA] rounded-3xl p-4 shadow-2xl pointer-events-auto w-44 transition-all duration-500`}>
            {/* Header: Location & Minimize */}
            <div className="flex justify-between items-start mb-3">
                <div className="flex flex-col gap-1">
                    <span className={`text-[10px] font-bold uppercase tracking-wider ${currentStyle.text}`}>
                        {iotStatus}
                    </span>
                    <button 
                        onClick={() => navigate('/shelters', { state: { focusSensor: true } })}
                        className="group flex items-center gap-1 text-left text-slate-900 hover:text-blue-600 transition-colors"
                    >
                        <MapPin className="size-3 shrink-0 text-slate-400 group-hover:text-blue-600" />
                        <span className="text-[11px] font-bold truncate max-w-[100px]">
                            {IOT_SENSOR_LOCATION.name}
                        </span>
                    </button>
                    <span className="text-[10px] text-slate-500 font-bold pl-4">
                        {distance} km away
                    </span>
                </div>
                
                <button 
                    onClick={() => setIsMinimized(true)}
                    className="size-7 rounded-full bg-white/50 hover:bg-white flex items-center justify-center text-slate-400 border border-[#C7D0DA] transition-colors shrink-0"
                >
                    <Minus className="size-4" />
                </button>
            </div>

            {/* Water Tank */}
            <div className="relative w-full h-24 mx-auto border-2 border-[#C7D0DA] rounded-2xl overflow-hidden bg-white/50 flex items-center justify-center">
                
                {/* Percentage INSIDE the tank, always centered */}
                <span className="relative z-10 text-3xl font-black text-slate-900 tracking-tighter">
                    {iotLevel}%
                </span>

                {/* Water level fill */}
                <div 
                    className="absolute bottom-0 left-0 w-full transition-all duration-700 ease-in-out z-0 opacity-80"
                    style={{ 
                        height: `${iotLevel}%`,
                        backgroundColor: currentStyle.fill,
                        boxShadow: `0 -4px 10px ${currentStyle.fill}20`
                    }}
                >
                    {/* Surface highlight line */}
                    <div className="w-full h-1 bg-white/40 absolute top-0 left-0"></div>
                </div>
            </div>
        </div>
    );
}
