import React, { useState } from 'react';
import axios from 'axios';
import PrimaryButton from './PrimaryButton';
import TextInput from './TextInput';
import { router } from '@inertiajs/react';

const ChatInput = ({ uuid, auth, onMessageSent }) => {
    const [message, setMessage] = useState('');

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
        setMessage('');

        try {
<<<<<<< HEAD
            // Send the message to the backend (DeviceCommand with command 'message')
            const senderUuid = localStorage.getItem('device_uuid');
=======
>>>>>>> parent of 40c4ad1 (Better chat)
            await axios.post(route('session.device.command', { uuid }), {
                sender_uuid: senderUuid,
                command: 'message',
<<<<<<< HEAD
                payload: { message: trimmed, messageId: tempId, recipient_uuid: uuid }
=======
                payload: { message: trimmedMessage }
>>>>>>> parent of 40c4ad1 (Better chat)
            });
            console.log('ChatInput: Message sent to backend successfully.');
        } catch (error) {
            console.error('ChatInput: Failed to send message to backend.', error);
        }
    };

<<<<<<< HEAD
    const handleInputChange = (e) => {
        setMessage(e.target.value);
        if (!auth.user) return;
        // Notify that the admin is typing (throttle to send infrequently)
        if (window.Echo && window.Echo.connector && window.Echo.connector.pusher) {
            try {
                const senderUuid = localStorage.getItem('device_uuid');
                axios.post(route('session.device.command', { uuid }), {
                    sender_uuid: senderUuid,
                    command: 'typing',
                    payload: { recipient_uuid: uuid }
                });
            } catch (err) {
                console.error('Failed to send typing indicator', err);
            }
        }
        // Clear any pending timeout and set a new one to possibly send "stop typing" later (not implemented for simplicity)
        if (typingTimeout) clearTimeout(typingTimeout);
        setTypingTimeout(setTimeout(() => {
            // We could send a "stop typing" command here if desired
            // axios.post(..., { command: 'typing', payload: { stop: true } });
            setTypingTimeout(null);
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