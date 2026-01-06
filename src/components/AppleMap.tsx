
import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';

interface Hospital {
    place_id: string;
    name: string;
    vicinity: string;
    rating: number;
    geometry: {
        location: {
            lat: number;
            lng: number;
        };
    };
}

interface AppleMapProps {
    onHospitalsFound: (hospitals: Hospital[]) => void;
}

declare global {
    interface Window {
        mapkit: any;
    }
}

export const AppleMap = ({ onHospitalsFound }: AppleMapProps) => {
    const mapContainer = useRef<HTMLDivElement>(null);
    const [map, setMap] = useState<any>(null);
    const [userLocation, setUserLocation] = useState<string>('');
    const [isMockMode, setIsMockMode] = useState(false);

    useEffect(() => {
        const initMap = async () => {
            const token = import.meta.env.VITE_APPLE_MAPS_TOKEN || '';

            // MOCK MODE: If no token, use mock data
            if (!token || token === 'YOUR_APPLE_MAPS_TOKEN') {
                setIsMockMode(true);
                console.log("Using Mock Maps Data (Apple Maps)");
                toast.info("Using Mock Data (No Apple Maps Token provided)");

                setTimeout(() => {
                    const mockHospitals: Hospital[] = [
                        {
                            place_id: '1',
                            name: 'City General Hospital',
                            vicinity: '123 Healthcare Ave, Metro City',
                            rating: 4.5,
                            geometry: { location: { lat: 40.7128, lng: -74.0060 } }
                        },
                        {
                            place_id: '2',
                            name: 'St. Mary\'s Medical Center',
                            vicinity: '456 Wellness Blvd, Metro City',
                            rating: 4.2,
                            geometry: { location: { lat: 40.7138, lng: -74.0070 } }
                        },
                        {
                            place_id: '3',
                            name: 'Community Clinic',
                            vicinity: '789 Care Lane, Metro City',
                            rating: 4.8,
                            geometry: { location: { lat: 40.7118, lng: -74.0050 } }
                        }
                    ];
                    onHospitalsFound(mockHospitals);
                    setUserLocation("Metro City, Mock Location");
                }, 1000);
                return;
            }

            try {
                if (!window.mapkit) {
                    console.error("MapKit JS not loaded");
                    return;
                }

                window.mapkit.init({
                    authorizationCallback: function (done: any) {
                        done(token);
                    }
                });

                if (!mapContainer.current) return;

                // Get user location
                if (navigator.geolocation) {
                    navigator.geolocation.getCurrentPosition(
                        (position) => {
                            const { latitude, longitude } = position.coords;
                            const center = new window.mapkit.Coordinate(latitude, longitude);
                            const region = new window.mapkit.CoordinateRegion(
                                center,
                                new window.mapkit.CoordinateSpan(0.05, 0.05)
                            );

                            const mapInstance = new window.mapkit.Map(mapContainer.current, {
                                center: center,
                                region: region,
                                showsUserLocation: true,
                                showsUserLocationControl: true
                            });

                            setMap(mapInstance);

                            // Search for hospitals
                            const search = new window.mapkit.Search({ region: region });
                            search.search("hospital", (error: any, data: any) => {
                                if (error) {
                                    console.error("Apple Maps Search Error:", error);
                                    return;
                                }

                                if (data && data.places) {
                                    const hospitals: Hospital[] = data.places.slice(0, 10).map((place: any) => ({
                                        place_id: place.uID || Math.random().toString(),
                                        name: place.name,
                                        vicinity: place.formattedAddress,
                                        rating: 4.0, // Apple Maps doesn't always return rating in basic search
                                        geometry: {
                                            location: {
                                                lat: place.coordinate.latitude,
                                                lng: place.coordinate.longitude
                                            }
                                        }
                                    }));

                                    onHospitalsFound(hospitals);

                                    // Add annotations
                                    const annotations = data.places.map((place: any) => {
                                        const marker = new window.mapkit.MarkerAnnotation(place.coordinate, {
                                            title: place.name,
                                            subtitle: place.formattedAddress,
                                            color: "#ef4444"
                                        });
                                        return marker;
                                    });
                                    mapInstance.showItems(annotations);
                                }
                            });

                            // Reverse geocode for user location name
                            const geocoder = new window.mapkit.Geocoder();
                            geocoder.reverseLookup(new window.mapkit.Coordinate(latitude, longitude), (error: any, data: any) => {
                                if (!error && data && data.results && data.results[0]) {
                                    const locName = data.results[0].formattedAddress;
                                    setUserLocation(locName);
                                    toast.success(`Location detected: ${locName}`);
                                }
                            });
                        },
                        (error) => {
                            console.error("Geolocation error:", error);
                            toast.error("Unable to get location.");
                        }
                    );
                }

            } catch (error) {
                console.error('Error initializing Apple Maps:', error);
                toast.error('Error initializing Apple Maps. Check your token.');
            }
        };

        initMap();
    }, [onHospitalsFound]);

    return (
        <div className="space-y-4">
            {userLocation && (
                <div className="text-sm text-muted-foreground bg-card p-3 rounded-lg">
                    📍 Current location: {userLocation}
                </div>
            )}
            {isMockMode ? (
                <div className="w-full h-64 rounded-lg border bg-muted flex items-center justify-center flex-col gap-2">
                    <p className="text-muted-foreground font-medium">Apple Maps Unavailable (Mock Mode)</p>
                    <p className="text-xs text-muted-foreground">Showing simulated nearby hospitals</p>
                </div>
            ) : (
                <div ref={mapContainer} className="w-full h-64 rounded-lg border" />
            )}
        </div>
    );
};
