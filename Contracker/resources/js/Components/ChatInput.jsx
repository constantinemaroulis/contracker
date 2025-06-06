import React, { useState } from 'react';
import axios from 'axios';

const ChatInput = () => {
  const [message, setMessage] = useState('');

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!message.trim()) return;

    const uuid = localStorage.getItem('device_uuid');
    if (!uuid) return;

    try {
      await axios.post(route('devices.message.send'), {
        uuid,
        message,
      });
      setMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  return (
    <form onSubmit={sendMessage}>
      <input
        type="text"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Type your message..."
      />
      <button type="submit">Send</button>
    </form>
  );
};

export default ChatInput;
