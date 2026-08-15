import React from 'react';
import { MainLayout } from '../components/layout/MainLayout';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { LatLngTuple } from 'leaflet';

export const MapsPage: React.FC = () => {
  const center: LatLngTuple = [20.1809, 85.8245]; // Bhubaneswar

  return (
    <MainLayout>
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Interactive Maps</h1>
          <p className="text-gray-600">Explore all verified destinations across India on an interactive map.</p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden" style={{ height: '600px' }}>
          <MapContainer center={center} zoom={13} scrollWheelZoom={false} style={{ height: '100%', width: '100%' }}>
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <Marker position={center}>
              <Popup>
                <div className="text-center">
                  <p className="font-bold">Bhubaneswar</p>
                  <p className="text-xs text-gray-600">Odisha, India</p>
                </div>
              </Popup>
            </Marker>
          </MapContainer>
        </div>

        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <h3 className="font-bold text-gray-900 mb-2">28 States & UTs</h3>
            <p className="text-sm text-gray-600">Covered with verified data</p>
          </div>
          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <h3 className="font-bold text-gray-900 mb-2">1,240+ Destinations</h3>
            <p className="text-sm text-gray-600">Fully audited and verified</p>
          </div>
          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <h3 className="font-bold text-gray-900 mb-2">Real-time Updates</h3>
            <p className="text-sm text-gray-600">Live weather & conditions</p>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};
