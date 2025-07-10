import React, { useRef, useState } from 'react';
import AppLayout from '@/Layouts/AppLayout';
import { Head } from '@inertiajs/react';

export default function RemoteControl({ auth }) {
    const videoRef = useRef(null);
    const [streaming, setStreaming] = useState(false);

    const startSharing = async () => {
        try {
            const stream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: true });
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
            }
            setStreaming(true);
        } catch (err) {
            console.error('Screen share failed', err);
        }
    };

    const stopSharing = () => {
        const tracks = videoRef.current?.srcObject?.getTracks() || [];
        tracks.forEach(t => t.stop());
        if (videoRef.current) {
            videoRef.current.srcObject = null;
        }
        setStreaming(false);
    };

    return (
        <AppLayout header={<h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">Remote Control</h2>}>
            <Head title="Remote Control" />
            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg p-6 space-y-4">
                        <div>
                            {!streaming ? (
                                <button className="px-4 py-2 bg-blue-600 text-white rounded" onClick={startSharing}>Start Remote Session</button>
                            ) : (
                                <button className="px-4 py-2 bg-red-600 text-white rounded" onClick={stopSharing}>Stop Session</button>
                            )}
                        </div>
                        <div className="mt-4">
                            <video ref={videoRef} autoPlay playsInline className="w-full border rounded" />
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
