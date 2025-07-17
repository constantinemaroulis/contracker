import React from 'react';
import Modal from '@/Components/Modal';

export default function DeviceDetailsModal({ show, onClose, device, formatDateTimeNY, formatTimeAgo }) {
    if (!device) return null;

    return (
        <Modal show={show} onClose={onClose} maxWidth="lg">
            <div className="p-6 text-sm text-gray-900 dark:text-gray-100 space-y-1">
                <h2 className="text-lg font-semibold mb-4">Device Details - {device.name || device.uuid}</h2>
                <div><strong>Job ID:</strong> {device.job_no ?? device.job_id ?? 'N/A'}</div>
                <div><strong>UUID:</strong> {device.uuid}</div>
                <div><strong>Device Type:</strong> {device.device_type || 'N/A'}</div>
                <div><strong>Local IP:</strong> {device.local_ip || 'N/A'}</div>
                <div><strong>Public IP:</strong> {device.public_ip || 'N/A'}</div>
                <div><strong>MAC Address:</strong> {device.mac_address || 'N/A'}</div>
                <div><strong>Latitude:</strong> {device.latitude ?? 'N/A'}</div>
                <div><strong>Longitude:</strong> {device.longitude ?? 'N/A'}</div>
                <div><strong>Accuracy:</strong> {device.accuracy ?? 'N/A'}</div>
                <div><strong>Last Seen:</strong> {formatDateTimeNY(device.last_seen)}</div>
                <div><strong>Last Ping:</strong> {device.last_ping !== null ? formatTimeAgo(device.last_ping) : 'Never'}</div>
                {device.device_details && (
                    <div><strong>Details:</strong> {device.device_details}</div>
                )}
            </div>
        </Modal>
    );
}
