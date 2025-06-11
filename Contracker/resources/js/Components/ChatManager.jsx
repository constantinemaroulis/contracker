
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

    useEffect(() => {
        const uuid = localStorage.getItem('device_uuid');
        if (!uuid) return;

        const channel = window.Echo.private(`device.${uuid}`);
        channel.listen('.DeviceCommand', (event) => {
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
