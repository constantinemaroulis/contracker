import { useEffect, useState } from 'react';
import axios from 'axios';
import AppLayout from '@/Layouts/AppLayout';
import { Head } from '@inertiajs/react';

export default function Devices({ auth }) {
    const [devices, setDevices] = useState([]);

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
                                            devices.map(device => (
                            <div className="overflow-x-auto">
                                <table className="min-w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 shadow">
                                    <thead>
                                        <tr className="bg-gray-100 dark:bg-gray-600 text-left">
                                            <th className="px-4 py-2 border dark:border-gray-600">Name</th>
                                            <th className="px-4 py-2 border dark:border-gray-600">Job ID</th>
                                            <th className="px-4 py-2 border dark:border-gray-600">Device Type</th>
                                            <th className="px-4 py-2 border dark:border-gray-600">Remote IP</th>
                                            <th className="px-4 py-2 border dark:border-gray-600">Last Seen</th>
                                            <th className="px-4 py-2 border dark:border-gray-600">Last Ping</th>
                                            <th className="px-4 py-2 border dark:border-gray-600">Status</th>
                                            <th className="px-4 py-2 border dark:border-gray-600">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                                <tr key={device.uuid} className="border-t dark:border-gray-600">

                                                    <td className="px-4 py-2 border dark:border-gray-600">{device.job_id || '-'}</td>
                                                    <td className="px-4 py-2 border dark:border-gray-600">{device.name || 'Unnamed'}</td>
                                                    <td className="px-4 py-2 border dark:border-gray-600">{device.device_type || 'N/A'}</td>
                                                    <td className="px-4 py-2 border dark:border-gray-600">{device.public_ip || 'N/A'}</td>
                                                    <td className="px-4 py-2 border dark:border-gray-600">{formatDateTimeNY(device.last_seen)}</td>
                                                    <td className="px-4 py-2 border dark:border-gray-600">{device.last_ping !== null ? formatTimeAgo(device.last_ping) : 'Never'}</td>
                                                    <td className="px-4 py-2 border font-bold">
                                                        {device.online ? (
                                                            <span className="text-green-500">✔ Online</span>
                                                        ) : (
                                                            <span className="text-red-500">✖ Offline</span>
                                                        )}
                                                    </td>
                                                    <td className="px-4 py-2 border dark:border-gray-600">
                                                        <button
                                                            onClick={() => handleChatClick(device)}
                                                            className={`${device.online ? 'text-blue-600 dark:text-blue-400' : 'text-gray-500'} hover:underline`}
                                                        >
                                                            Chat
                                                        </button>
                                                    </td>
                                                </tr>
                                    </tbody>
                                </table>
                            </div>
                             ))
                                        ) : (
                                            <div>
                                                    No devices found or still loading...
                                            </div>
                                        )}
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
