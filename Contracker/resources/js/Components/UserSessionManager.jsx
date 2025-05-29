import { useEffect, useState } from 'react';
import axios from 'axios';

function UserSessionManager() {
  const [value, setValue] = useState('');
  const [input, setInput] = useState('');

  // Load the current session value on component mount
  useEffect(() => {
    axios.get('/session/get').then((res) => {
      setValue(res.data.value || '');
    });
  }, []);

  // Store a new value into the session
  const storeValue = () => {
    axios.post('/session/store', { value: input }).then(() => {
      setValue(input);
      setInput('');
      alert('Session value stored.');
    });
  };

  // Remove the value from the session
  const destroyValue = () => {
    axios.post('/session/destroy').then(() => {
      setValue('');
      alert('Session value destroyed.');
    });
  };

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold">Current Session Value: {value}</h1>

      <input
        type="text"
        placeholder="Enter a value"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        className="border px-2 py-1 rounded"
      />

      <div className="space-x-2">
        <button
          onClick={storeValue}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          Store
        </button>
        <button
          onClick={destroyValue}
          className="bg-red-600 text-white px-4 py-2 rounded"
        >
          Destroy
        </button>
      </div>
    </div>
  );
}

export default UserSessionManager;
