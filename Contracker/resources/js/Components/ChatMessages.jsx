import React from 'react';

const ChatMessages = ({ messages = [] }) => {
    return (
        <div>
            {messages.map((msg, index) => (
                <div key={index} className={`flex flex-col mb-3 ${!msg.isReply ? 'items-end' : 'items-start'}`}>
                    {/* Display the sender's name above the message bubble */}
                    <div className="text-xs text-gray-500 dark:text-gray-400 px-1">
                        {msg.sender}
                    </div>
                    <div className={`py-2 px-3 rounded-lg max-w-[80%] break-words ${!msg.isReply ? 'bg-blue-600 text-white' : 'bg-gray-200 dark:bg-gray-700 text-black dark:text-white'}`}>
                        <p className="text-sm">{msg.text}</p>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default ChatMessages;