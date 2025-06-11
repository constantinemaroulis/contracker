import React from 'react';
import ChatMessages from './ChatMessages';
import ChatInput from './ChatInput';
import DeviceChatInput from './DeviceChatInput';

const PersistentChatWindow = ({ chat, auth, onClose, onMinimize, onMessageSent }) => {

<<<<<<< Updated upstream
    const handleSendMessage = (messageText) => {
        if (onMessageSent) {
            onMessageSent(messageText);
        }
=======
    // Get the device's UUID from local storage on component mount
    useEffect(() => {
        setUuid(localStorage.getItem('device_uuid'));
    }, []);

    // Listen for incoming chat commands from the admin
    useEffect(() => {
        if (!uuid) return;

        const channel = window.Echo.private(`device.${uuid}`);
        const handleCommand = (event) => {
            const data = event.data || event; // Handle different event structures
            if (data.command === 'message' && data.payload && data.payload.message) {
                // Add the received message to the state and open the modal
                setMessages(prev => [...prev, { sender: 'Admin', text: data.payload.message, isReply: true, timestamp: data.timestamp || new Date().toISOString() }]);
                setModalOpen(true);
            }
        };

        channel.listen('.DeviceCommand', handleCommand);

        // As a fallback, also listen for the fully qualified class name
        channel.listen('App\\Events\\DeviceCommand', handleCommand);

        return () => {
            channel.stopListening('.DeviceCommand');
            channel.stopListening('App\\Events\\DeviceCommand');
        };
    }, [uuid]);

    // Add the user's own reply to the message list for optimistic UI
    const handleSendMessage = useCallback((messageText) => {
        setMessages(prev => [...prev, { sender: 'You', text: messageText, isReply: false, timestamp: new Date().toISOString() }]);
    }, []);

    const closeModal = () => {
        setModalOpen(false);
>>>>>>> Stashed changes
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

<<<<<<< Updated upstream
export default PersistentChatWindow;
=======
export default RemoteChatManager;
>>>>>>> Stashed changes
