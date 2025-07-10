import AppLayout from '@/Layouts/AppLayout';
import { Head } from '@inertiajs/react';

export default function RemoteViewer({ auth, images = [] }) {
    return (
        <AppLayout
            header={<h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">Remote Viewer</h2>}
        >
            <Head title="Remote Viewer" />
            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg p-6">
                        {images.length === 0 ? (
                            <p>No screenshots found.</p>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                                {images.map(src => (
                                    <img key={src} src={src} alt="Screenshot" className="w-full rounded" />
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
