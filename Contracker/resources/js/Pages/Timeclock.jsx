import { useState } from 'react';
import AppLayout from '@/Layouts/AppLayout';
import axios from 'axios';

export default function Timeclock() {
  const [jobId, setJobId] = useState('');
  const [uuid, setUuid] = useState('');
  const [message, setMessage] = useState('');

  const clockIn = async () => {
    try {
      await axios.post(`/timeclock/jobs/${jobId}/devices/${uuid}/clock-in`, { latitude: 0, longitude: 0 });
      setMessage('Clocked in');
    } catch (e) {
      setMessage('Error clocking in');
    }
  };

  const clockOut = async () => {
    try {
      await axios.post(`/timeclock/jobs/${jobId}/devices/${uuid}/clock-out`, { latitude: 0, longitude: 0 });
      setMessage('Clocked out');
    } catch (e) {
      setMessage('Error clocking out');
    }
  };

  return (
    <AppLayout header={<h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">Timeclock</h2>}>
      <div className="p-4 space-y-4">
        <div>
          <label className="block">Job ID</label>
          <input className="border" value={jobId} onChange={e => setJobId(e.target.value)} />
        </div>
        <div>
          <label className="block">Device UUID</label>
          <input className="border" value={uuid} onChange={e => setUuid(e.target.value)} />
        </div>
        <button onClick={clockIn} className="px-4 py-2 bg-green-500 text-white">Clock In</button>
        <button onClick={clockOut} className="px-4 py-2 bg-red-500 text-white ml-2">Clock Out</button>
        <div>{message}</div>
      </div>
    </AppLayout>
  );
}
