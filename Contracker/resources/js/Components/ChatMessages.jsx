import React from 'react';

const ChatMessages = ({ messages = [] }) => {
    console.log('ChatMessages: Rendering with messages:', messages);
    return (
        <div>
            {messages.map((msg, index) => (
                <div key={index} className={`flex mb-2 ${msg.sender === 'you' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`py-2 px-3 rounded-lg max-w-[80%] break-words ${msg.sender === 'device' ? 'bg-gray-200 dark:bg-gray-700 text-black dark:text-white' : 'bg-blue-600 text-white'}`}>
                        <p className="text-sm">{msg.text}</p>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default ChatMessages;