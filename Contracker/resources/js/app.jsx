import '../css/app.css';
import './bootstrap';

import { createInertiaApp } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { createRoot } from 'react-dom/client';
import { Ziggy } from './ziggy';
import { route } from 'ziggy-js';
import { v4 as uuidv4 } from 'uuid';
import axios from 'axios';
import React, { useState, useEffect } from 'react';
import './echo';
import ChatMessages from './Components/ChatMessages';
import ChatInput from './Components/ChatInput';


function useDeviceEchoListener() {
  useEffect(() => {
    const uuid = localStorage.getItem('device_uuid');
    if (!uuid) return;

    window.Echo.private(`device.${uuid}`)
      .listen('.DeviceMessage', (e) => {
        alert(`Message received: ${e.message}`);
      });

    return () => {
      window.Echo.leave(`device.${uuid}`);
    };
  }, []);
}



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
  console.log(isOnline ? 'Device is online' : 'Device is offline');


  useEffect(() => {
    if (!uuid) return;
    const hasPingedKey = `device_${uuid}_has_pinged`;

    if (!localStorage.getItem(hasPingedKey)) {
      axios.post(route('session.device.ping'), { uuid }).catch(console.error);
      localStorage.setItem(hasPingedKey, 'true');
    }

    const interval = setInterval(() => {
      if (navigator.onLine) {
        axios.post(route('session.device.ping'), { uuid }).catch(console.error);
      }
    }, 100_000);

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
        localStorage.setItem(`${uuid}_lat`, latitude.toString());
        localStorage.setItem(`${uuid}_lng`, longitude.toString());

        axios.post(route('session.registerDevice'), {
          uuid,
          latitude,
          longitude,
          accuracy,
        }).then(() => {
          console.log(`Location submitted successfully with ${accuracy.toFixed(2)}m accuracy.`);
        }).catch(err => console.error('API submission error:', err));
      },
      (error) => console.error('Geolocation failed:', error),
      { enableHighAccuracy: true, timeout: 30000, maximumAge: 0 }
    );
  } else {
    console.warn('Geolocation not supported on this device.');
  }

  return uuid;
}

window.addEventListener('load', () => {
  registerDeviceOnLoad();

  if ('serviceWorker' in navigator) {
    navigator.serviceWorker
      .register('/service-worker.js')
      .then((registration) => console.log('Service Worker registered with scope:', registration.scope))
      .catch((error) => console.error('Service Worker registration failed:', error));
  }
});

const appName = import.meta.env.VITE_APP_NAME || 'Contracker Beta';

window.addEventListener('beforeunload', () => {
  const uuid = localStorage.getItem('device_uuid');
  if (uuid) {
    const hasPingedKey = `device_${uuid}_has_pinged`;
    localStorage.removeItem(hasPingedKey);
  }
});

function RootWrapper({ children }) {
  useDeviceHeartbeat();
  useDeviceEchoListener();
  
  return (
    <>
      {children}
      <div style={{ position: 'fixed', bottom: 0, right: 0, width: '300px', background: '#fff', border: '1px solid #ccc', zIndex: 1000 }}>
        <div style={{ height: '200px', overflowY: 'auto', padding: '10px' }}>
          <ChatMessages />
        </div>
        <div style={{ padding: '10px', borderTop: '1px solid #ccc' }}>
          <ChatInput />
        </div>
      </div>
    </>
  );
}

let root;

createInertiaApp({
  title: (title) => `${title} - ${appName}`,
  resolve: (name) =>
    resolvePageComponent(`./Pages/${name}.jsx`, import.meta.glob('./Pages/**/*.jsx')),
  setup({ el, App, props }) {
    if (!root) {
      root = createRoot(el);
    }

    root.render(
        
      <RootWrapper>        
        <App {...props} />
      </RootWrapper>
    );
  },
  progress: {
    color: '#4B5563',
  },
});
