import React, { useState, useEffect, useCallback } from 'react';
import DeviceChatModal from './DeviceChatModal';
import '../echo';

const RemoteChatManager = () => {
    const [isModalOpen, setModalOpen] = useState(false);
    const [messages, setMessages] = useState([]);
    const [uuid, setUuid] = useState(null);

    // Get the device's UUID from local storage on component mount
    useEffect(() => {
        setUuid(localStorage.getItem('device_uuid'));
    }, []);

    // Listen for incoming chat commands from the admin
    useEffect(() => {
        if (!uuid) return;

        const channel = window.Echo.private(`device.${uuid}`);
        const handleCommand = (event) => {
            const data = event.data || event; // Handle different event structures
            if (data.command === 'message' && data.payload && data.payload.message) {
                // Add the received message to the state and open the modal
                setMessages(prev => [...prev, { sender: 'device', text: data.payload.message }]);
                setModalOpen(true);
            }
        };
        
        channel.listen('.DeviceCommand', handleCommand);
        
        // As a fallback, also listen for the fully qualified class name
        channel.listen('App\\Events\\DeviceCommand', handleCommand);

        return () => {
            channel.stopListening('.DeviceCommand');
            channel.stopListening('App\\Events\\DeviceCommand');
        };
    }, [uuid]);
    
    // Add the user's own reply to the message list for optimistic UI
    const handleSendMessage = useCallback((messageText) => {
        setMessages(prev => [...prev, { sender: 'you', text: messageText }]);
    }, []);

    const closeModal = () => {
        setModalOpen(false);
    };

    if (!uuid) return null;

    return (
        <DeviceChatModal
            show={isModalOpen}
            onClose={closeModal}
            uuid={uuid}
            messages={messages}
            onMessageSent={handleSendMessage}
        />
    );
};

export default RemoteChatManager;