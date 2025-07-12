import { useState, useEffect } from 'react';
import AppLayout from '@/Layouts/AppLayout';
import { Head, router } from '@inertiajs/react';
import { route } from 'ziggy-js';

export default function MessageSearch({ auth, initialResults = [], query = '' }) {
    const [q, setQ] = useState(query || '');
    const [results, setResults] = useState(initialResults);

    useEffect(() => {
        setResults(initialResults);
        setQ(query || '');
    }, [initialResults, query]);

    const search = (e) => {
        e.preventDefault();
        router.get(route('messages.search', { q }));
    };

    return (
        <AppLayout
            header={<h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">Search Messages</h2>}
        >
            <Head title="Search Messages" />
            <div className="py-12 max-w-5xl mx-auto sm:px-6 lg:px-8">
                <form onSubmit={search} className="flex mb-4">
                    <input
                        value={q}
                        onChange={e => setQ(e.target.value)}
                        className="flex-grow border rounded-l px-2 py-1"
                        placeholder="Search text"
                    />
                    <button className="bg-blue-600 text-white px-4 rounded-r">Search</button>
                </form>
                <div className="bg-white dark:bg-gray-800 rounded shadow p-4 overflow-x-auto">
                    {results.length === 0 ? (
                        <p>No results</p>
                    ) : (
                        <table className="min-w-full text-sm">
                            <thead>
                                <tr>
                                    <th className="px-2 py-1 text-left">Time</th>
                                    <th className="px-2 py-1 text-left">Sender</th>
                                    <th className="px-2 py-1 text-left">Message</th>
                                </tr>
                            </thead>
                            <tbody>
                                {results.map(r => (
                                    <tr key={r.id} className="border-t">
                                        <td className="px-2 py-1">{new Date(r.created_at).toLocaleString()}</td>
                                        <td className="px-2 py-1 break-all">{r.sender_id}</td>
                                        <td className="px-2 py-1 break-all">{r.message}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
