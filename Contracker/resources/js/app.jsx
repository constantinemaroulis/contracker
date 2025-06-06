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
import RemoteChatManager from './Components/RemoteChatManager';

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
    sendPing();
    const interval = setInterval(sendPing, 60000);
    return () => clearInterval(interval);
  }, [uuid, isOnline]);
}

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



window.addEventListener('load', () => {
  registerDeviceOnLoad();
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/service-worker.js')
      .then(reg => console.log('Service Worker registered.', reg))
      .catch(err => console.error('Service Worker registration failed:', err));
  }
});

const appName = import.meta.env.VITE_APP_NAME || 'Contracker';

function AppWrapper({ children }) {
    useDeviceHeartbeat();
    return (
        <>
            {children}
            <RemoteChatManager /> {/* 👈 Add the manager here */}
            <BroadcastConnectionStatus />
        </>
    );
    return children;
}

createInertiaApp({
  title: (title) => `${title} - ${appName}`,
  resolve: (name) =>
    resolvePageComponent(`./Pages/${name}.jsx`, import.meta.glob('./Pages/**/*.jsx')),
  setup({ el, App, props }) {
    const root = createRoot(el);
    root.render(
        <AppWrapper>
            <App {...props} />
            <BroadcastConnectionStatus />
        </AppWrapper>
    );
  },
  progress: {
    color: '#4B5563',
  },
});