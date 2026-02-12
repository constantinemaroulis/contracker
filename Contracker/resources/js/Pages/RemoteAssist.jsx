import React, { useEffect, useRef, useState } from 'react';
import AppLayout from '@/Layouts/AppLayout';
import { Head } from '@inertiajs/react';
import axios from 'axios';
import { route } from 'ziggy-js';

export default function RemoteAssist({ auth, uuid }) {
    const videoRef = useRef(null);
    const [pc, setPc] = useState(null);
    const [dataChannel, setDataChannel] = useState(null);
    const [stream, setStream] = useState(null);
    const [shareStarted, setShareStarted] = useState(false);
    const [pendingOffer, setPendingOffer] = useState(null);

    const handleOffer = async (offer) => {
        if (!pc || !stream) return;
        const desc = new RTCSessionDescription(offer);
        await pc.setRemoteDescription(desc);
        stream.getTracks().forEach(t => pc.addTrack(t, stream));
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        axios.post(route('session.device.command', { uuid }), {
            command: 'control-answer',
            payload: { answer },
        });
    };

    const startSharing = async () => {
        try {

            let s;
            try {
                s = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: true });
            } catch {
                s = await navigator.mediaDevices.getDisplayMedia({ video: true });
                try {
                    const audio = await navigator.mediaDevices.getUserMedia({ audio: true });
                    audio.getAudioTracks().forEach(t => s.addTrack(t));
                } catch {
                    // no audio available
                }
            }
            setStream(s);
            if (videoRef.current) {
                videoRef.current.srcObject = s;
                const p = videoRef.current.play();
                if (p && p.catch) p.catch(() => {});
            }

            setShareStarted(true);
            if (pendingOffer) {
                await handleOffer(pendingOffer);
                setPendingOffer(null);
            }
        } catch (err) {
            console.error('Failed to capture screen', err);
        }
    };

    useEffect(() => {
        if (!uuid) return;
        const peer = new RTCPeerConnection({ iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] });
        let channel;

        peer.onicecandidate = e => {
            if (e.candidate) {
                axios.post(route('session.device.command', { uuid }), {
                    command: 'control-candidate',
                    payload: { candidate: e.candidate },
                });
            }
        };

        peer.ondatachannel = e => {
            channel = e.channel;
            setDataChannel(channel);
            channel.onmessage = ev => {
                try {
                    const { type, data } = JSON.parse(ev.data);
                    if (type === 'event') {
                        const evt = new Event(data.eventType, { bubbles: true, cancelable: true });
                        Object.assign(evt, data.props);
                        document.dispatchEvent(evt);
                    }
                } catch (err) {
                    console.error('Bad message', err);
                }
            };
        };

        window.Echo.private(`device.${uuid}`).listen('.DeviceCommand', async (e) => {
            if (e.command === 'control-offer') {
                if (shareStarted && stream) {
                    await handleOffer(e.payload.offer);
                } else {
                    setPendingOffer(e.payload.offer);
                }
            } else if (e.command === 'control-candidate' && e.payload.candidate) {
                await peer.addIceCandidate(new RTCIceCandidate(e.payload.candidate));
            }
        });

        setPc(peer);
        return () => {
            peer.close();
            window.Echo.leave(`private-device.${uuid}`);
        };
    }, [uuid]);

    return (
        <AppLayout header={<h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">Remote Assist</h2>}>
            <Head title="Remote Assist" />
            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg p-6 space-y-4">
                        {!shareStarted && (
                            <button className="px-4 py-2 bg-blue-600 text-white rounded" onClick={startSharing}>
                                Start Sharing
                            </button>
                        )}
<<<<<<< i7q0a4-codex/fix-remote-control-device-selection
                        <video ref={videoRef} autoPlay playsInline muted className="w-full border rounded" />
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
