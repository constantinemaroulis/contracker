import React, { useState } from 'react';
import axios from 'axios';
import PrimaryButton from './PrimaryButton';
import TextInput from './TextInput';
import { usePage, router } from '@inertiajs/react';

const ChatInput = ({ uuid, onMessageSent }) => {
    const [message, setMessage] = useState('');
    const { auth } = usePage().props;

    const sendMessage = async (e) => {
        e.preventDefault();
        const trimmedMessage = message.trim();
        if (!trimmedMessage || !uuid) return;

        if (!auth.user) {
            alert('Please log in to send a message.');
            router.visit(route('login'));
            return;
        }

        // 1. Optimistically update the UI immediately
        onMessageSent(trimmedMessage);
        setMessage(''); // Clear input

        // 2. Send to backend in the background
        try {
            await axios.post(route('session.device.command', { uuid }), {
                command: 'message',
                payload: { message: trimmedMessage }
            });
            console.log('ChatInput: Message sent to backend successfully.');
        } catch (error) {
            console.error('ChatInput: Failed to send message to backend.', error);
            // Here you could add UI to show the message failed to send
        }
    };

    return (
        <form onSubmit={sendMessage} className="flex gap-2">
            <TextInput
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder={auth.user ? "Type your message..." : "Log in to chat"}
                className="flex-grow"
                autoComplete="off"
                disabled={!auth.user}
            />
            <PrimaryButton type="submit" disabled={!auth.user || !message.trim()}>
                Send
            </PrimaryButton>
        </form>
    );
};

export default ChatInput;