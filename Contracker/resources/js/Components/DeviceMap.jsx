import 'leaflet/dist/leaflet.css';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet'; // Added Circle
import L from 'leaflet';

// Fix for default Leaflet icon paths
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.3/dist/images/marker-shadow.png',
});

export default function DeviceMap() {
  const [coords, setCoords] = useState(null);
  const [accuracy, setAccuracy] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [statusMessage, setStatusMessage] = useState('Initializing location services...'); // More descriptive status

  // Configurable parameters
  const desiredAccuracyThreshold = 30; // Target accuracy in meters
  const geolocationTimeout = 30000; // Increased timeout for acquiring a better fix (30 seconds)

  useEffect(() => {
    const uuid = localStorage.getItem('device_uuid');
    if (!uuid) {
      setStatusMessage('Device UUID not found. Location tracking disabled.');
      return;
    }

    if (!navigator.geolocation) {
      setStatusMessage('Geolocation is not supported by your browser.');
      return;
    }

    setStatusMessage('Attempting to get your location. This may take a moment...');

    const watcher = navigator.geolocation.watchPosition(
      (position) => {
        const { latitude, longitude, accuracy: currentAccuracy } = position.coords;
        setCoords({ lat: latitude, lng: longitude });
        setAccuracy(currentAccuracy);

        let currentStatus = `Location updated. Current accuracy: ${currentAccuracy.toFixed(2)} meters.`;

        if (currentAccuracy <= desiredAccuracyThreshold && !submitted) {
          currentStatus = `High accuracy (${currentAccuracy.toFixed(2)}m) achieved. Submitting location...`;
          setStatusMessage(currentStatus);

          // localStorage.setItem(`${uuid}_lat`, latitude.toString(2); // Ensure string storage
          // localStorage.setItem(`${uuid}_lng`, longitude.toString(2)); // Ensure string storage
          localStorage.setItem(`${uuid}_lat`, latitude.toFixed(9));
          localStorage.setItem(`${uuid}_lng`, longitude.toFixed(9));

          /*
          axios.post('/session/device', {
            uuid,
            latitude,
            longitude,
            accuracy: currentAccuracy,
          })
          .then(() => {
            setStatusMessage(`Location submitted successfully with ${currentAccuracy.toFixed(2)}m accuracy. Map will continue to update.`);
            setSubmitted(true); // Prevent re-posting for this component instance
          })
          .catch(err => {
            console.error('API submission error:', err);
            setStatusMessage(`Failed to submit location: ${err.message}. Current accuracy: ${currentAccuracy.toFixed(2)}m.`);
            // Consider retry logic or other error handling here if needed
          });
          */

        } else if (currentAccuracy > desiredAccuracyThreshold && !submitted) {
          currentStatus = `Improving accuracy... Current: ${currentAccuracy.toFixed(2)}m. Target: < ${desiredAccuracyThreshold}m.`;
          setStatusMessage(currentStatus);
        } else if (submitted) {
          currentStatus = `Location already submitted. Map is live. Current accuracy: ${currentAccuracy.toFixed(2)}m.`;
          setStatusMessage(currentStatus);
        }
      },
      (err) => {
        console.error('Geolocation error:', err);
        let message = 'Error getting location: ';
        switch (err.code) {
          case err.PERMISSION_DENIED:
            message += 'Permission denied. Please enable precise location services for this site in your browser settings.';
            break;
          case err.POSITION_UNAVAILABLE:
            message += 'Location information is unavailable. Ensure GPS is enabled and you have network connectivity.';
            break;
          case err.TIMEOUT:
            message += `Could not get a location fix within ${geolocationTimeout / 1000} seconds. The accuracy target of < ${desiredAccuracyThreshold}m was not met.`;
            // You could try navigator.geolocation.getCurrentPosition with enableHighAccuracy:false here as a fallback for a less accurate position if needed.
            break;
          default:
            message += 'An unknown error occurred while trying to get location.';
            break;
        }
        setStatusMessage(message);
      },
      {
        enableHighAccuracy: true, // Crucial for best possible accuracy
        maximumAge: 0,          // Force a fresh location, don't use a cached one
        timeout: geolocationTimeout, // Allow more time for a high-accuracy fix
      }
    );

    // Cleanup watcher when the component unmounts
    return () => {
      navigator.geolocation.clearWatch(watcher);
      setStatusMessage("Location tracking stopped.");
    };
  }, []); // Empty dependency array: effect runs once on mount and cleans up on unmount

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Device Location Tracker</h3>
      <p><strong>Status:</strong> {statusMessage}</p>
      {accuracy !== null && (
        <p>
          <strong>Current Accuracy:</strong> {accuracy.toFixed(2)} meters
          {!submitted && accuracy > desiredAccuracyThreshold && ` (Target: < ${desiredAccuracyThreshold}m)`}
          {submitted && ` (Initial high-accuracy location submitted)`}
        </p>
      )}
      {coords ? (
        <MapContainer center={[coords.lat, coords.lng]} zoom={16} style={{ height: '450px', width: '100%' }}>
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <Marker position={[coords.lat, coords.lng]}>
            <Popup>
              Current Device Location <br />
              Lat: {coords.lat.toFixed(9)}, Lng: {coords.lng.toFixed(9)} <br />
              Accuracy: {accuracy ? accuracy.toFixed(2) + 'm' : 'N/A'}
            </Popup>
          </Marker>
          {/* Visualize accuracy radius */}
          {accuracy !== null && (
            <Circle
              center={[coords.lat, coords.lng]}
              radius={accuracy}
              pathOptions={{ color: 'blue', fillColor: 'blue', fillOpacity: 0.1 }}
            />
          )}
        </MapContainer>
      ) : (
        <p>Waiting for an initial location fix to display the map...</p>
      )}
    </div>
  );
}