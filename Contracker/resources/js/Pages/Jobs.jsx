import { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from '@inertiajs/react'; // Correct import for Inertia Link
import AppLayout from '@/Layouts/AppLayout';

export default function Jobs() {
    const [jobs, setJobs] = useState([]);

    useEffect(() => {
        async function fetchJobs() {
            try {
                // Ensure your Laravel route '/session/jobs' returns JSON data
                const response = await axios.get('/session/jobs');
                setJobs(response.data.jobs); // Assuming your backend returns an object with a 'jobs' array
            } catch (error) {
                console.error('Error fetching jobs:', error);
                // Optionally set an error state here to display a message to the user
            }
        }

        fetchJobs();
    }, []); // Empty dependency array means this effect runs once after the initial render

    return (
        <AppLayout
                    header={<h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">Jobs</h2>}
                >
        <div className="container mx-auto p-4"> {/* Added some basic Tailwind classes for spacing */}
            <h2 className="text-2xl font-bold mb-4">Jobs List</h2> {/* Increased text size and added margin-bottom */}
            {jobs.length > 0 ? (
                <div className="overflow-x-auto"> {/* Added for responsive table */}
                    <table className="min-w-full bg-white border border-gray-300">
                        <thead>
                            <tr>
                                <th className="py-2 px-4 border-b">Job No</th>
                                <th className="py-2 px-4 border-b">Description</th>
                                <th className="py-2 px-4 border-b">City</th>
                                <th className="py-2 px-4 border-b">State</th>
                                <th className="py-2 px-4 border-b">Zip</th>
                                <th className="py-2 px-4 border-b">Geo Fence?</th>
                            </tr>
                        </thead>
                        <tbody>
                            {jobs.map((job) => (
                                <tr key={job.id} className="hover:bg-gray-50">
                                    <td className="py-2 px-4 border-b">{job.job_no}</td>
                                    <td className="py-2 px-4 border-b">{job.description}</td>
                                    <td className="py-2 px-4 border-b">{job.city}</td>
                                    <td className="py-2 px-4 border-b">{job.state}</td>
                                    <td className="py-2 px-4 border-b">{job.zip}</td>
                                    <td className="py-2 px-4 border-b">
                                        <Link href={route('geofence', { jobId: job.id })} className="text-blue-600 hover:underline">
                                            Setup Geofence
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                <p>No jobs to display.</p> // Message when no jobs are loaded
            )}
        </div>
        </AppLayout>
    );
}