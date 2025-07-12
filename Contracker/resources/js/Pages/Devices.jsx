import { useEffect, useState } from 'react';
import axios from 'axios';
import AppLayout from '@/Layouts/AppLayout';
import { Head } from '@inertiajs/react';
import DeviceDetailsModal from '@/Components/DeviceDetailsModal';

export default function Devices({ auth }) {
    const [devices, setDevices] = useState([]);
    const [selectedDevice, setSelectedDevice] = useState(null);

    // This effect can remain to keep the device list fresh
    useEffect(() => {
        let isMounted = true;
        const fetchDevices = () => {
            axios.get(route('devices.list'))
                .then(res => {
                    if (isMounted) {
                        setDevices(res.data.devices);
                    }
                })
                .catch(err => console.error('DEBUG: Devices.jsx failed to load devices', err));
        };

        fetchDevices();
        const intervalId = setInterval(fetchDevices, 600);

        return () => {
            isMounted = false;
            clearInterval(intervalId);
        };
    }, []);

    const formatDateTimeNY = (isoString) => {
        if (!isoString) return 'Never';
        try {
            const cleaned = isoString.replace(/\.\d+Z$/, 'Z');
            const date = new Date(cleaned);
            return date.toLocaleString('en-US', { timeZone: 'America/New_York', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
        } catch {
            return 'Invalid Date';
        }
    };
    const formatTimeAgo = (minutesAgo) => {
        if (minutesAgo === null || minutesAgo === undefined) return 'Never';
        const totalSeconds = Math.round(minutesAgo * 60);
        if (totalSeconds < 5) return 'Just now';
        const weeks = Math.floor(totalSeconds / (7 * 24 * 3600));
        const days = Math.floor((totalSeconds % (7 * 24 * 3600)) / (24 * 3600));
        const hours = Math.floor((totalSeconds % (24 * 3600)) / 3600);
        const mins = Math.floor((totalSeconds % 3600) / 60);
        const secs = totalSeconds % 60;
        let parts = [];
        if (weeks > 0) parts.push(weeks === 1 ? '1 week' : `${weeks} weeks`);
        if (days > 0) parts.push(days === 1 ? '1 day' : `${days} days`);
        if (hours > 0) parts.push(hours === 1 ? '1 hour' : `${hours} hours`);
        if (mins > 0) parts.push(mins === 1 ? '1 minute' : `${mins} minutes`);
        if (secs > 0 && weeks === 0 && days === 0 && hours === 0) parts.push(secs === 1 ? '1 second' : `${secs} seconds`);
        if (parts.length === 0) return 'Just now';
        return parts.slice(0, 2).join(' ') + ' ago';
    };

    const handleChatClick = (device) => {
        if (window.chatManager) {
            window.chatManager.openChat(device);
        } else {
            console.error('Chat Manager is not available.');
        }
    };

    const groupedDevices = devices.reduce((acc, device) => {
        const key = device.job_no || device.job_id || 'Unassigned';
        if (!acc[key]) acc[key] = [];
        acc[key].push(device);
        return acc;
    }, {});

    return (
        <AppLayout
            header={<h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">Device Management</h2>}
        >
            <Head title="Device Management" />
            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900 dark:text-gray-100">
                            <h1 className="text-2xl font-bold mb-4">Connected Devices</h1>
                            {devices && devices.length > 0 ? (
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {Object.entries(groupedDevices).map(([jobKey, group]) => (
                                        <div key={jobKey} className="p-4 border dark:border-gray-600 rounded shadow bg-white dark:bg-gray-700">
                                            <h2 className="text-lg font-semibold mb-2">Job {jobKey}</h2>
                                            <div className="space-y-1 text-sm">
                                                {group.map(device => (
                                                    <div key={device.uuid} className="flex items-center justify-between border-b last:border-none pb-1">
                                                        <span>
                                                            {device.name || 'Unnamed'}{' '}
                                                            {device.online ? (
                                                                <span className="text-green-500 font-bold">✔ Online</span>
                                                            ) : (
                                                                <span className="text-red-500 font-bold">✖ Offline</span>
                                                            )}
                                                        </span>
                                                        <div className="space-x-2">
                                                            <button
                                                                onClick={() => handleChatClick(device)}
                                                                className={`${device.online ? 'text-blue-600 dark:text-blue-400' : 'text-gray-500'} hover:underline text-sm`}
                                                            >
                                                                Chat
                                                            </button>
                                                            <button
                                                                onClick={() => setSelectedDevice(device)}
                                                                className="text-gray-600 dark:text-gray-300 hover:underline text-sm"
                                                            >
                                                                More
                                                            </button>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div>No devices found or still loading...</div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
            <DeviceDetailsModal
                show={!!selectedDevice}
                onClose={() => setSelectedDevice(null)}
                device={selectedDevice}
                formatDateTimeNY={formatDateTimeNY}
                formatTimeAgo={formatTimeAgo}
            />
        </AppLayout>
    );
}
