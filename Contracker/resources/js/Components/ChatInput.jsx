import React, { useState } from 'react';
import axios from 'axios';
import PrimaryButton from './PrimaryButton';
import TextInput from './TextInput';
import { router } from '@inertiajs/react'; // Keep router, remove usePage

const ChatInput = ({ uuid, auth, onMessageSent }) => { // Accept 'auth' as a prop
    const [message, setMessage] = useState('');
    // const { auth } = usePage().props; // REMOVE THIS LINE

    const sendMessage = async (e) => {
        e.preventDefault();
        const trimmedMessage = message.trim();
        if (!trimmedMessage || !uuid) return;

        if (!auth.user) {
            alert('Please log in to send a message.');
            router.visit(route('login'));
            return;
        }

        onMessageSent(trimmedMessage);
        setMessage(''); // Clear input

        try {
            await axios.post(route('session.device.command', { uuid }), {
                command: 'message',
                payload: { message: trimmedMessage }
            });
            console.log('ChatInput: Message sent to backend successfully.');
        } catch (error) {
            console.error('ChatInput: Failed to send message to backend.', error);
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
