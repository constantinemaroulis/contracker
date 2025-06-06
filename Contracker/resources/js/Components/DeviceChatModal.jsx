import React, { useState, useEffect } from 'react'; // 👈 1. Import hooks
import Modal from '@/Components/Modal';
import ChatMessages from '@/Components/ChatMessages';
import DeviceChatInput from '@/Components/DeviceChatInput';
import axios from 'axios';

const DeviceChatModal = ({ show, onClose, uuid, messages, onMessageSent }) => {
    // 2. Use state to store the device name. Default to the UUID.
    const [deviceName, setDeviceName] = useState(uuid);

    // 3. Use an effect to fetch data when the modal is shown or the device changes.
    useEffect(() => {
        // Only fetch data if the modal is visible and we have a UUID
        if (show && uuid) {
            axios.get(route('session.getDevice', { uuid }))
                .then(response => {
                    // 4. Update the state with the name from the API response
                    if (response.data.device && response.data.device.name) {
                        setDeviceName(response.data.device.name);
                    }
                })
                .catch(error => {
                    console.error("Failed to fetch device name:", error);
                    // If the request fails, we'll just keep showing the UUID
                    setDeviceName(uuid);
                });
        }
    }, [show, uuid]); // This effect re-runs whenever `show` or `uuid` changes

    return (
        <Modal show={show} onClose={onClose} maxWidth="lg">
            <div className="p-6">
                <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                    {/* 5. Render the device name from state */}
                    Message from {deviceName}
                </h2>
                <div className="mt-4 h-64 overflow-y-auto border border-gray-300 p-4 rounded-md dark:border-gray-600">
                    <ChatMessages messages={messages} />
                </div>
                <div className="mt-4">
                    <DeviceChatInput uuid={uuid} onMessageSent={onMessageSent} />
                </div>
            </div>
        </Modal>
    );
};

export default DeviceChatModal;