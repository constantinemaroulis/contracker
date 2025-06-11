import React from 'react';
import ChatMessages from './ChatMessages';
import ChatInput from './ChatInput';
import DeviceChatInput from './DeviceChatInput';

const PersistentChatWindow = ({ chat, auth, onClose, onMinimize, onMessageSent }) => {

    const handleSendMessage = (messageText) => {
        if (onMessageSent) {
            onMessageSent(messageText);
        }
    };

    return (
        <div className="w-80 h-[28rem] bg-white dark:bg-gray-800 rounded-t-lg shadow-2xl flex flex-col">
            <div
                onClick={onMinimize}
                className="flex justify-between items-center p-2 bg-gray-700 dark:bg-gray-900 text-white rounded-t-lg cursor-pointer"
            >
                <h3 className="font-semibold text-sm truncate">{chat.name || chat.uuid}</h3>
                <div>
                    <button onClick={(e) => { e.stopPropagation(); onMinimize(); }} className="px-2 text-lg hover:bg-gray-600 rounded">-</button>
                    <button onClick={(e) => { e.stopPropagation(); onClose(); }} className="px-2 text-lg hover:bg-gray-600 rounded">×</button>
                </div>
            </div>

            {!chat.minimized && (
                <>
                    <div className="flex-grow p-4 overflow-y-auto border-x border-gray-300 dark:border-gray-600">
                        <ChatMessages messages={chat.messages} />
                    </div>
                    <div className="p-2 border-t border-gray-300 dark:border-gray-600">
                        {auth && auth.user ? (
                            <ChatInput uuid={chat.uuid} auth={auth} onMessageSent={handleSendMessage} />
                        ) : (
                            <DeviceChatInput uuid={chat.uuid} onMessageSent={handleSendMessage} />
                        )}
                    </div>
                </>
            )}
        </div>
    );
};

export default PersistentChatWindow;