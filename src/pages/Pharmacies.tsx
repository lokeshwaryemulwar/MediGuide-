
import { useState } from 'react';
import { Header } from '@/components/Header';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, MapPin, Clock } from 'lucide-react';

export const Pharmacies = () => {
  const [searchQuery, setSearchQuery] = useState('');

  const pharmacies = [
    {
      name: 'CVS Pharmacy',
      address: '123 Main St',
      hours: 'Open • Closes 9PM',
      distance: '0.3 miles',
      status: 'open'
    },
    {
      name: 'Walgreens',
      address: '456 Oak Ave',
      hours: 'Open • Closes 10PM',
      distance: '0.7 miles',
      status: 'open'
    },
    {
      name: 'Rite Aid',
      address: '789 Pine St',
      hours: 'Closed • Opens 8AM',
      distance: '1.2 miles',
      status: 'closed'
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header title="Pharmacies" showBack />

      <div className="p-4 space-y-6">
        {/* Search Section */}
        <div className="relative animate-fade-up">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 py-3 bg-card border-border text-foreground"
          />
        </div>

        {/* Map Section */}
        <Card className="glass-card animate-fade-up" style={{ animationDelay: '100ms' }}>
          <CardContent className="p-0">
            <div className="h-48 bg-gradient-to-br from-orange-400/20 to-red-500/20 rounded-lg relative overflow-hidden">
              {/* Map Placeholder */}
              <div className="absolute inset-0 opacity-30">
                <svg className="w-full h-full" viewBox="0 0 400 200">
                  <defs>
                    <pattern id="pharmacyGrid" width="15" height="15" patternUnits="userSpaceOnUse">
                      <path d="M 15 0 L 0 0 0 15" fill="none" stroke="currentColor" strokeWidth="0.3"/>
                    </pattern>
                  </defs>
                  <rect width="100%" height="100%" fill="url(#pharmacyGrid)" />
                </svg>
              </div>
              
              {/* Pharmacy Markers */}
              <div className="absolute top-1/4 left-1/4 w-3 h-3 bg-orange-400 rounded-full animate-pulse-soft"></div>
              <div className="absolute top-2/3 right-1/4 w-3 h-3 bg-orange-400 rounded-full animate-pulse-soft"></div>
              <div className="absolute bottom-1/4 left-2/3 w-3 h-3 bg-orange-400 rounded-full animate-pulse-soft"></div>
            </div>
          </CardContent>
        </Card>

        {/* Nearby Pharmacies */}
        <div className="space-y-3 animate-fade-up" style={{ animationDelay: '200ms' }}>
          <h4 className="font-semibold text-foreground">Nearby Pharmacies</h4>
          {pharmacies.map((pharmacy, index) => (
            <Card key={index} className="glass-card hover:bg-card/70 transition-all duration-200">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <div className="w-12 h-12 bg-orange-500/10 rounded-lg flex items-center justify-center">
                        <span className="text-orange-400 font-bold text-sm">Rx</span>
                      </div>
                      <div>
                        <h5 className="font-semibold text-foreground">{pharmacy.name}</h5>
                        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                          <Clock className="h-4 w-4" />
                          <span>{pharmacy.hours}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-muted-foreground ml-15">
                      <MapPin className="h-4 w-4" />
                      <span>{pharmacy.address} • {pharmacy.distance}</span>
                    </div>
                  </div>
                  <Badge 
                    variant="secondary"
                    className={
                      pharmacy.status === 'open' 
                        ? 'bg-green-500/10 text-green-400 border-green-500/20'
                        : 'bg-red-500/10 text-red-400 border-red-500/20'
                    }
                  >
                    {pharmacy.status}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};
