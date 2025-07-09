
import React, { useState, useEffect, useCallback } from 'react';
import PersistentChatWindow from './PersistentChatWindow';
import { usePage } from '@inertiajs/react';
import axios from 'axios';
import { route } from 'ziggy-js';

const ChatManager = ({ auth }) => {
    const [activeChats, setActiveChats] = useState([]);
    const [devices, setDevices] = useState([]);

    const requestNotificationPermission = () => {
        if ('Notification' in window && Notification.permission !== 'granted') {
            Notification.requestPermission();
        }
    };

    const sendNotification = (title, body) => {
        if ('Notification' in window && Notification.permission === 'granted') {
            new Notification(title, { body });
        }
    };

    const openChat = (device) => {
        setActiveChats(prevChats => {
            const chatExists = prevChats.find(c => c.uuid === device.uuid);
            if (chatExists) {
                return [
                    { ...chatExists, minimized: false },
                    ...prevChats.filter(c => c.uuid !== device.uuid)
                ];
            }
            return [
                { ...device, messages: [], minimized: false },
                ...prevChats
            ];
        });
    };

    const closeChat = (uuid) => {
        setActiveChats(prev => prev.filter(c => c.uuid !== uuid));
    };

    const minimizeChat = (uuid) => {
        setActiveChats(prev => prev.map(c => c.uuid === uuid ? { ...c, minimized: !c.minimized } : c));
    };

    const addMessage = useCallback((uuid, message) => {
        setActiveChats(prev => {
            const chatExists = prev.find(c => c.uuid === uuid);
            if (!chatExists) {
                const device = devices.find(d => d.uuid === uuid);
                if(device) openChat(device);
            }

            sendNotification(message.sender, message.text);

            return prev.map(c =>
                c.uuid === uuid
                    ? { ...c, messages: [...c.messages, message], minimized: false }
                    : c
            );
        });
<<<<<<< HEAD

            if (message.isReply) {
            // `isReply` true means this message was sent by the other party and received here
            // Send acknowledgment back for delivery/read
            try {
                // Send a delivery confirmation (and immediately send read receipt)
                const senderUuid = localStorage.getItem('device_uuid');
                axios.post(route('session.device.command', { uuid }), {
                    sender_uuid: senderUuid,
                    command: 'ack',
                    payload: { messageId: message.id, status: 'delivered', recipient_uuid: uuid }
                });
                // Optionally, send a separate read receipt after a short delay
                setTimeout(() => {
                    axios.post(route('session.device.command', { uuid }), {
                        sender_uuid: senderUuid,
                        command: 'ack',
                        payload: { messageId: message.id, status: 'read', recipient_uuid: uuid }
                    });
                }, 1000);
            } catch (error) {
                console.error('Failed to send read receipt ACK for message', message.id, error);
            }
        }
=======
>>>>>>> parent of 40c4ad1 (Better chat)
    }, [devices]);

    useEffect(() => {
        requestNotificationPermission();
        axios.get(route('devices.list'))
            .then(res => setDevices(res.data.devices || []))
            .catch(err => console.error('Failed to load initial devices', err));
    }, []);

    useEffect(() => {
        if (devices.length === 0 || !auth.user) return;
        const activeListeners = {};

        devices.forEach(device => {
            if (!activeListeners[device.uuid]) {
                const channel = window.Echo.private(`device.${device.uuid}`);
                channel.listen('.DeviceMessage', (e) => {
                    addMessage(device.uuid, {
                        sender: e.senderName || 'Device',
                        text: e.message,
                        isReply: true,
                        timestamp: new Date()
                    });
                });
                activeListeners[device.uuid] = channel;
            }
        });

        window.chatManager = { openChat, addMessage };

        return () => {
            Object.values(activeListeners).forEach(channel => window.Echo.leave(channel.name));
            delete window.chatManager;
        };
    }, [devices, auth.user, addMessage]);

<<<<<<< HEAD
        // --- LOGIC FOR ADMIN (subscribe to device channels) ---
    useEffect(() => {
        if (!auth.user) return;
        // Load device list (to know names/online status)
        axios.get(route('devices.list'))
            .then(res => setDevices(res.data.devices || []))
            .catch(err => console.error('Failed to load device list', err));
        if (devices.length > 0) {
            devices.forEach(device => {
                const channel = window.Echo.private(`device.${device.uuid}`);
                // Listen for messages from devices
                channel.listen('.DeviceMessage', (e) => {
                    const msg = {
                        id: e.messageId || generateId(),
                        sender: e.senderName || 'Device',
                        text: e.message,
                        isReply: true,       // incoming to admin
                        timestamp: new Date(),
                        status: 'delivered'  // delivered to admin client
                    };
                    addMessage(device.uuid, msg);
                });
                // Listen for device acknowledgments (read/delivered receipts or typing indicators)
                channel.listen('.DeviceCommand', (e) => {
                    if (!e.command) return;
                    if (e.command === 'typing' && e.senderUuid === device.uuid) {
                        // Device typing indicator
                        setActiveChats(prev => prev.map(c =>
                            c.uuid === device.uuid ? { ...c, typing: true } : c
                        ));
                        // Remove typing indicator after a short time of inactivity
                        setTimeout(() => {
                            setActiveChats(prev => prev.map(c =>
                                c.uuid === device.uuid ? { ...c, typing: false } : c
                            ));
                        }, 3000);
                    }
                    if (e.command === 'ack' && e.payload) {
                        // Device sent an acknowledgment (delivered/read) for a message
                        const { messageId, status } = e.payload;
                        // Update the status of the message with given ID in the chat state
                        setActiveChats(prevChats => prevChats.map(chat => {
                            if (chat.uuid !== device.uuid) return chat;
                            const updatedMessages = chat.messages.map(msg => {
                                if (msg.id === messageId) {
                                    // Upgrade status: 'delivered' or 'read'
                                    if (status === 'delivered' && msg.status === 'sent') {
                                        msg.status = 'delivered';
                                    }
                                    if (status === 'read') {
                                        msg.status = 'read';
                                    }
                                }
                                return msg;
                            });
                            return { ...chat, messages: updatedMessages };
                        }));
                    }
                    if (e.command === 'edit' && e.payload) {
                        const { messageId, newText } = e.payload;
                        // Update the message text in the chat state
                        setActiveChats(prevChats => prevChats.map(chat => {
                            if (chat.uuid !== device.uuid) return chat;
                            const updatedMessages = chat.messages.map(msg =>
                                msg.id == messageId ? { ...msg, text: newText } : msg
                            );
                            return { ...chat, messages: updatedMessages };
                        }));
                    }
                    if (e.command === 'delete' && e.payload) {
                        const { messageId } = e.payload;
                        setActiveChats(prevChats => prevChats.map(chat => {
                            if (chat.uuid !== device.uuid) return chat;
                            const updatedMessages = chat.messages.map(msg => {
                                if (msg.id == messageId) {
                                    msg.deleted = true;
                                    msg.text = '';  // clear text (we'll display placeholder)
                                }
                                return msg;
                            });
                            return { ...chat, messages: updatedMessages };
                        }));
                    }
                });
            });
            window.chatManager = { openChat, addMessage };
            // Cleanup on unmount: leave channels and remove global ref
            return () => {
                devices.forEach(device => {
                    window.Echo.leave(`private-device.${device.uuid}`);
                });
                delete window.chatManager;
            };
        }
    }, [auth.user, devices, addMessage]);

    // Monitor Pusher/Echo connection state
    useEffect(() => {
        if (!window.Echo) return;
        const pusherConnection = window.Echo.connector.pusher.connection;
        const onStateChange = (states) => {
            console.log("Connection state changed:", states.current);
            setConnectionState(states.current);
            // If reconnected, retry any pending messages
            if (states.current === 'connected') {
                activeChats.forEach(chat => {
                    chat.messages
                        .filter(msg => msg.status === 'error')
                        .forEach(msg => {
                            // Attempt to resend
                            if (auth.user) {
                                // Admin resending a failed message
                                const senderUuid = localStorage.getItem('device_uuid');
                                axios.post(route('session.device.command', { uuid: chat.uuid }), {
                                    sender_uuid: senderUuid,
                                    command: 'message',
                                    payload: { message: msg.text, messageId: msg.id, recipient_uuid: chat.uuid }
                                }).then(() => {
                                    // Update status to "sent" on success
                                    setActiveChats(prev => prev.map(c => {
                                        if (c.uuid !== chat.uuid) return c;
                                        return {
                                            ...c,
                                            messages: c.messages.map(m => m.id === msg.id
                                                ? { ...m, status: 'sent' }
                                                : m
                                            )
                                        };
                                    }));
                                }).catch(err => console.error('Retry send failed for message', msg.id, err));
                            } else {
                                // Device resending a failed message
                                axios.post(route('devices.message.send'), {
                                    uuid: chat.uuid,
                                    sender_uuid: localStorage.getItem('device_uuid'),
                                    recipient_uuid: 'admin',
                                    message: msg.text,
                                    messageId: msg.id
                                }).then(() => {
                                    setActiveChats(prev => prev.map(c => {
                                        if (c.uuid !== chat.uuid) return c;
                                        return {
                                            ...c,
                                            messages: c.messages.map(m => m.id === msg.id
                                                ? { ...m, status: 'sent' }
                                                : m
                                            )
                                        };
                                    }));
                                }).catch(err => console.error('Retry send (device) failed for', msg.id, err));
                            }
                        });
                });
            }
        };
        pusherConnection.bind('state_change', onStateChange);
        return () => {
            pusherConnection.unbind('state_change', onStateChange);
        };
    }, [activeChats, auth.user]);

=======
>>>>>>> parent of 40c4ad1 (Better chat)
    useEffect(() => {
        const uuid = localStorage.getItem('device_uuid');
        if (!uuid) return;

        const channel = window.Echo.private(`device.${uuid}`);
        channel.listen('.DeviceCommand', (event) => {
<<<<<<< HEAD
            console.log(`Received command for device ${uuid}:`, event);
            if (event.command === 'message' && event.payload && event.payload.message) {
                // Incoming message from Admin
                const adminName = 'Admin';
                openChat({ uuid, name: adminName });  // ensure chat window open
                const msg = {
                    id: event.payload.messageId || generateId(),
                    sender: adminName,
                    text: event.payload.message,
                    isReply: true,         // incoming to device
                    timestamp: new Date(),
                    status: 'delivered'    // delivered to device client
                };
                addMessage(uuid, msg);
                // Send acknowledgment back to admin for delivery and read
                try {
                    axios.post(route('devices.message.send'), {
                        uuid,
                        sender_uuid: localStorage.getItem('device_uuid'),
                        recipient_uuid: 'admin',
                        message: '',  // no text for ack, we use command instead
                        ack: true,
                        messageId: msg.id,
                        status: 'delivered'
                    });
                } catch (err) {
                    console.error('Failed to send delivered ACK from device.', err);
                }
                setTimeout(() => {
                    try {
                        axios.post(route('devices.message.send'), {
                            uuid,
                            sender_uuid: localStorage.getItem('device_uuid'),
                            recipient_uuid: 'admin',
                            message: '',
                            ack: true,
                            messageId: msg.id,
                            status: 'read'
                        });
                    } catch (err) {
                        console.error('Failed to send read ACK from device.', err);
                    }
                }, 1000);
            }

            if (event.command === 'typing' && event.senderUuid && event.senderUuid !== uuid) {
                // Admin typing indicator
                openChat({ uuid, name: 'Admin' });
                setActiveChats(prev => prev.map(c =>
                    c.uuid === uuid ? { ...c, typing: true } : c
                ));
                setTimeout(() => {
                    setActiveChats(prev => prev.map(c =>
                        c.uuid === uuid ? { ...c, typing: false } : c
                    ));
                }, 3000);
            }
            if (event.command === 'edit' && event.payload) {
                const { messageId, newText } = event.payload;
                // Update message text in device's chat
                setActiveChats(prevChats => prevChats.map(chat => {
                    if (chat.uuid !== uuid) return chat;
                    const updatedMessages = chat.messages.map(m =>
                        m.id == messageId ? { ...m, text: newText } : m
                    );
                    return { ...chat, messages: updatedMessages };
                }));
            }
            if (event.command === 'delete' && event.payload) {
                const { messageId } = event.payload;
                setActiveChats(prevChats => prevChats.map(chat => {
                    if (chat.uuid !== uuid) return chat;
                    const updatedMessages = chat.messages.map(m => {
                        if (m.id == messageId) {
                            m.deleted = true;
                            m.text = '';
                        }
                        return m;
                    });
                    return { ...chat, messages: updatedMessages };
                }));
=======
            console.log(`Received message event for device ${uuid}:`, event);
            const data = event.data || event;
            if (data.command === 'message' && data.payload && data.payload.message) {
                const device = { uuid, name: 'Admin' }; // Create a temporary device object for the admin
                openChat(device);
                addMessage(uuid, {
                    sender: 'Admin',
                    text: data.payload.message,
                    isReply: true,
                    timestamp: new Date()
                });
>>>>>>> parent of 40c4ad1 (Better chat)
            }
        });

        return () => { window.Echo.leave(`device.${uuid}`); };
    }, [auth.user, addMessage]);

    return (
        <div className="fixed bottom-0 right-0 z-50 flex flex-row-reverse items-end p-4 space-x-4 space-x-reverse">
            {activeChats.map((chat) => (
                <PersistentChatWindow
                    key={chat.uuid}
                    chat={chat}
                    auth={auth}
                    onClose={() => closeChat(chat.uuid)}
                    onMinimize={() => minimizeChat(chat.uuid)}
                    onMessageSent={(messageText) => {
                        const message = {
                            sender: 'You',
                            text: messageText,
                            isReply: false,
                            timestamp: new Date()
                        };
                        addMessage(chat.uuid, message);
                    }}
                />
            ))}
        </div>
    );
};

export default ChatManager;
