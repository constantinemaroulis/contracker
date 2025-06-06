import React, { useState, useEffect } from 'react';
import Modal from '@/Components/Modal';
import ChatInput from '@/Components/ChatInput';
import ChatMessages from '@/Components/ChatMessages';
import '../echo';

export default function ChatModal({ show, onClose, device }) {
    const [messages, setMessages] = useState([]);
    const uuid = device?.uuid;

    useEffect(() => {
        if (!uuid) return;
        setMessages([]);
        const channel = window.Echo.private(`device.${uuid}`);
        
        channel.listen('.DeviceMessage', (e) => {
            console.log("Admin received a reply:", e);
            // Add the new reply to the message list, using the senderName from the event
            setMessages((prev) => [...prev, { 
                sender: e.senderName || 'Device', // Use the name from the event
                text: e.message,
                isReply: true // This flag identifies a message from a device
            }]);
        });
        
        return () => window.Echo.leave(`device.${uuid}`);
    }, [uuid]);

    const handleSendMessage = (messageText) => {
        setMessages((prev) => [...prev, { 
            sender: 'You', // The sender is the logged-in admin
            text: messageText,
            isReply: false 
        }]);
    };

    if (!device) return null;

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