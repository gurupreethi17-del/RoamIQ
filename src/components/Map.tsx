import React from 'react';
import { Attraction, Location } from '../types';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix leaflet icon issue in Next/React
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const customHotelIcon = new L.Icon({
    iconUrl: 'https://cdn.rawgit.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-gold.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

interface MapProps {
    center: Location;
    attractions: Attraction[];
    hotelLocation?: Location | null;
    currentLocation?: Location | null;
    routePath?: Location[];
}

const TripMap: React.FC<MapProps> = ({ center, attractions, hotelLocation, currentLocation, routePath }) => {
    if (!center || typeof center.lat === 'undefined') return null;
    return (
        <div className="w-full h-full rounded-3xl overflow-hidden shadow-2xl border border-white/10 relative z-10">
            <MapContainer
                center={[center.lat, center.lng]}
                zoom={13}
                scrollWheelZoom={true}
                style={{ height: '100%', width: '100%' }}
            >
                {/* Using standard OpenStreetMap tiles which are free and require no API key */}
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                {currentLocation && (
                    <Marker position={[currentLocation.lat, currentLocation.lng]}>
                        <Popup>
                            <strong>Your Starting Location</strong>
                        </Popup>
                    </Marker>
                )}

                {hotelLocation && (
                    <Marker position={[hotelLocation.lat, hotelLocation.lng]} icon={customHotelIcon}>
                        <Popup>
                            <strong>Selected Hotel</strong>
                        </Popup>
                    </Marker>
                )}

                {attractions.map((attraction) => {
                    if (!attraction?.location?.lat) return null;
                    return (
                        <Marker key={attraction.id} position={[attraction.location.lat, attraction.location.lng]}>
                            <Popup>
                                <div className="text-black">
                                    <strong className="block text-sm">{attraction.name}</strong>
                                    <span className="text-xs text-gray-600 block">{attraction.category}</span>
                                    <span className="text-xs font-bold text-iqoo-yellow">entry: ₹{attraction.entryCost}</span>
                                </div>
                            </Popup>
                        </Marker>
                    );
                })}

                {routePath && routePath.filter(p => p && typeof p.lat !== 'undefined').length > 1 && (
                    <Polyline
                        positions={routePath.filter(p => p && typeof p.lat !== 'undefined').map(pos => [pos.lat, pos.lng])}
                        color="#FFC800"
                        weight={3}
                        dashArray="10, 10"
                    />
                )}
            </MapContainer>
        </div>
    );
};

export default TripMap;
