import React, { useState, useEffect, useCallback } from 'react';
import PersistentChatWindow from './PersistentChatWindow';
import { usePage } from '@inertiajs/react';
import axios from 'axios';

const ChatManager = ({ auth }) => {
    const [activeChats, setActiveChats] = useState([]);
    const [devices, setDevices] = useState([]);

    const openChat = useCallback((device) => {
        setActiveChats(prevChats => {
            const chatExists = prevChats.find(c => c.uuid === device.uuid);
            if (chatExists) {
                return [{ ...chatExists, minimized: false }, ...prevChats.filter(c => c.uuid !== device.uuid)];
            }
            return [{ ...device, messages: [], minimized: false }, ...prevChats];
        });
    }, []);

    const closeChat = (uuid) => {
        setActiveChats(prev => prev.filter(c => c.uuid !== uuid));
    };

    const minimizeChat = (uuid) => {
        setActiveChats(prev => prev.map(c => c.uuid === uuid ? { ...c, minimized: !c.minimized } : c));
    };

    const addMessage = useCallback((uuid, message) => {
        // Find the full device object to ensure the chat window has a name
        const device = devices.find(d => d.uuid === uuid);
        setActiveChats(prev => {
            const chatExists = prev.find(c => c.uuid === uuid);
            // If message arrives for a chat that isn't open, open it.
            if (!chatExists && device) {
                // Use the openChat function to avoid duplicating logic
                openChat(device);
            }
            return prev.map(c =>
                c.uuid === uuid
                    ? { ...c, messages: [...c.messages, message], minimized: false }
                    : c
            );
        });
    }, [devices, openChat]);


    // --- LOGIC FOR ADMIN ---
    useEffect(() => {
        

        axios.get(route('devices.list'))
            .then(res => setDevices(res.data.devices || []))
            .catch(err => console.error('Failed to load initial devices', err));

        if (devices.length > 0) {
            devices.forEach(device => {
                const channel = window.Echo.private(`device.${device.uuid}`);
                channel.listen('.DeviceMessage', (e) => {
                    addMessage(device.uuid, {
                        sender: e.senderName || 'Device',
                        text: e.message,
                        isReply: true,
                        timestamp: new Date()
                    });
                });
            });

            window.chatManager = { openChat, addMessage };

            // **THIS IS THE CORRECTED CLEANUP FUNCTION**
            return () => {
                // We loop through the devices again and leave each channel by its name.
                // This correctly accesses the 'device' variable within this scope.
                devices.forEach(device => {
                    window.Echo.leave(`private-device.${device.uuid}`);
                });
                delete window.chatManager;
            };
        }
    }, [auth.user, devices, addMessage, openChat]);


    // --- LOGIC FOR REMOTE DEVICE ---
    useEffect(() => {
        const uuid = localStorage.getItem('device_uuid');
        if (auth.user || !uuid) return;

        const channel = window.Echo.private(`device.${uuid}`);
        channel.listen('.DeviceCommand', (event) => {
            console.log(`Received message event for device ${uuid}:`, event);
            if (event.command === 'message' && event.payload && event.payload.message) {
                const deviceForChat = { uuid, name: 'Admin' };
                // Using openChat ensures the window is created correctly
                openChat(deviceForChat);
                addMessage(uuid, {
                    sender: 'Admin',
                    text: event.payload.message,
                    isReply: true,
                    timestamp: new Date()
                });
            }
        });
        // This cleanup function was already correct.
        return () => {
            window.Echo.leave(`private-device.${uuid}`);
        };
    }, [auth.user, addMessage, openChat]);


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