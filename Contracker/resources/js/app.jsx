import '../css/app.css';
import './bootstrap';

import { createInertiaApp } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { createRoot } from 'react-dom/client';
import { v4 as uuidv4 } from 'uuid';
import axios from 'axios';
import React, { useState, useEffect } from 'react';
import './echo';

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
        if (!uuid) return;
        window.Echo.private(`device.${uuid}`)
            .listen('.DeviceCommand', (e) => {
                if (e.command === 'message' && e.payload.message) {
                    alert(`Message from dashboard: ${e.payload.message}`);
                }
            });
        return () => {
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

const appName = import.meta.env.VITE_APP_NAME || 'Contracker';

createInertiaApp({
  title: (title) => `${title} - ${appName}`,
  resolve: (name) =>
    resolvePageComponent(`./Pages/${name}.jsx`, import.meta.glob('./Pages/**/*.jsx')),
  setup({ el, App, props }) {
    createRoot(el).render(
      <AppWrapper>
        <App {...props} />
      </AppWrapper>
    );
  },
  progress: {
    color: '#4B5563',
  },
});