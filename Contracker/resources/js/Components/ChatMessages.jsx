import React, { useState, useEffect } from 'react';
import '../echo'; // Ensure Echo is initialized

const ChatMessages = () => {
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    const uuid = localStorage.getItem('device_uuid');
    if (!uuid) return;

    const channel = window.Echo.private(`device.${uuid}`);

    channel.listen('.DeviceMessage', (e) => {
      setMessages((prevMessages) => [...prevMessages, e.message]);
    });

    return () => {
      window.Echo.leave(`device.${uuid}`);
    };
  }, []);

  return (
    <div>
      {messages.map((msg, index) => (
        <div key={index}>{msg}</div>
      ))}
    </div>
  );
};

export default ChatMessages;
