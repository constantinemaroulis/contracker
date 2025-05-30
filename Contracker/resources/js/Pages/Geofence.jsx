import 'leaflet/dist/leaflet.css';
import { useEffect, useState, useRef } from 'react';
import { usePage } from '@inertiajs/react';
import axios from 'axios';
import { MapContainer, TileLayer, Polygon, useMapEvents } from 'react-leaflet';

// Helper component that sets up map click events.
function MapEventHandler({ setBoundary }) {
  useMapEvents({
    click: (event) => {
      const { lat, lng } = event.latlng;
      setBoundary(prev => [...prev, [lat, lng]]);
    }
  });
  return null;
}

export default function Geofence() {
  const { jobId } = usePage().props;
  const [jobLocation, setJobLocation] = useState(null);
  const [boundary, setBoundary] = useState([]);
  const mapRef = useRef(null);

  useEffect(() => {
    async function fetchJobLocation() {
      try {
        const response = await axios.get(`/session/job-location/${jobId}`);
        setJobLocation(response.data.location);

        if (location.geofence && location.geofence.boundary_points) {
          let points = location.geofence.boundary_points;
          if (typeof points === 'string') {
            try {
              points = JSON.parse(points);
            } catch (e) {
              console.error('Error parsing boundary points:', e);
            }
          }
          setBoundary(points);
        }
      } catch (error) {
        console.error('Error fetching job location:', error);
      }
    }
    fetchJobLocation();
  }, [jobId]);

  const saveGeofence = async () => {
    try {
      if (!jobLocation) {
        alert("Job location is not loaded yet!");
        return;
      }
      await axios.post('/session/save-geofence', {
        job_location_id: jobLocation.id,
        boundary_points: JSON.stringify(boundary)
      });
      alert('Geofence saved!');
    } catch (error) {
      console.error('Error saving geofence:', error);
    }
  };

  return (
    <div className="container">
      <h2 className="text-lg font-bold">Geofence Setup for Job {jobId}</h2>
      {jobLocation ? (
        <MapContainer
          center={[jobLocation.latitude, jobLocation.longitude]}
          zoom={16}
          style={{ height: '400px', width: '100%' }}
          ref={mapRef}
        >
          <TileLayer
            attribution='&copy; OpenStreetMap contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <MapEventHandler setBoundary={setBoundary} />
          {boundary.length > 0 && <Polygon positions={boundary} color="red" />}
        </MapContainer>
      ) : (
        <p>Loading job location...</p>
      )}
      <button onClick={saveGeofence} className="btn btn-primary mt-4">
        Save Geofence
      </button>
    </div>
  );
}