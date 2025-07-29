import 'leaflet/dist/leaflet.css';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { MapContainer, TileLayer, Polygon, Popup } from 'react-leaflet';
import AppLayout from '@/Layouts/AppLayout';

export default function GeofenceAdmin() {
  const [geofences, setGeofences] = useState([]);

  useEffect(() => {
    axios.get('/session/geofences').then(r => setGeofences(r.data));
  }, []);

  const center = geofences.length > 0
    ? [geofences[0].latitude, geofences[0].longitude]
    : [0, 0];

  return (
    <AppLayout header={<h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">Geofences</h2>}>
      <div className="p-4">
        <MapContainer center={center} zoom={6} style={{ height: '600px', width: '100%' }}>
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          {geofences.map(f => {
            let points = f.boundary_points;
            if (typeof points === 'string') {
              try { points = JSON.parse(points); } catch (e) { points = []; }
            }
            return (
              <Polygon key={f.job_id} positions={points} color="blue">
                <Popup>{f.job_no || 'Job ' + f.job_id}</Popup>
              </Polygon>
            );
          })}
        </MapContainer>
      </div>
    </AppLayout>
  );
}
