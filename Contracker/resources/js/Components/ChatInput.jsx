import React, { useState } from 'react';
import axios from 'axios';
import PrimaryButton from './PrimaryButton';
import TextInput from './TextInput';
import { router } from '@inertiajs/react';

const ChatInput = ({ uuid, auth, onMessageSent }) => {
    const [message, setMessage] = useState('');
    const [sending, setSending] = useState(false);  // to prevent double submission
    const [typingTimeout, setTypingTimeout] = useState(null);

    const sendMessage = async (e) => {
        e.preventDefault();
        const trimmed = message.trim();
        if (!trimmed || !uuid) return;
        if (!auth.user) {
            alert('Please log in to send a message.');
            router.visit(route('login'));
            return;
        }
        setSending(true);
        // Generate a temporary ID for this message for tracking
        const tempId = Date.now().toString();
        // Optimistically add the message to the UI with "sending" status
        onMessageSent(trimmed, tempId);
        setMessage('');
        try {
            // Send the message to the backend (DeviceCommand with command 'message')
            await axios.post(route('session.device.command', { uuid }), {
                command: 'message',
                payload: { message: trimmed, messageId: tempId }
            });
            console.log('ChatInput: Message sent to backend successfully.');
            // Upon success, we could update status to "sent", but the ACK from device will mark delivered.
            // The sending status will be updated in ChatManager when ACK arrives.
        } catch (error) {
            console.error('ChatInput: Failed to send message to backend.', error);
            // Mark the message as failed if error occurs
            window.chatManager && window.chatManager.addMessage(uuid, {
                id: tempId,
                sender: 'You',
                text: trimmed,
                isReply: false,
                timestamp: new Date(),
                status: 'error'   // indicate send failure
            });
        } finally {
            setSending(false);
        }
    };

    const handleInputChange = (e) => {
        setMessage(e.target.value);
        if (!auth.user) return;
        // Notify that the admin is typing (throttle to send infrequently)
        if (window.Echo && window.Echo.connector && window.Echo.connector.pusher) {
            try {
                axios.post(route('session.device.command', { uuid }), {
                    command: 'typing',
                    payload: {}
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

    return (
        <form onSubmit={sendMessage} className="flex gap-2">
            <TextInput
                type="text"
                value={message}
                onChange={handleInputChange}
                placeholder={auth.user ? "Type your message..." : "Log in to chat"}
                className="flex-grow"
                autoComplete="off"
                disabled={!auth.user || sending}
            />
            <PrimaryButton type="submit" disabled={!auth.user || sending || !message.trim()}>
                Send
            </PrimaryButton>
        </form>
    );
};

export default ChatInput;
