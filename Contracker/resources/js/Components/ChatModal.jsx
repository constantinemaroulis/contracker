import React, { useState, useEffect } from 'react';
import Modal from '@/Components/Modal';
import ChatInput from '@/Components/ChatInput';
import ChatMessages from '@/Components/ChatMessages';
import '../echo'; // Ensure Echo is initialized

export default function ChatModal({ show, onClose, device }) {
    const [messages, setMessages] = useState([]);
    const uuid = device?.uuid;

    // This effect handles listening for INCOMING messages from the device
    useEffect(() => {
        if (!uuid) return;

        console.log(`ChatModal: Subscribing to channel for UUID: ${uuid}`);
        setMessages([]); // Clear messages when modal opens for a new device

        const channel = window.Echo.private(`device.${uuid}`);

        channel.listen('.DeviceMessage', (e) => {
            console.log('ChatModal: Received DeviceMessage from remote device', e);
            setMessages((prevMessages) => [...prevMessages, { sender: 'device', text: e.message }]);
        });

        // Cleanup when the component unmounts or the device changes
        return () => {
            console.log(`ChatModal: Leaving channel for UUID: ${uuid}`);
            window.Echo.leave(`device.${uuid}`);
        };
    }, [uuid]);

    // This function is called by ChatInput to optimistically add the sent message to the UI
    const handleSendMessage = (messageText) => {
        console.log('ChatModal: Optimistically adding sent message to UI.');
        setMessages((prevMessages) => [...prevMessages, { sender: 'you', text: messageText }]);
    };

    if (!device) {
        return null;
    }

    return (
        <Modal show={show} onClose={onClose} maxWidth="lg">
            <div className="p-6">
                <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                    Chat with {device.name || device.uuid}
                </h2>
                <div className="mt-4 h-64 overflow-y-auto border border-gray-300 p-4 rounded-md dark:border-gray-600">
                    <ChatMessages messages={messages} />
                </div>
                <div className="mt-4">
                    <ChatInput uuid={uuid} onMessageSent={handleSendMessage} />
                </div>
            </div>
        </Modal>
    );
}