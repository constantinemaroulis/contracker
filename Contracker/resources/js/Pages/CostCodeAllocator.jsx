import { useEffect } from 'react';
import AppLayout from '@/Layouts/AppLayout';

import axios from 'axios';

export default function CostCodeAllocator({ jobId }) {
  useEffect(() => {
    Promise.all([
      import('react'),
      import('react-dom/client'),
      import('react-beautiful-dnd'),
      axios.get(route('costcode.allocator.data', { jobId })),
    ]).then(([React, ReactDOM, RBD, res]) => {
      window.React = React;
      window.ReactDOM = ReactDOM;
      window.ReactBeautifulDnd = RBD;
      window.ALLOCATOR_DATA = res.data;
      import('../Allocator/CostCodeAllocatorApp.jsx');
lt(el, window.ALLOCATOR_DATA);
    });
  }, [jobId]);

  return (
    <AppLayout header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Cost Code Allocator</h2>}>
      <div className="py-6">
        <div id="root"></div>

      </div>
    </AppLayout>
  );
}
