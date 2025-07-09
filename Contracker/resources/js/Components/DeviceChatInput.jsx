import React, { useState } from 'react';
import axios from 'axios';
import PrimaryButton from './PrimaryButton';
import TextInput from './TextInput';

const DeviceChatInput = ({ uuid, onMessageSent }) => {
    const [message, setMessage] = useState('');

    const sendMessage = async (e) => {
        e.preventDefault();
        const trimmedMessage = message.trim();
        if (!trimmedMessage || !uuid) return;

        // 1. Optimistically update the device's own UI
        onMessageSent(trimmedMessage);
        setMessage('');

        try {
            // 2. Send the reply to the backend using the correct route
            await axios.post(route('devices.message.send'), {
                uuid,
<<<<<<< HEAD
                sender_uuid: localStorage.getItem('device_uuid'),
                recipient_uuid: 'admin',
                message: trimmed,
                messageId: tempId
=======
                message: trimmedMessage,
>>>>>>> parent of 40c4ad1 (Better chat)
            });
            console.log('DeviceChatInput: Reply sent successfully.');
        } catch (error) {
            console.error('DeviceChatInput: Failed to send reply.', error);
        }
    };

<<<<<<< HEAD
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

=======
>>>>>>> parent of 40c4ad1 (Better chat)
    return (
        <form onSubmit={sendMessage} className="flex gap-2">
            <TextInput
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type your reply..."
                className="flex-grow"
                autoComplete="off"
            />
            <PrimaryButton type="submit" disabled={!message.trim()}>
                Reply
            </PrimaryButton>
        </form>
    );
};

export default DeviceChatInput;