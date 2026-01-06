
import { useEffect, useRef, useState } from 'react';
import { Loader } from '@googlemaps/js-api-loader';
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

interface GoogleMapProps {
  onHospitalsFound: (hospitals: Hospital[]) => void;
}

export const GoogleMap = ({ onHospitalsFound }: GoogleMapProps) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [userLocation, setUserLocation] = useState<string>('');

  const [isMockMode, setIsMockMode] = useState(false);

  useEffect(() => {
    const initMap = async () => {
      const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || ''; // Use VITE_ prefix for Vite

      // MOCK MODE: If no API key or placeholder, use mock data
      if (!apiKey || apiKey === 'YOUR_GOOGLE_MAPS_API_KEY') {
        setIsMockMode(true);
        console.log("Using Mock Maps Data");
        toast.info("Using Mock Data (No API Key provided)");

        // Simulate loading delay
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

      const loader = new Loader({
        apiKey: apiKey,
        version: 'weekly',
        libraries: ['places']
      });

      try {
        await loader.load();

        if (!mapRef.current) return;

        // Get user's current location
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            async (position) => {
              const { latitude, longitude } = position.coords;

              const mapInstance = new google.maps.Map(mapRef.current!, {
                center: { lat: latitude, lng: longitude },
                zoom: 15,
                styles: [
                  {
                    featureType: 'poi.medical',
                    elementType: 'geometry',
                    stylers: [{ color: '#ff6b6b' }]
                  }
                ]
              });

              setMap(mapInstance);

              // Add marker for user location
              new google.maps.Marker({
                position: { lat: latitude, lng: longitude },
                map: mapInstance,
                title: 'Your Location',
                icon: {
                  url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <circle cx="12" cy="12" r="8" fill="#3b82f6"/>
                      <circle cx="12" cy="12" r="3" fill="white"/>
                    </svg>
                  `),
                  scaledSize: new google.maps.Size(24, 24)
                }
              });

              // Get location name using reverse geocoding
              const geocoder = new google.maps.Geocoder();
              geocoder.geocode(
                { location: { lat: latitude, lng: longitude } },
                (results, status) => {
                  if (status === 'OK' && results?.[0]) {
                    const locationName = results[0].formatted_address;
                    setUserLocation(locationName);
                    toast.success(`Location detected: ${locationName}`);
                  }
                }
              );

              // Search for nearby hospitals
              const service = new google.maps.places.PlacesService(mapInstance);
              const request: google.maps.places.PlaceSearchRequest = {
                location: { lat: latitude, lng: longitude },
                radius: 5000, // 5km radius
                type: 'hospital'
              };

              service.nearbySearch(request, (results, status) => {
                if (status === google.maps.places.PlacesServiceStatus.OK && results) {
                  const hospitals: Hospital[] = results.slice(0, 10).map(place => ({
                    place_id: place.place_id!,
                    name: place.name!,
                    vicinity: place.vicinity!,
                    rating: place.rating || 0,
                    geometry: {
                      location: {
                        lat: place.geometry!.location!.lat(),
                        lng: place.geometry!.location!.lng()
                      }
                    }
                  }));

                  onHospitalsFound(hospitals);

                  // Add markers for hospitals
                  hospitals.forEach(hospital => {
                    const marker = new google.maps.Marker({
                      position: hospital.geometry.location,
                      map: mapInstance,
                      title: hospital.name,
                      icon: {
                        url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
                          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 2L13.09 8.26L22 9L13.09 9.74L12 16L10.91 9.74L2 9L10.91 8.26L12 2Z" fill="#ef4444"/>
                          </svg>
                        `),
                        scaledSize: new google.maps.Size(24, 24)
                      }
                    });

                    const infoWindow = new google.maps.InfoWindow({
                      content: `
                        <div>
                          <h3>${hospital.name}</h3>
                          <p>${hospital.vicinity}</p>
                          <p>Rating: ${hospital.rating}/5</p>
                        </div>
                      `
                    });

                    marker.addListener('click', () => {
                      infoWindow.open(mapInstance, marker);
                    });
                  });
                }
              });
            },
            (error) => {
              console.error('Error getting location:', error);
              toast.error('Unable to get your location. Please enable location services.');
            }
          );
        }
      } catch (error) {
        console.error('Error loading Google Maps:', error);
        toast.error('Error loading Google Maps. Please check your API key.');
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
          <p className="text-muted-foreground font-medium">Map Unavailable (Mock Mode)</p>
          <p className="text-xs text-muted-foreground">Showing simulated nearby hospitals</p>
        </div>
      ) : (
        <div ref={mapRef} className="w-full h-64 rounded-lg border" />
      )}
    </div>
  );
};
