import { useEffect, useState } from 'react';
import axios from 'axios';

export default function Devices() {
  const [devices, setDevices] = useState([]);

  useEffect(() => {
    axios.get('/devices')
      .then(res => setDevices(res.data.devices))
      .catch(err => console.error('Failed to load devices', err));
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
                <td className="px-4 py-2 border">{device.last_seen || 'Never'}</td>
                <td className="px-4 py-2 border">{device.last_ping || 'Never'}</td>
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
