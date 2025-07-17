import React, { useRef, useState, useEffect } from 'react';
import AppLayout from '@/Layouts/AppLayout';
import { Head } from '@inertiajs/react';
import axios from 'axios';
import { route } from 'ziggy-js';

export default function RemoteControl({ auth }) {
    const [uuid, setUuid] = useState('');
    const [devices, setDevices] = useState([]);
    const videoRef = useRef(null);
    const [pc, setPc] = useState(null);
    const [connected, setConnected] = useState(false);
    const dataChannelRef = useRef(null);

    useEffect(() => {
        return () => {
            if (pc) pc.close();
        };
    }, [pc]);

    useEffect(() => {
        const fetchDevices = () => {
            axios
                .get(route('devices.list'))
                .then(res => {
                    const online = (res.data.devices || []).filter(d => d.online);
                    setDevices(online);
                })
                .catch(() => {});
        };
        fetchDevices();
        const id = setInterval(fetchDevices, 5000);
        return () => clearInterval(id);
    }, []);

    const startSession = async () => {
        if (!uuid) return;
        const peer = new RTCPeerConnection({ iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] });
        const channel = peer.createDataChannel('input');
        dataChannelRef.current = channel;
        channel.onopen = () => setConnected(true);

        peer.ontrack = e => {
            if (videoRef.current) videoRef.current.srcObject = e.streams[0];
        };

        peer.onicecandidate = e => {
            if (e.candidate) {
                axios.post(route('session.device.command', { uuid }), {
                    command: 'control-candidate',
                    payload: { candidate: e.candidate },
                });
            }
        };

        window.Echo.private(`device.${uuid}`).listen('.DeviceCommand', async (ev) => {
            if (ev.command === 'control-answer') {
                await peer.setRemoteDescription(new RTCSessionDescription(ev.payload.answer));
            } else if (ev.command === 'control-candidate' && ev.payload.candidate) {
                await peer.addIceCandidate(new RTCIceCandidate(ev.payload.candidate));
            }
        });

        const offer = await peer.createOffer();
        await peer.setLocalDescription(offer);

        await axios.post(route('session.device.command', { uuid }), {
            command: 'control-offer',
            payload: { offer },
        });

        setPc(peer);
    };

    const sendEvent = (type, event) => {
        if (!connected || !dataChannelRef.current) return;
        const payload = { eventType: type, props: { clientX: event.clientX, clientY: event.clientY, key: event.key } };
        dataChannelRef.current.send(JSON.stringify({ type: 'event', data: payload }));
    };

    return (
        <AppLayout header={<h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">Remote Control</h2>}>
            <Head title="Remote Control" />
            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg p-6 space-y-4">
                        <div className="flex space-x-2">
                            <select value={uuid} onChange={e => setUuid(e.target.value)} className="border rounded px-2 py-1 flex-grow">
                                <option value="">Select Online Device</option>
                                {devices.map(d => (
                                    <option key={d.uuid} value={d.uuid}>{d.name || d.uuid}</option>
                                ))}
                            </select>
                            <button className="px-4 py-2 bg-blue-600 text-white rounded" onClick={startSession} disabled={!uuid}>Connect</button>
                        </div>
                        <div className="mt-4">
                            <video ref={videoRef} autoPlay playsInline className="w-full border rounded" onMouseMove={e => sendEvent('mousemove', e)} onClick={e => sendEvent('click', e)} onKeyDown={e => sendEvent('keydown', e)} tabIndex="0" />
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
