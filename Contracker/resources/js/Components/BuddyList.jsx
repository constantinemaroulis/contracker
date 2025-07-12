import React from 'react';

const BuddyList = ({ devices = [], onOpen }) => (
    <div className="fixed bottom-0 left-0 m-4 w-48 bg-white dark:bg-gray-800 shadow-lg rounded p-2 z-40">
        <h4 className="font-semibold mb-2 text-sm">Buddies</h4>
        <ul className="space-y-1 max-h-48 overflow-y-auto">
            {devices.map(dev => (
                <li key={dev.uuid}>
                    <button
                        className="text-blue-600 dark:text-blue-400 hover:underline text-sm w-full text-left"
                        onClick={() => onOpen(dev)}
                    >
                        {dev.name || dev.uuid}
                    </button>
                </li>
            ))}
        </ul>
    </div>
);

export default BuddyList;
