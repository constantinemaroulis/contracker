import React, { useState } from 'react';
import axios from 'axios';
import PrimaryButton from './PrimaryButton';
import TextInput from './TextInput';
import { usePage, router } from '@inertiajs/react';

const ChatInput = ({ uuid }) => {
  const [message, setMessage] = useState('');
  const { auth } = usePage().props;

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!message.trim() || !uuid) return;

    if (!auth.user) {
        alert('Please log in to send a message.');
        router.visit(route('login'));
        return;
    }

    try {
      await axios.post(route('session.device.command', { uuid }), {
        command: 'message',
        payload: { message: message }
      });
      setMessage('');
    } catch (error) {
      if (error.response && (error.response.status === 401 || error.response.status === 419)) {
          alert('Your session has expired. Please log in again to send messages.');
          router.visit(route('login'));
      } else {
          console.error('Error sending message:', error);
          alert('An error occurred while sending the message.');
      }
    }
  };

  return (
    <form onSubmit={sendMessage} className="flex gap-2">
      <TextInput
        type="text"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder={auth.user ? "Type your message..." : "Log in to chat with devices"}
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