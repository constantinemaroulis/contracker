import { useEffect, useState } from 'react';
import { useForm } from '@inertiajs/react';
import { route } from 'ziggy-js';
import axios from 'axios';
import TextInput from '@/Components/TextInput';
import PrimaryButton from '@/Components/PrimaryButton';

export default function DeviceInfo() {
  const [device, setDevice] = useState(null);
  const [uuid, setUuid] = useState(localStorage.getItem('device_uuid') || null);
  const [lat, setLat] = useState(localStorage.getItem(`${uuid}_lat`) || 'N/A');
  const [lng, setLng] = useState(localStorage.getItem(`${uuid}_lng`) || 'N/A');
  const [acc, setAcc] = useState(localStorage.getItem(`${uuid}_acc`) || 'N/A');
  const [name, setName] = useState('Unknown Device');
  const [response, setResponse] = useState(null);
  const [status, setStatus] = useState(null);

  const { data, setData, post, processing } = useForm({
    device_name: '',
    device_type: '',
    device_details: '',
    public_ip: '',
    local_ip: '',
    mac_address: '', // will remain empty unless manually filled
  });

  useEffect(() => {
    async function fetchDeviceData() {
      if (!uuid) return;

      try {
        const res = await axios.get(route('session.getDeviceDiff', { uuid }));

        const { device: deviceData, job_location: jobLocation, distance, status } = res.data;

        if (deviceData && jobLocation) {
          setDevice(deviceData);
          setLat(deviceData.latitude);
          setLng(deviceData.longitude);
          setAcc(deviceData.accuracy);
          setName(deviceData.name || 'Unknown Device');
          setResponse(distance);
          setStatus(status);
          setData('device_type', deviceData.device_type || '');

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

  useEffect(() => {
    // Device details from browser
    const details = `${navigator.platform} | ${navigator.userAgent}`;
    setData('device_details', details);

    // Public IP using external service
    window.addEventListener('load', () => {
        /*
        axios.get('https://api.ipify.org?format=json')
            .then(res => setData('public_ip', res.data.ip))
            .catch(err => console.warn('Could not retrieve public IP', err));
        */
       axios.get(route('session.device.ip'))
            .then(res => setData('public_ip', res.data.ip))
            .catch(err => console.warn('Could not retrieve public IP', err));
    });

    // Optional: Try to get local IP using WebRTC (not always reliable)
    try {
        const rtc = new RTCPeerConnection({ iceServers: [] });
        rtc.createDataChannel('');
        rtc.createOffer().then(offer => rtc.setLocalDescription(offer));

        rtc.onicecandidate = (event) => {
        if (event && event.candidate) {
            const ipMatch = /([0-9]{1,3}(\.[0-9]{1,3}){3})/.exec(event.candidate.candidate);
            if (ipMatch) {
            setData('local_ip', ipMatch[1]);
            rtc.close();
            }
        }
        };
    } catch (err) {
        console.warn('Could not retrieve local IP', err);
    }
    }, []);

  const updateDeviceName = async (e) => {
    e.preventDefault();

    try {
        const payload = {
            device_type: data.device_type,
            mac_address: data.mac_address,
            public_ip: data.public_ip,
            local_ip: data.local_ip,
            device_details: data.device_details,
        };

        if (data.device_name.trim()) {
            payload.name = data.device_name;
        }

        const res = await axios.post(route('session.device.updateDeviceName', uuid), payload);

      if (res.data.success) {
        setName(data.device_name);
        localStorage.setItem(`${uuid}_device_name`, data.device_name);
        alert('Device name updated successfully!');
      } else {
        alert('Failed to update device name.');
      }
    } catch (error) {
      console.error('Error updating device name:', error);
      alert('An error occurred while updating the device name.');
    }
  };

  return (
    <div className="flex gap-4 items-start">
      <div className="w-1/2 p-4 border rounded shadow space-y-4">
        <h2 className="text-lg font-bold">Device Info</h2>
        <div><strong>UUID:</strong> {uuid || 'Unknown'}</div>
        {device ? (
          <>
            <div><strong>Device Name:</strong> {name}</div>
            <div><strong>Latitude:</strong> {lat}</div>
            <div><strong>Longitude:</strong> {lng}</div>
            <div><strong>Accuracy:</strong> {acc} meters</div>
            <div><strong>Distance from Job:</strong> {response} meters</div>
            <div><strong>Status:</strong> {status || 'Unknown'}</div>
          </>
        ) : (
          <div>Loading device data...</div>
        )}

        <form onSubmit={updateDeviceName} className="mt-4 space-y-4">
          <h3 className="text-md font-medium">Name This Device</h3>
          <TextInput
            id="device_name"
            value={data.device_name}
            onChange={(e) => setData('device_name', e.target.value)}
            type="text"
            className="block w-full"
          />
          <label className="block">
            <span className="text-sm font-medium">Device Type</span>
            <select
                id="device_type"
                value={data.device_type}
                onChange={(e) => setData('device_type', e.target.value)}
                className={`mt-1 block w-full border-gray-300 rounded ${
                    data.device_type ? 'bg-green-100' : 'bg-white'
                }`}
            >
                <option value="">Select Type</option>
                <option>Desktop App</option>
                <option>Desktop Browser</option>
                <option>Tablet (iOS) App</option>
                <option>Tablet (iOS) Browser</option>
                <option>Phone (iOS) App</option>
                <option>Phone (iOS) Browser</option>
                <option>[Kiosk] Tablet (iOS) App</option>
                <option>[Kiosk] Tablet (iOS) Browser</option>
                <option>Tablet (Windows) App</option>
                <option>Tablet (Windows) Browser</option>
                <option>Phone (Windows) App</option>
                <option>Phone (Windows) Browser</option>
                <option>[Kiosk] Tablet (Windows) App</option>
                <option>[Kiosk] Tablet (Windows) Browser</option>
                <option>Tablet (Android) App</option>
                <option>Tablet (Android) Browser</option>
                <option>Phone (Android) App</option>
                <option>Phone (Android) Browser</option>
                <option>[Kiosk] Tablet (Android) App</option>
                <option>[Kiosk] Tablet (Android) Browser</option>
                <option>OTHER</option>
            </select>
            </label>

            <TextInput
                id="device_details"
                label="Device Details"
                value={data.device_details}
                readOnly
                className="block w-full"
                />

                <TextInput
                id="public_ip"
                label="Public IP"
                value={data.public_ip}
                readOnly
                className="block w-full"
                />

                <TextInput
                id="local_ip"
                label="Local IP"
                value={data.local_ip}
                readOnly
                className="block w-full"
                />

                <TextInput
                id="mac_address"
                label="MAC Address (if available)"
                value={data.mac_address}
                onChange={(e) => setData('mac_address', e.target.value)}
                placeholder="Optional (if known)"
                className="block w-full"
                />

          <PrimaryButton disabled={processing}>Update Name</PrimaryButton>
        </form>
      </div>
    </div>
  );
}
