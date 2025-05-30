import { useEffect, useState } from 'react';
import { Ziggy } from './../ziggy'; // Ensure Ziggy config is correctly imported
import { route } from 'ziggy-js';
import axios from 'axios';

export default function DeviceInfo() {
  const [device, setDevice] = useState(null);
  const [uuid, setUuid] = useState(localStorage.getItem('device_uuid') || null);
  const [lat, setLat] = useState(localStorage.getItem(`${uuid}_lat`) || 'N/A');
  const [lng, setLng] = useState(localStorage.getItem(`${uuid}_lng`) || 'N/A');
  const [acc, setAcc] = useState(localStorage.getItem(`${uuid}_acc`) || 'N/A');
  const [response, setResponse] = useState(null);
  const [status, setStatus] = useState(null);


  useEffect(() => {
        async function fetchDeviceData() {
            try {
                if (!uuid) {
                    console.warn('No UUID found in localStorage.');
                    return;
                }

                const response = await axios.get(route('session.getDeviceDiff', { uuid }));

                const deviceData = response.data.device;
                const jobLocation = response.data.job_location;
                const distance = response.data.distance;
                const status = response.data.status;

                if (deviceData && jobLocation) {
                    setDevice(deviceData);
                    setLat(deviceData.latitude);
                    setLng(deviceData.longitude);
                    setAcc(deviceData.accuracy);
                    setResponse(distance);
                    setStatus(status);
                    
                    // Update localStorage if necessary
                    localStorage.setItem(`${uuid}_lat`, deviceData.latitude);
                    localStorage.setItem(`${uuid}_lng`, deviceData.longitude);
                    localStorage.setItem(`${uuid}_acc`, deviceData.accuracy);
                }
            } catch (error) {
                console.error('Error fetching device data:', error);
            }
        }

        fetchDeviceData();
    }, [uuid]);


  return (
        <div className="flex gap-4 items-start">
            <div className="w-1/2 p-4 border rounded shadow space-y-2">
                <h2 className="text-lg font-bold">Device Info</h2>
                <div><strong>UUID:</strong> {uuid || 'Unknown'}</div>
                {device ? (
                    <>
                        <div><strong>Latitude:</strong> {lat || 'N/A'}</div>
                        <div><strong>Longitude:</strong> {lng || 'N/A'}</div>
                        <div><strong>Accuracy:</strong> {acc || 'N/A'} meters</div>
                        <div><strong>Distance from Job:</strong> {response} meters</div>
                        <div><strong>Status:</strong> {status || 'Unknown'}</div>
                    </>
                ) : (
                    <div>Loading device data...</div>
                )}
            </div>
        </div>
    )
}