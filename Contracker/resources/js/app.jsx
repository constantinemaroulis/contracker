import '../css/app.css';
import './bootstrap';

import { createInertiaApp } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { createRoot } from 'react-dom/client';
import { v4 as uuidv4 } from 'uuid';
import axios from 'axios';
import React, { useState, useEffect } from 'react';
import './echo';
import BroadcastConnectionStatus from './Components/BroadcastConnectionStatus';

const appName = import.meta.env.VITE_APP_NAME || 'Contracker Beta';

// This hook can remain to manage the online status for the heartbeat
function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);
  return isOnline;
}

// This hook manages the device heartbeat
function useDeviceHeartbeat() {
  const uuid = localStorage.getItem('device_uuid');
  const isOnline = useOnlineStatus();
  useEffect(() => {
    if (!uuid) return;
    const sendPing = () => {
        if (navigator.onLine) {
            axios.post(route('session.device.ping'), { uuid }).catch(console.error);
        }
    };
    sendPing(); // Initial ping
    const interval = setInterval(sendPing, 60000); // Ping every 60 seconds
    return () => clearInterval(interval);
  }, [uuid, isOnline]);
}

// Registers the device and sets up location watching
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
        axios.post(route('session.registerDevice'), { uuid, latitude, longitude, accuracy })
             .catch(err => console.error('API submission error:', err));
      },
      (error) => console.error('Geolocation failed:', error),
      { enableHighAccuracy: true, timeout: 30000, maximumAge: 0 }
    );
  } else {
    console.warn('Geolocation not supported.');
  }
}

// This hook simulates the tracked device popping up a chat
function useDeviceCommandListener() {
    useEffect(() => {
        const uuid = localStorage.getItem('device_uuid');
        if (!uuid) {
            console.log('DEBUG (Remote Device): No device_uuid found. Command listener not starting.');
            return;
        }

        console.log(`DEBUG (Remote Device): Found UUID ${uuid}. Attempting to subscribe to private channel device.${uuid}`);

        // Listen for subscription success
        window.Echo.private(`device.${uuid}`)
            .on('pusher:subscription_succeeded', () => {
                console.log(`DEBUG (Remote Device): Successfully subscribed to channel: device.${uuid}`);
            })
            .on('pusher:subscription_error', (status) => {
                console.error(`DEBUG (Remote Device): FAILED to subscribe to channel device.${uuid}. Status:`, status);
                alert(`Could not connect to the chat server. Status: ${status.status}. Please check console for details.`);
            })
            .listen('.DeviceCommand', (e) => {
                console.log('DEBUG (Remote Device): Received a DeviceCommand event!', e);
                if (e.command === 'message' && e.payload.message) {
                    console.log('DEBUG (Remote Device): Message received, showing alert.');
                    alert(`Message from dashboard: ${e.payload.message}`);
                }
            });

        return () => {
            console.log(`DEBUG (Remote Device): Leaving channel device.${uuid}`);
            window.Echo.leave(`device.${uuid}`);
        };
    }, []);
}

// Wrapper for hooks that should run on the client device being tracked
function AppWrapper({ children }) {
    useDeviceHeartbeat();
    useDeviceCommandListener();
    return children;
}

window.addEventListener('load', () => {
  registerDeviceOnLoad();
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/service-worker.js')
      .then(reg => console.log('Service Worker registered.', reg))
      .catch(err => console.error('Service Worker registration failed:', err));
  }
});

createInertiaApp({
  title: (title) => `${title} - ${appName}`,
  resolve: (name) =>
    resolvePageComponent(`./Pages/${name}.jsx`, import.meta.glob('./Pages/**/*.jsx')),
  setup({ el, App, props }) {
    if (!el.hasChildNodes()) { // Ensure we don't re-render over existing content
        const root = createRoot(el);
        root.render(
            <AppWrapper>
                <App {...props} />
                <BroadcastConnectionStatus />
            </AppWrapper>
        );
    }
  },
  progress: {
    color: '#4B5563',
  },
});