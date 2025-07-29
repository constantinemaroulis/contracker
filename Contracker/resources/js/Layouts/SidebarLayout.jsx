import { Link, usePage } from '@inertiajs/react';
import { useState } from 'react';
import ApplicationLogo from '@/Components/ApplicationLogo';

export default function SidebarLayout({ header, children }) {
    const { auth } = usePage().props;
    const user = auth.user;
    const [open, setOpen] = useState(false);

    const links = [
        { name: 'Dashboard', href: route('dashboard') },
        { name: 'Device Management', href: route('devices.list') },
        { name: 'Jobs', href: route('jobs.list') },
        { name: 'Geofences', href: route('geofences.admin') },
        { name: 'Timeclock', href: route('timeclock') },
        { name: 'Message Search', href: route('messages.search') },
        { name: 'Remote Control', href: route('remote.control') },
    ];

    const isActive = (href) => route().current(href.split('/').pop());

    return (
        <div className="flex h-screen overflow-hidden bg-gray-100 dark:bg-gray-900">
            <div className={`fixed inset-y-0 left-0 z-40 w-60 transform bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transition-transform duration-200 ease-in-out ${open ? 'translate-x-0' : '-translate-x-full sm:translate-x-0'}`}
            >
                <div className="h-16 flex items-center px-4 border-b border-gray-200 dark:border-gray-700">
                    <Link href="/">
                        <ApplicationLogo className="block h-9 w-auto fill-current text-gray-800 dark:text-gray-200" />
                    </Link>
                </div>
                <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
                    {links.map((link) => (
                        <Link
                            key={link.name}
                            href={link.href}
                            className={`block px-2 py-2 rounded-md text-sm font-medium hover:bg-gray-100 dark:hover:bg-gray-900 ${isActive(link.href) ? 'font-semibold text-gray-900 dark:text-white' : 'text-gray-600 dark:text-gray-300'}`}
                        >
                            {link.name}
                        </Link>
                    ))}
                </nav>
                <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-700 text-sm text-gray-600 dark:text-gray-400">
                    <div>{user.name}</div>
                    <div className="text-xs">{user.email}</div>
                </div>
            </div>
            <div className="flex flex-col flex-1 overflow-hidden ml-0 sm:ml-60">
                <div className="sm:hidden bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-2">
                    <button onClick={() => setOpen(!open)} className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300">
                        <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M4 6h16M4 12h16M4 18h16" />
                        </svg>
                    </button>
                </div>
                {header && (
                    <header className="bg-white dark:bg-gray-800 shadow">
                        <div className="px-4 py-4 sm:px-6 lg:px-8">{header}</div>
                    </header>
                )}
                <main className="flex-1 overflow-y-auto p-4">{children}</main>
            </div>
        </div>
    );
}
