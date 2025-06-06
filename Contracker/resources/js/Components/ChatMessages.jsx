import React, { useState, useEffect } from 'react';
import '../echo';

const ChatMessages = ({ uuid }) => {
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    if (!uuid) return;

    setMessages([]); // Clear messages when the device changes
    const channel = window.Echo.private(`device.${uuid}`);

    // Listen for messages FROM the device
    channel.listen('.DeviceMessage', (e) => {
      setMessages((prevMessages) => [...prevMessages, {sender: 'device', text: e.message}]);
    });

    // Listen for commands (messages TO the device) to display them as well
    channel.listen('.DeviceCommand', (e) => {
        if(e.command === 'message'){
            setMessages((prevMessages) => [...prevMessages, {sender: 'you', text: e.payload.message}]);
        }
    });

    return () => {
      window.Echo.leave(`device.${uuid}`);
    };
  }, [uuid]);

  return (
    <div>
      {messages.map((msg, index) => (
        <div key={index} className={`p-2 my-1 rounded-lg ${msg.sender === 'device' ? 'bg-gray-200 dark:bg-gray-600 text-black dark:text-white text-left' : 'bg-blue-500 text-white text-right ml-auto'}`} style={{maxWidth: '80%'}}>
            <strong>{msg.sender === 'device' ? 'Device:' : 'You:'}</strong> {msg.text}
        </div>
      ))}
    </div>
  );
};

export default ChatMessages;