
import React, { useState, useEffect, useCallback } from 'react';
import PersistentChatWindow from './PersistentChatWindow';
import { usePage } from '@inertiajs/react';
import axios from 'axios';

import { route } from 'ziggy-js';

const generateId = () => Date.now().toString() + Math.random().toString(36).substr(2,5);


const ChatManager = ({ auth }) => {
    const [activeChats, setActiveChats] = useState([]);
    const [devices, setDevices] = useState([]);
    const [connectionState, setConnectionState] = useState('connected');

    const loggedIn = !!(auth && auth.user);

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

    const openChat = useCallback((device) => {
        setActiveChats(prevChats => {
            const chatExists = prevChats.find(c => c.uuid === device.uuid);
            if (chatExists) {
                return prevChats.map(c =>
                    c.uuid === device.uuid
                        ? { ...c, minimized: false, name: device.name || c.name }
                        : c
                );
            }

            return [
                { ...device, messages: [], minimized: false },
                ...prevChats
            ];
        });
    });


    const closeChat = (uuid) => {
        setActiveChats(prev => prev.filter(c => c.uuid !== uuid));
    };

    const minimizeChat = (uuid) => {
        setActiveChats(prev => prev.map(c => c.uuid === uuid ? { ...c, minimized: !c.minimized } : c));
    };

    const addMessage = useCallback((uuid, message) => {
        let device = devices.find(d => d.uuid === uuid);

        setActiveChats(prev => {
            let chat = prev.find(c => c.uuid === uuid);
            if (!chat) {
                if (!device) {
                    device = { uuid, name: message.isReply ? 'Admin' : 'Device' };
                }
                chat = { ...device, messages: [], minimized: false };
                prev = [chat, ...prev];
            }

            const exists = chat.messages.some(m => m.id === message.id);
            if (!exists) {
                if (!message.id) {
                    message.id = generateId();
                }
                chat = { ...chat, messages: [...chat.messages, message] };
            }

            return prev.map(c => (c.uuid === uuid ? chat : c));
        });
    }, [devices]);


    useEffect(() => {
        if (!loggedIn) return;
        requestNotificationPermission();
        axios.get(route('devices.list'))
            .then(res => setDevices(res.data.devices || []))
            .catch(err => console.error('Failed to load initial devices', err));
    }, [loggedIn]);



        // --- LOGIC FOR ADMIN (subscribe to device channels) ---
    useEffect(() => {
        if (!loggedIn || devices.length === 0) return;
        const onlineDevices = devices.filter(d => d.online);
        if (onlineDevices.length > 0) {
            // Subscribe to online devices so admin clients see each other's messages
            onlineDevices.forEach(device => {
                const channel = window.Echo.private(`device.${device.uuid}`);
                // Listen for messages from devices or other admins
                channel.listen('.DeviceMessage', (e) => {
                    console.log('Received DeviceMessage', device.uuid, e);
                    const incoming = e.senderUuid === device.uuid;
                    const msg = {
                        id: e.messageId || generateId(),
                        sender: e.senderName || (incoming ? 'Device' : 'Admin'),
                        text: e.message,
                        isReply: incoming,
                        timestamp: new Date(),
                        status: incoming ? 'delivered' : 'sent'
                    };
                    // Ensure the chat is visible when a new message arrives
                    openChat(device);
                    addMessage(device.uuid, msg);
                });
                // Listen for device acknowledgments (read/delivered receipts or typing indicators)
                channel.listen('.DeviceCommand', (e) => {
                    if (!e.command) return;
                    if (e.command === 'typing' && e.senderUuid === device.uuid) {
                        console.log('Typing from device', device.uuid);
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
                onlineDevices.forEach(device => {
                    window.Echo.leave(`private-device.${device.uuid}`);
                });
                delete window.chatManager;
            };
        }
    }, [loggedIn, devices, addMessage, openChat]);

    // Monitor Pusher/Echo connection state
    useEffect(() => {
        if (!window.Echo) return;
        const pusherConnection = window.Echo.connector.pusher.connection;
        const onStateChange = (states) => {
            console.log("Connection state changed:", states.current);
            setConnectionState(states.current);
        };
        pusherConnection.bind('state_change', onStateChange);
        return () => {
            pusherConnection.unbind('state_change', onStateChange);
        };
    }, []);


    useEffect(() => {
        const uuid = localStorage.getItem('device_uuid');
        if (loggedIn || !uuid) return;
        // When device client loads, fetch any messages sent while it was offline
        axios.get(route('devices.messages.history', { uuid }))
            .then(res => {
                const history = res.data.messages || [];
                if (history.length > 0) {
                    // Open chat window if not already
                    openChat({ uuid, name: 'Admin' });
                    history.forEach(record => {
                        const incoming = record.sender_id !== uuid;  // if sender is not this device, it's from Admin
                        const msg = {
                            id: record.id.toString(),
                            sender: incoming ? 'Admin' : 'You',
                            text: record.message,
                            isReply: incoming,
                            timestamp: new Date(record.created_at),
                            status: incoming ? 'delivered' : (record.read_at ? 'read' : 'sent')
                        };
                        addMessage(uuid, msg);
                    });
                }
            })
            .catch(err => console.error('Failed to load message history for device', err));
    }, [loggedIn]);


    // --- LOGIC FOR REMOTE DEVICE (subscribe to its own channel) ---
    useEffect(() => {
        const uuid = localStorage.getItem('device_uuid');
        if (loggedIn || !uuid) return;
        const channel = window.Echo.private(`device.${uuid}`);
        channel.listen('.DeviceCommand', (event) => {

            console.log(`Received command for device ${uuid}:`, event);
            if (event.command === 'message' && event.payload && event.payload.message) {
                console.log('Received message from admin:', event.payload.message);
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
                console.log('Typing from admin');
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
            }
        });
        return () => {
            window.Echo.leave(`private-device.${uuid}`);
        };


    }, [loggedIn, addMessage, openChat]);

    if (!loggedIn) return null;

    return (
        <div className="fixed bottom-0 right-0 z-50 flex flex-row-reverse items-end p-4 space-x-4 space-x-reverse">
            {activeChats.map(chat => (
                <PersistentChatWindow
                    key={chat.uuid}
                    chat={{ ...chat, connectionState }}
                    auth={auth}
                    onClose={() => closeChat(chat.uuid)}
                    onMinimize={() => minimizeChat(chat.uuid)}
                    onMessageSent={(text, tempId) => {
                        // When the user sends a message, add it with status "sending"
                        const message = {
                            id: tempId || generateId(),
                            sender: 'You',
                            text,
                            isReply: false,      // outgoing from this client
                            timestamp: new Date(),
                            status: 'sending'    // initial status

                        };
                        addMessage(chat.uuid, message);
                    }}
                />
            ))}
        </div>
    );
};

export default ChatManager;
