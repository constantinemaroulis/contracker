import { useEffect } from 'react';
import AppLayout from '@/Layouts/AppLayout';

export default function CostCodeAllocator({ jobId }) {
  useEffect(() => {
    window.ALLOCATOR_DATA = { jobId, locals: [], costCodes: [], laborers: [] };
    import('../Allocator/CostCodeAllocatorApp.jsx').then((mod) => {
      const el = document.getElementById('allocator-root');
      mod.default(el, window.ALLOCATOR_DATA);
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
