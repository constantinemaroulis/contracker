import { useEffect, useState } from 'react';
import SidebarLayout from '@/Layouts/SidebarLayout';
import axios from 'axios';
import FullCostCodeAllocator from '../Allocator/FullCostCodeAllocator.jsx';

export default function CostCodeAllocator({ jobId }) {
    const [data, setData] = useState(null);

    useEffect(() => {
        axios.get(route('costcode.allocator.data', { jobId }))
            .then(res => setData(res.data))
            .catch(err => console.error('Failed to load allocator data', err));
    }, [jobId]);

    return (
        <SidebarLayout header={<h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">Cost Code Allocator</h2>}>
            <div className="py-6">
                {data ? (
                    <FullCostCodeAllocator {...data} />
                ) : (
                    <p>Loading...</p>
                )}
            </div>
        </SidebarLayout>
    );
}
