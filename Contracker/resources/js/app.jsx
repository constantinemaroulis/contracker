import '../css/app.css';
import './bootstrap';

import { createInertiaApp } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { createRoot } from 'react-dom/client';
import { Ziggy } from './ziggy'; // Ensure Ziggy config is correctly imported
import { route } from 'ziggy-js';
import { v4 as uuidv4 } from 'uuid';
import axios from 'axios';

// Register a heartbeat to keep the device session alive
function useDeviceHeartbeat() {
    const uuid = localStorage.getItem('device_uuid');
    
    if (!uuid) return;

    const interval = setInterval(() => {
      axios.post(route('session.device.ping'), { uuid }).catch(console.error);
    }, 20_000); // 1 minutes in milliseconds

    return () => clearInterval(interval);
}

// Register device with a unique UUID and geolocation data
function registerDeviceOnLoad() {
    let uuid = localStorage.getItem('device_uuid');

    if (!uuid) {
        uuid = uuidv4();
        localStorage.setItem('device_uuid', uuid);
    }

    if ('geolocation' in navigator) {
            navigator.geolocation.watchPosition(
                (position) => {
                    const { latitude, longitude, accuracy } = position.coords;

                    // Save to localStorage for quick frontend access
                    localStorage.setItem(`${uuid}_lat`, latitude.toString());
                    localStorage.setItem(`${uuid}_lng`, longitude.toString());

                    // Send to backend
                    axios.post(route('session.registerDevice'), {
                        uuid,
                        latitude,
                        longitude,
                        accuracy,
                    }).then(() => {
                        console.log(`Location submitted successfully with ${accuracy.toFixed(2)}m accuracy. Map will continue to update.`);
                        // setSubmitted(true); // Prevent re-posting for this component instance
                    }).catch(err => {
                        console.error('API submission error:', err);
                        // setStatusMessage(`Failed to submit location: ${err.message}. Current accuracy: ${currentAccuracy.toFixed(2)}m.`);
                        // Consider retry logic or other error handling here if needed
                    });
                },
                (error) => {
                    console.error('Geolocation failed:', error);
                },
                {
                    enableHighAccuracy: true,
                    timeout: 30000,
                    maximumAge: 0,
                }
            );
    } else {
        console.warn('Geolocation not supported on this device.');
    }

    return uuid;
}

// Register device and service worker on app load
window.addEventListener('load', () => {
    registerDeviceOnLoad();

    if ('serviceWorker' in navigator) {
        navigator.serviceWorker
            .register('/service-worker.js')
            .then((registration) => {
                console.log('Service Worker registered with scope:', registration.scope);
            })
            .catch((error) => {
                console.error('Service Worker registration failed:', error);
            });
    }
});

const appName = import.meta.env.VITE_APP_NAME || 'Contracker Beta';



createInertiaApp({
    title: (title) => `${title} - ${appName}`,
    resolve: (name) =>
        resolvePageComponent(
            `./Pages/${name}.jsx`,
            import.meta.glob('./Pages/**/*.jsx'),
        ),
    setup({ el, App, props }) {
        // Register heartbeat
        useDeviceHeartbeat();
        
        const root = createRoot(el);

        root.render(<App {...props} />);
    },
    progress: {
        color: '#4B5563',
    },
});
