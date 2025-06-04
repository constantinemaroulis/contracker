import { useEffect, useState } from 'react';
import axios from 'axios';

export default function Devices() {
  const [devices, setDevices] = useState([]);

    const formatDateTimeNY = (isoString) => {
        if (!isoString) return 'Never';

            try {
                // Remove microseconds if present
                const cleaned = isoString.replace(/\.\d+Z$/, 'Z');
                const date = new Date(cleaned);
                return date.toLocaleString('en-US', {
                timeZone: 'America/New_York',
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                hour12: false,
                });
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
        if (secs > 0 && weeks === 0 && days === 0 && hours === 0) // show seconds only if less than 1 hour
            parts.push(secs === 1 ? '1 second' : `${secs} seconds`);

        if (parts.length === 0) return 'Just now';

        return parts.slice(0, 2).join(' ') + ' ago'; // show up to 2 largest units
    }


    useEffect(() => {
        let isMounted = true;

        const fetchDevices = async () => {
            axios.get('/devices')
                .then(res => {
                    if (isMounted) setDevices(res.data.devices);
                })
                .catch(err => console.error('Failed to load devices', err));
        };

        fetchDevices();

        const intervalId = setInterval(fetchDevices, 1000); // every 60 seconds

        return () => {
        isMounted = false;
        clearInterval(intervalId);
        };
    }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Connected Devices</h1>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-300 shadow">
          <thead>
            <tr className="bg-gray-100 text-left">
              <th className="px-4 py-2 border">Name</th>
              <th className="px-4 py-2 border">Job ID</th>
              <th className="px-4 py-2 border">Device Type</th>
              <th className="px-4 py-2 border">Remote IP</th>
              <th className="px-4 py-2 border">Local IP</th>
              <th className="px-4 py-2 border">Last Seen</th>
              <td className="px-4 py-2 border">Last Ping</td>
              <th className="px-4 py-2 border">Status</th>
            </tr>
          </thead>
          <tbody>
            {devices.map(device => (
              <tr key={device.uuid} className="border-t">
                <td className="px-4 py-2 border">{device.name || 'Unnamed'}</td>
                <td className="px-4 py-2 border">{device.job_id || '-'}</td>
                <td className="px-4 py-2 border">{device.device_type || 'N/A'}</td>
                <td className="px-4 py-2 border">{device.public_ip || 'N/A'}</td>
                <td className="px-4 py-2 border">{device.local_ip || 'N/A'}</td>
                <td className="px-4 py-2 border">{formatDateTimeNY(device.last_seen)}</td>
                <td className="px-4 py-2 border">{device.last_ping !== null ? formatTimeAgo(device.last_ping.toFixed(2)) : 'Never'}</td>
                <td className="px-4 py-2 border font-bold">
                  {device.online ? (
                    <span className="text-green-600">✔ Online</span>
                  ) : (
                    <span className="text-red-600">✖ Offline</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
