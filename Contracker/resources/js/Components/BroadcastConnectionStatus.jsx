import React, { useState, useEffect } from 'react';
import '../echo'; // Make sure Echo is initialized

const BroadcastConnectionStatus = () => {
    const [status, setStatus] = useState('uninitialized');
    const [channelStatus, setChannelStatus] = useState('inactive');
    const [uuid, setUuid] = useState(null);

    useEffect(() => {
        const deviceUuid = localStorage.getItem('device_uuid');
        setUuid(deviceUuid);

        if (!window.Echo) {
            setStatus('error: Echo not found');
            return;
        }

        const echo = window.Echo;

        // --- Listen to global connection state changes ---
        const onStateChange = (states) => {
            console.log("BroadcastConnectionStatus: Connection state changed to", states.current);
            setStatus(states.current);
        };
        echo.connector.pusher.connection.bind('state_change', onStateChange);
        setStatus(echo.connector.pusher.connection.state); // Set initial state

        // --- Listen to specific channel subscription status ---
        if (deviceUuid) {
            setChannelStatus('subscribing...');
            const channel = echo.private(`device.${deviceUuid}`);
            channel.on('pusher:subscription_succeeded', () => {
                console.log("BroadcastConnectionStatus: Channel subscription succeeded.");
                setChannelStatus('subscribed');
            });
            channel.on('pusher:subscription_error', (error) => {
                console.error("BroadcastConnectionStatus: Channel subscription failed.", error);
                setChannelStatus(`failed (${error.status})`);
            });
        } else {
            setChannelStatus('no uuid');
        }

        // --- Cleanup function ---
        return () => {
            echo.connector.pusher.connection.unbind('state_change', onStateChange);
            if(deviceUuid) {
                echo.leave(`device.${deviceUuid}`);
            }
        }
    }, []);

    const getStatusColor = (s) => {
        switch (s) {
            case 'connected':
            case 'subscribed':
                return 'bg-green-500 text-white';
            case 'connecting':
            case 'subscribing...':
                return 'bg-yellow-500 text-black';
            default:
                return 'bg-red-600 text-white';
        }
    }

    return (
        <div style={{
            position: 'fixed',
            bottom: '10px',
            left: '10px',
            backgroundColor: 'rgba(0, 0, 0, 0.75)',
            color: 'white',
            padding: '10px',
            borderRadius: '8px',
            zIndex: 9999,
            fontSize: '12px',
            fontFamily: 'monospace',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
        }}>
            <div><strong>Real-time Status</strong></div>
            <div style={{ wordBreak: 'break-all' }}>UUID: {uuid || 'Not Set'}</div>
            <div>
                Connection: <span style={{ padding: '2px 6px', borderRadius: '4px' }} className={getStatusColor(status)}>{status}</span>
            </div>
             <div>
                Channel: <span style={{ padding: '2px 6px', borderRadius: '4px' }} className={getStatusColor(channelStatus)}>{channelStatus}</span>
            </div>
        </div>
    );
};

export default BroadcastConnectionStatus;