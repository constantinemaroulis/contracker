import React from 'react';
import Modal from '@/Components/Modal';
import ChatInput from '@/Components/ChatInput';
import ChatMessages from '@/Components/ChatMessages';
import '../echo';

export default function ChatModal({ show, onClose, device, messages, onMessageSent }) {
    // The redundant useState line has been removed.
    const uuid = device?.uuid;

    const handleSendMessage = (messageText) => {
        if (device?.uuid) {
            onMessageSent(device.uuid, messageText);
        }
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
