import React, { useState } from 'react';
import ChatMessages from './ChatMessages';
import ChatInput from './ChatInput';
import DeviceChatInput from './DeviceChatInput';

// The usePage import has been removed.

const PersistentChatWindow = ({ chat, auth, onClose, onMinimize, onMessageSent }) => {
    // The usePage() call has been removed. 'auth' is now a prop.
    const [editingId, setEditingId] = useState(null);

    const handleEditRequest = (messageId, originalText) => {
        if (!messageId) {
            // Cancel editing
            setEditingId(null);
        } else {
            // Enter edit mode for the given message
            setEditingId(messageId);
        }
    };

    const handleEditSubmit = async (messageId, newText) => {
        setEditingId(null);
        if (!messageId || newText == null) return;
        // Update locally
        const uuid = chat.uuid;
        window.chatManager && window.chatManager.addMessage(uuid, {
            id: messageId,
            sender: 'You',
            text: newText,
            isReply: false,
            timestamp: new Date(),
            status: 'sent'  // assume sent; will update when ack comes
        });
        try {
            // Send edit request to server
            await axios.put(route('devices.message.update', { id: messageId }), {
                message: newText,
                uuid: uuid
            });
            console.log('Message edited on server');
        } catch (err) {
            console.error('Edit failed', err);
        }
    };

    const handleDelete = async (messageId) => {
        if (!confirm('Delete this message?')) return;
        const uuid = chat.uuid;
        // Optimistically mark as deleted in UI
        window.chatManager && window.chatManager.addMessage(uuid, {
            id: messageId,
            sender: 'You',
            text: '',
            isReply: false,
            timestamp: new Date(),
            status: chat.messages.find(m => m.id === messageId)?.status,
            deleted: true
        });
        try {
            await axios.delete(route('devices.message.delete', { id: messageId }));
            console.log('Message deleted on server');
        } catch (err) {
            console.error('Delete failed', err);
        }
    };

    const handleSendMessage = (messageText) => {
        // This function now correctly calls the onMessageSent prop
        // which is managed by the ChatManager.
        if (onMessageSent) {
            onMessageSent(messageText);
        }
    };

    return (
        <div className="w-80 h-[28rem] bg-white dark:bg-gray-800 rounded-t-lg shadow-2xl flex flex-col">
            {/* Header */}
            <div onClick={onMinimize} className="flex justify-between items-center p-2 bg-gray-700 dark:bg-gray-900 text-white rounded-t-lg cursor-pointer">
                <h3 className="font-semibold text-sm truncate">{chat.name || chat.uuid}</h3>
                <div>
                    <button onClick={(e) => { e.stopPropagation(); onMinimize(); }} className="px-2 text-lg hover:bg-gray-600 rounded">-</button>
                    <button onClick={(e) => { e.stopPropagation(); onClose(); }} className="px-2 text-lg hover:bg-gray-600 rounded">×</button>
                </div>
            </div>
            {/* Content */}
            {/* Inside PersistentChatWindow, above the messages list */}
                {chat.connectionState && chat.connectionState !== 'connected' && !chat.minimized && (
                    <div className="text-xs text-yellow-800 bg-yellow-100 p-1 mb-1 text-center">
                        {chat.connectionState === 'connecting' && 'Connecting...'}
                        {chat.connectionState === 'disconnected' && 'Disconnected. Messages will send when reconnected.'}
                        {chat.connectionState === 'unavailable' && 'Server unavailable. Retrying...'}
                    </div>
                )}
            {!chat.minimized && (
                <>
                    <div className="flex-grow p-4 overflow-y-auto border-x border-gray-300 dark:border-gray-600">
                        <ChatMessages
                            messages={chat.messages}
                            onEditMessage={handleEditRequest}
                            onDeleteMessage={handleDelete}
                            editingMessageId={editingId}
                        />
                        {/* Typing indicator as implemented above */}
                        {chat.typing && (
                            <div className="text-xs text-gray-500 italic mt-2">
                                ... {chat.name || 'User'} is typing
                            </div>
                        )}
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
