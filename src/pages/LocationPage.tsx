// Location Selection Page with shadcn/Tailwind
import { useNavigate } from 'react-router-dom';
import { useApp } from '../store';
import { LOCATIONS } from '../data/locations';
import type { Location } from '../types/app';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft, MapPin, ChevronRight, Info } from 'lucide-react';

export function LocationPage() {
    const navigate = useNavigate();
    const { setLocation } = useApp();

    const handleSelectLocation = (location: Location) => {
        setLocation(location);
        navigate('/prediction');
    };

    return (
        <div className="min-h-dvh flex flex-col bg-background">
            {/* Header */}
            <header className="p-6 pt-[calc(1.5rem+var(--safe-top))] bg-card border-b border-border">
                <Button
                    variant="secondary"
                    size="icon"
                    className="mb-4 rounded-xl"
                    onClick={() => navigate('/')}
                >
                    <ArrowLeft className="size-5" />
                </Button>
                <div>
                    <h1 className="text-2xl font-bold">Select Location</h1>
                    <p className="text-muted-foreground text-sm">Choose your area for flood predictions</p>
                </div>
            </header>

            {/* Location Cards */}
            <main className="flex-1 p-6 overflow-y-auto">
                <div className="flex flex-col gap-4 max-w-xl mx-auto">
                    {LOCATIONS.map((location, index) => (
                        <Card
                            key={location.id}
                            className="group cursor-pointer bg-card border-border hover:bg-muted hover:border-primary transition-all duration-200 hover:translate-x-1"
                            onClick={() => handleSelectLocation(location)}
                            style={{ animationDelay: `${index * 0.1}s` }}
                        >
                            <CardContent className="p-5 flex items-center gap-4">
                                <div className="size-13 flex items-center justify-center bg-primary/15 rounded-xl text-primary shrink-0">
                                    <MapPin className="size-6" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className="text-lg font-semibold truncate">{location.name}</h3>
                                    <span className="text-sm text-muted-foreground">{location.region}</span>
                                </div>
                                <div className="text-muted-foreground group-hover:text-primary transition-colors">
                                    <ChevronRight className="size-5" />
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Info Card */}
                <Card className="mt-6 max-w-xl mx-auto bg-primary/10 border-primary/30">
                    <CardContent className="p-5 flex gap-4">
                        <div className="text-primary shrink-0">
                            <Info className="size-6" />
                        </div>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                            Your location is used to provide accurate flood predictions and find nearby emergency shelters.
                        </p>
                    </CardContent>
                </Card>
            </main>
        </div>
    );
}
