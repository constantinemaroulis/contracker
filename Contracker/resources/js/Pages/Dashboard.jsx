import SidebarLayout from '@/Layouts/SidebarLayout';
import UserSessionManager from '@/Components/UserSessionManager';
import { Head, Link } from '@inertiajs/react';
import DeviceInfo from '@/Components/DeviceInfo';
import DeviceMap from '@/Components/DeviceMap';

export default function Dashboard() {
    return (
        <SidebarLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800 dark:text-gray-200">
                    Dashboard
                </h2>
            }
        >
            <Head title="Dashboard" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg dark:bg-gray-800">
                        <div className="p-6 text-gray-900 dark:text-gray-100">
                            <DeviceInfo />
                        </div>
                        <div className="p-6 text-gray-900 dark:text-gray-100">
                            <DeviceMap />
                        </div>
                        <div className="p-6 text-gray-900 dark:text-gray-100">
                            You're logged in!
                        </div>
                        <div className="p-6 text-gray-900 dark:text-gray-100">
                            {/* Link to the jobs view */}
                            <Link href="/jobs" className="btn btn-primary">
                                View Jobs
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </SidebarLayout>
    );
}
