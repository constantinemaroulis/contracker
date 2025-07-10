import React, { useState } from 'react';
import axios from 'axios';
import PrimaryButton from './PrimaryButton';
import TextInput from './TextInput';

const DeviceChatInput = ({ uuid, onMessageSent }) => {
    const [message, setMessage] = useState('');
    const [sending, setSending] = useState(false);
    const [typingTimeout, setTypingTimeout] = useState(null);

    const sendMessage = async (e) => {
        e.preventDefault();
        const trimmed = message.trim();
        if (!trimmed || !uuid) return;
        setSending(true);
        // Generate temp ID and optimistically add message
        const tempId = Date.now().toString();
        onMessageSent(trimmed, tempId);
        setMessage('');
        try {
            // Send message to backend (Device -> Admin)
            await axios.post(route('devices.message.send'), {
                uuid,
                sender_uuid: localStorage.getItem('device_uuid'),
                recipient_uuid: 'admin',
                message: trimmed,
                messageId: tempId
            });
            console.log('DeviceChatInput: Message sent successfully.');
            // Device will wait for admin's ACK for delivered/read status
        } catch (error) {
            console.error('DeviceChatInput: Failed to send message.', error);
            // Mark as failed in UI
            window.chatManager && window.chatManager.addMessage(uuid, {
                id: tempId,
                sender: 'You',
                text: trimmed,
                isReply: false,
                timestamp: new Date(),
                status: 'error'
            });
        } finally {
            setSending(false);
        }
    };

    const handleInputChange = (e) => {
        setMessage(e.target.value);
        // Device typing indicator
        try {
            axios.post(route('devices.message.send'), {
                uuid,
                sender_uuid: localStorage.getItem('device_uuid'),
                recipient_uuid: 'admin',
                message: '',    // no actual message
                ack: true,
                typing: true    // custom flag to indicate typing
            });
        } catch (err) {
            console.error('Failed to send device typing indicator', err);
        }
        if (typingTimeout) clearTimeout(typingTimeout);
        setTypingTimeout(setTimeout(() => {
            setTypingTimeout(null);
            // Could send stop-typing indicator if needed
        }, 3000));
    };

    return (
        <form onSubmit={sendMessage} className="flex gap-2">
            <TextInput
                type="text"
                value={message}
                onChange={handleInputChange}
                placeholder="Type your reply..."
                className="flex-grow"
                autoComplete="off"
                disabled={sending}
            />
            <PrimaryButton type="submit" disabled={!message.trim() || sending}>
                Reply
            </PrimaryButton>
        </form>
    );
};

export default DeviceChatInput;
