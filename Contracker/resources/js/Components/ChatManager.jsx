import React, { useState, useEffect, useCallback } from 'react';
import PersistentChatWindow from './PersistentChatWindow';
import { usePage } from '@inertiajs/react';
<<<<<<< Updated upstream
import axios from 'axios';
=======
>>>>>>> Stashed changes

const ChatManager = ({ auth }) => {
    const [activeChats, setActiveChats] = useState([]);
    const [devices, setDevices] = useState([]);

<<<<<<< Updated upstream
    const openChat = useCallback((device) => {
        setActiveChats(prevChats => {
            const chatExists = prevChats.find(c => c.uuid === device.uuid);
            if (chatExists) {
                return [{ ...chatExists, minimized: false }, ...prevChats.filter(c => c.uuid !== device.uuid)];
            }
            return [{ ...device, messages: [], minimized: false }, ...prevChats];
        });
    }, []);

=======
    // Function to open a new chat window or focus an existing one
    const openChat = (device) => {
        setActiveChats(prevChats => {
            const chatExists = prevChats.find(c => c.uuid === device.uuid);
            if (chatExists) {
                // If chat exists, just un-minimize it and bring to front
                return [
                    { ...chatExists, minimized: false },
                    ...prevChats.filter(c => c.uuid !== device.uuid)
                ];
            }
            // If new, add it to the front of the array
            return [
                { ...device, messages: [], minimized: false },
                ...prevChats
            ];
        });
    };

    // Functions to pass down to the chat window
>>>>>>> Stashed changes
    const closeChat = (uuid) => {
        setActiveChats(prev => prev.filter(c => c.uuid !== uuid));
    };

    const minimizeChat = (uuid) => {
        setActiveChats(prev => prev.map(c => c.uuid === uuid ? { ...c, minimized: !c.minimized } : c));
    };

    const addMessage = useCallback((uuid, message) => {
<<<<<<< Updated upstream
        // Find the full device object to ensure the chat window has a name
        const device = devices.find(d => d.uuid === uuid);
        setActiveChats(prev => {
            const chatExists = prev.find(c => c.uuid === uuid);
            // If message arrives for a chat that isn't open, open it.
            if (!chatExists && device) {
                // Use the openChat function to avoid duplicating logic
                openChat(device);
            }
=======
        setActiveChats(prev => {
            // Ensure the chat window is open if a message arrives
            const chatExists = prev.find(c => c.uuid === uuid);
            if (!chatExists) {
                 const device = devices.find(d => d.uuid === uuid);
                 if(device) {
                    openChat(device);
                 }
            }

>>>>>>> Stashed changes
            return prev.map(c =>
                c.uuid === uuid
                    ? { ...c, messages: [...c.messages, message], minimized: false }
                    : c
            );
        });
<<<<<<< Updated upstream
    }, [devices, openChat]);


    // --- LOGIC FOR ADMIN ---
    useEffect(() => {
        

        axios.get(route('devices.list'))
            .then(res => setDevices(res.data.devices || []))
            .catch(err => console.error('Failed to load initial devices', err));

        if (devices.length > 0) {
            devices.forEach(device => {
=======
    }, [devices]);


    // Effect to fetch all devices to get their info
    useEffect(() => {
        axios.get(route('devices.list'))
            .then(res => setDevices(res.data.devices || []))
            .catch(err => console.error('Failed to load initial devices', err));
    }, []);

    // Effect to set up all listeners
    useEffect(() => {
        if (devices.length === 0 || !auth.user) return;

        const activeListeners = {};

        devices.forEach(device => {
            if (!activeListeners[device.uuid]) {
>>>>>>> Stashed changes
                const channel = window.Echo.private(`device.${device.uuid}`);
                channel.listen('.DeviceMessage', (e) => {
                    addMessage(device.uuid, {
                        sender: e.senderName || 'Device',
                        text: e.message,
                        isReply: true,
                        timestamp: new Date()
                    });
                });
<<<<<<< Updated upstream
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
=======
                activeListeners[device.uuid] = channel;
            }
        });

        // Add this manager to a global scope so other components can access it
        window.chatManager = { openChat, addMessage };

        return () => {
            Object.values(activeListeners).forEach(channel => window.Echo.leave(channel.name));
            delete window.chatManager;
        };
    }, [devices, auth.user, addMessage]);


    // RemoteChatManager logic integrated here
    useEffect(() => {
        const uuid = localStorage.getItem('device_uuid');
        if (!uuid || auth.user) return; // This part is for the device, not the admin

        const channel = window.Echo.private(`device.${uuid}`);
        channel.listen('.DeviceCommand', (event) => {
            const data = event.data || event;
            if (data.command === 'message' && data.payload && data.payload.message) {
                 const device = { uuid, name: 'Admin' }; // Create a temporary device object for the admin
                 openChat(device);
                 addMessage(uuid, {
                    sender: 'Admin',
                    text: data.payload.message,
>>>>>>> Stashed changes
                    isReply: true,
                    timestamp: new Date()
                });
            }
        });
<<<<<<< Updated upstream
        // This cleanup function was already correct.
        return () => {
            window.Echo.leave(`private-device.${uuid}`);
        };
    }, [auth.user, addMessage, openChat]);
=======
        return () => { window.Echo.leave(`device.${uuid}`); };
    }, [auth.user, addMessage]);
>>>>>>> Stashed changes


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
<<<<<<< Updated upstream
                            sender: 'You',
                            text: messageText,
                            isReply: false,
                            timestamp: new Date()
=======
                           sender: 'You',
                           text: messageText,
                           isReply: false,
                           timestamp: new Date()
>>>>>>> Stashed changes
                        };
                        addMessage(chat.uuid, message);
                    }}
                />
            ))}
        </div>
    );
};

<<<<<<< Updated upstream
export default ChatManager;
=======
export default ChatManager;
>>>>>>> Stashed changes
