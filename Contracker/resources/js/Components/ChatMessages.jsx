import React from 'react';

const ChatMessages = ({ messages = [], onEditMessage, onDeleteMessage, editingMessageId }) => {
    return (
        <div>
            {messages.map(msg => {
                const isOwn = !msg.isReply; // current user's own message
                const isEditing = editingMessageId === msg.id;
                return (
                    <div key={msg.id} className={`flex flex-col mb-3 ${!msg.isReply ? 'items-end' : 'items-start'}`}>
                        {/* Sender name */}
                        <div className="text-xs text-gray-500 dark:text-gray-400 px-1">
                            {msg.sender}
                        </div>
                        {/* Message bubble or edit input */}
                        {isEditing ? (
                            // If this message is being edited, show an input field pre-filled
                            <form onSubmit={(e) => { e.preventDefault(); onEditMessage(msg.id, e.target.elements.editText.value); }}>
                                <input
                                    name="editText"
                                    defaultValue={msg.text}
                                    className="text-sm border border-blue-500 rounded px-2 py-1 w-full"
                                />
                                <div className="text-right mt-1">
                                    <button type="submit" className="text-blue-600 mr-2">Save</button>
                                    <button type="button" onClick={() => onEditMessage(null, null)} className="text-gray-600">Cancel</button>
                                </div>
                            </form>
                        ) : (
                            <div className={`py-2 px-3 rounded-lg max-w-[80%] break-words ${
                                    isOwn
                                    ? (msg.deleted ? 'bg-gray-300 text-gray-600' : 'bg-blue-600 text-white')
                                    : (msg.deleted ? 'bg-gray-300 text-gray-600' : 'bg-gray-200 dark:bg-gray-700 text-black dark:text-white')
                                }`}>
                                <p className="text-sm whitespace-pre-wrap font-normal italic">
                                    {msg.deleted ? 'This message was deleted.' : msg.text}
                                </p>
                            </div>
                        )}
                        {/* Timestamp, status, and actions */}
                        <div className="text-xs text-gray-400 mt-1 px-1 flex items-center space-x-2">
                            {msg.timestamp && (
                                <span>
                                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}
                                </span>
                            )}
                            {isOwn && msg.status && !msg.deleted && (
                                <span className={
                                    msg.status === 'read'
                                        ? 'text-green-600 font-semibold'
                                        : 'text-gray-500'
                                }>
                                    {/* status text as earlier */}
                                    {msg.status === 'sending' && 'Sending...'}
                                    {msg.status === 'sent' && 'Sent'}
                                    {msg.status === 'delivered' && 'Delivered'}
                                    {msg.status === 'read' && 'Read'}
                                    {msg.status === 'error' && 'Failed'}
                                </span>
                            )}
                            {/* Edit/Delete actions for own messages that are not deleted */}
                            {isOwn && !msg.deleted && !isEditing && (
                                <>
                                    <button onClick={() => onEditMessage(msg.id, msg.text)} className="text-blue-500 hover:underline">Edit</button>
                                    <button onClick={() => onDeleteMessage(msg.id)} className="text-red-500 hover:underline">Delete</button>
                                </>
                            )}
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export default ChatMessages;
