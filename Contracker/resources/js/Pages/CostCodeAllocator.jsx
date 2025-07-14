import { useEffect } from 'react';
import AppLayout from '@/Layouts/AppLayout';
import axios from 'axios';
import { route } from 'ziggy-js';

export default function CostCodeAllocator({ jobId }) {
  useEffect(() => {
    Promise.all([
      axios.get(route('costcode.allocator.data', { jobId })),
      import('../Allocator/CostCodeAllocatorApp.jsx'),
    ]).then(([res, mod]) => {
      const el = document.getElementById('allocator-root');
      mod.default(el, res.data);
    }).catch(err => {
      console.error('Failed to load allocator', err);
    });
  }, [jobId]);

  return (
    <AppLayout header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Cost Code Allocator</h2>}>
      <div className="py-6">
        <div id="allocator-root"></div>
      </div>
    </AppLayout>
  );
}
