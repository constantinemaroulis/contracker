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
                message: trimmedMessage,
            });
            console.log('DeviceChatInput: Reply sent successfully.');
        } catch (error) {
            console.error('DeviceChatInput: Failed to send reply.', error);
        }
    };

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