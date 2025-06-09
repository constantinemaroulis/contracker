import { useEffect, useState } from 'react';
import { useForm } from '@inertiajs/react';
import { route } from 'ziggy-js';
import axios from 'axios';
import TextInput from '@/Components/TextInput';
import PrimaryButton from '@/Components/PrimaryButton';

export default function DeviceInfo({ flash }) {
    // State for data that is only for display.
    const [deviceDisplayData, setDeviceDisplayData] = useState({
        name: 'Unknown Device',
        lat: 'N/A',
        lng: 'N/A',
        acc: 'N/A',
        distance: 'N/A',
        status: 'N/A',
        isLoading: true,
    });

    // Inertia's useForm hook for all data that will be submitted.
    const { data, setData, post, processing, errors, recentlySuccessful } = useForm({
        name: '', // The device name to be submitted
        device_type: '',
        device_details: '',
        public_ip: '',
        local_ip: '',
        mac_address: '',
    });

    // Get UUID from localStorage once.
    const [uuid] = useState(() => localStorage.getItem('device_uuid'));

    // This single useEffect runs once on mount to gather ALL device information.
    useEffect(() => {
        if (!uuid) {
             console.error("Device UUID not found in localStorage.");
             setDeviceDisplayData(prev => ({ ...prev, isLoading: false, status: 'Error: No UUID' }));
             return;
        };

        // This function now orchestrates all data fetching for the component.
        const initializeDevice = async () => {
            // Set static browser details immediately.
            setData('device_details', `${navigator.platform} | ${navigator.userAgent}`);

            // Fetch public IP directly from your Laravel route.
            axios.get(route('session.device.ip'))
                .then(res => {
                    setData('public_ip', res.data.ip);
                })
                .catch(err => {
                    console.warn('Could not retrieve public IP via backend route.', err);
                    setData('public_ip', 'Unavailable');
                });
            
            // Attempt to get local IP using WebRTC.
            try {
                const rtc = new RTCPeerConnection({ iceServers: [] });
                rtc.createDataChannel('');
                rtc.createOffer().then(offer => rtc.setLocalDescription(offer));
                rtc.onicecandidate = (event) => {
                    if (event?.candidate?.candidate) {
                        const ipMatch = /([0-9]{1,3}(\.[0-9]{1,3}){3})/.exec(event.candidate.candidate);
                        if (ipMatch) {
                            setData('local_ip', ipMatch[1]);
                            rtc.close();
                        }
                    }
                };
            } catch (err) {
                console.warn('Could not retrieve local IP', err);
                setData('local_ip', 'Not Supported');
            }

            // Fetch detailed device data and distance from the backend.
            try {
                const res = await axios.get(route('session.getDeviceDiff', { uuid }));
                const { device: deviceData, job_location: jobLocation, distance, status } = res.data;

                if (deviceData && jobLocation) {
                    setDeviceDisplayData({
                        name: deviceData.name || 'Unknown Device',
                        lat: deviceData.latitude,
                        lng: deviceData.longitude,
                        acc: deviceData.accuracy,
                        distance: Math.round(distance),
                        status: status || 'Unknown',
                        isLoading: false,
                    });
                    setData(prevData => ({
                        ...prevData,
                        name: deviceData.name || '',
                        device_type: deviceData.device_type || '',
                        mac_address: deviceData.mac_address || '',
                    }));
                    localStorage.setItem(`${uuid}_lat`, deviceData.latitude);
                    localStorage.setItem(`${uuid}_lng`, deviceData.longitude);
                    localStorage.setItem(`${uuid}_acc`, deviceData.accuracy);
                }
            } catch (error) {
                console.error('Error fetching device data:', error);
                setDeviceDisplayData(prev => ({ ...prev, isLoading: false, status: 'Error fetching data' }));
            }
        };

        initializeDevice();
    }, [uuid, setData]);

    // Form Submission
    const updateDeviceDetails = (e) => {
        e.preventDefault();
        post(route('session.device.updateDeviceName', { uuid }), {
            preserveScroll: true,
            onSuccess: () => {
                setDeviceDisplayData(prev => ({ ...prev, name: data.name }));
                localStorage.setItem(`${uuid}_device_name`, data.name);
            },
            onError: (formErrors) => {
                console.error('Error updating device details:', formErrors);
                alert('An error occurred. Please check the form for errors.');
            }
        });
    };

    return (
        <div className="flex gap-4 items-start">
            {/* Left Div for Displaying Device Info (1/3 width) */}
            {/* Add this to display the success message */}
                {flash?.success && (
                    <div className="p-2 mb-4 text-sm text-green-700 bg-green-100 rounded-lg">
                        {flash.success}
                    </div>
                )}
            <div className="w-1/3 p-4 border rounded shadow space-y-2">
                <h2 className="text-lg font-bold">Device Info</h2>
                <div><strong>UUID:</strong> {uuid || 'Unknown'}</div>
                {deviceDisplayData.isLoading ? (
                    <div>Loading device data...</div>
                ) : (
                    <>
                        <div><strong>Device Name:</strong> {deviceDisplayData.name}</div>
                        <div><strong>Latitude:</strong> {deviceDisplayData.lat}</div>
                        <div><strong>Longitude:</strong> {deviceDisplayData.lng}</div>
                        <div><strong>Accuracy:</strong> {deviceDisplayData.acc} meters</div>
                        <div><strong>Distance from Job:</strong> {deviceDisplayData.distance} meters</div>
                        <div className="font-bold"><strong>Status:</strong> {deviceDisplayData.status}</div>
                    </>
                )}
            </div>

            {/* Right Div for the Update Form (2/3 width) */}
            <div className="w-2/3 p-4 border rounded shadow">
                <form onSubmit={updateDeviceDetails} className="space-y-4">
                    <h2 className="text-lg font-bold">Update Device Details</h2>
                    <TextInput
                        label="Device Name"
                        id="name"
                        value={data.name}
                        onChange={(e) => setData('name', e.target.value)}
                        type="text"
                        className="block w-full"
                        error={errors.name}
                    />
                    <div>
                        <label htmlFor="device_type" className="block text-sm font-medium">Device Type</label>
                        <select
                            id="device_type"
                            value={data.device_type}
                            onChange={(e) => setData('device_type', e.target.value)}
                            className={`mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm ${
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
                         {errors.device_type && <p className="text-sm text-red-600 mt-2">{errors.device_type}</p>}
                    </div>

                    <TextInput
                        label="MAC Address (Optional)"
                        id="mac_address"
                        value={data.mac_address}
                        onChange={(e) => setData('mac_address', e.target.value)}
                        placeholder="Optional (if known)"
                        className="block w-full"
                        error={errors.mac_address}
                    />
                    
                    {/* div to line up the following 3 items */}
                    <div className="flex w-full gap-4">
                        <TextInput
                            label="System Captured Details"
                            id="device_details"
                            value={data.device_details}
                            readOnly
                        />
                        <TextInput
                            label="Public IP"
                            id="public_ip"
                            value={data.public_ip}
                            readOnly
                        />
                        <TextInput
                            label="Local IP"
                            id="local_ip"
                            value={data.local_ip}
                            readOnly
                        />
                    </div>

                    <div className="flex items-center gap-4 pt-2">
                        <PrimaryButton disabled={processing}>Update Details</PrimaryButton>
                        {recentlySuccessful && <p className="text-sm text-gray-600">Saved.</p>}
                    </div>
                </form>
            </div>
        </div>
    );
}