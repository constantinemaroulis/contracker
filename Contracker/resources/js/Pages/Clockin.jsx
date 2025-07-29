import { useState, useEffect, useRef } from 'react';
import GuestLayout from '@/Layouts/GuestLayout';
import '../../css/clockin.css';

export default function Clockin() {
  const [value, setValue] = useState('');
  const inputRef = useRef(null);

  useEffect(() => {
    inputRef.current && inputRef.current.focus();
  }, []);

  const handleKeypad = (val) => {
    if (val === 'clr') {
      setValue('');
      return;
    }
    if (val === 'del') {
      setValue((v) => v.slice(0, -1));
      return;
    }
    if (/^\d$/.test(val) && value.length < 6) {
      setValue((v) => v + val);
    }
  };

  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === 'Backspace') {
        e.preventDefault();
        setValue((v) => v.slice(0, -1));
        return;
      }
      if (e.key === 'Delete') {
        e.preventDefault();
        setValue('');
        return;
      }
      if (value.length >= 6) {
        if (/\d/.test(e.key)) {
          e.preventDefault();
        }
        return;
      }
      if (/\d/.test(e.key)) {
        e.preventDefault();
        setValue((v) => v + e.key);
      }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [value]);

  return (
    <GuestLayout>
      <div className="container">
        <section id="ssn">
          <input
            type="text"
            id="ssnInput"
            maxLength={6}
            placeholder="LAST 6 OF SSN"
            value={value}
            readOnly
            ref={inputRef}
          />
        </section>
        <div className="keypad">
          {[1,2,3,4,5,6,7,8,9].map(n => (
            <button key={n} className="key" value={n} onClick={() => handleKeypad(String(n))}>{n}</button>
          ))}
          <button className="key" onClick={() => handleKeypad('clr')} value="clr">&times;</button>
          <button className="key" onClick={() => handleKeypad('0')} value="0">0</button>
          <button className="key" onClick={() => handleKeypad('del')} value="del">&#9003;</button>
          <button className="clock" value="clock">CLOCK IN</button>
        </div>
      </div>
    </GuestLayout>
  );
}
