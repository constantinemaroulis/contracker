import { useState, useEffect, useRef } from 'react';
import AppLayout from '@/Layouts/AppLayout';

// Constants and helpers
const ROLES = {
    SUPER_ADMIN: 'Super Admin',
    ADMIN: 'Admin',
    MANAGEMENT: 'Management',
    FIELD: 'Field',
    LABORER: 'Laborer',
};
const hasPermission = (role, allowed) => Array.isArray(allowed) && allowed.includes(role);

const DUMMY_LOCATIONS = [
    { id: 1, name: 'Main Office', coords: { lat: 40.83, lon: -73.70 } },
    { id: 2, name: 'Job Site Alpha', coords: { lat: 40.75, lon: -73.98 } },
    { id: 3, name: 'Warehouse B', coords: { lat: 40.71, lon: -74.01 } },
];
const DUMMY_DEVICE_IDENTIFIER = 'TABLET-GATE-01';
const DUMMY_DEVICE_LOCATION_ID = 1;

const DUMMY_LABORERS = [
    { id: 101, name: 'Alice Johnson', employee_id: 'EMP101', pin: '1001' },
    { id: 102, name: 'Bob Williams', employee_id: 'EMP102', pin: '1002' },
    { id: 103, name: 'Charlie Brown', employee_id: 'EMP103', pin: '1003' },
    { id: 104, name: 'Diana Garcia', employee_id: 'EMP104', pin: '1004' },
    { id: 105, name: 'Ethan Miller', employee_id: 'EMP105', pin: '1005' },
    { id: 106, name: 'Fiona Davis', employee_id: 'EMP106', pin: '1006' },
];

// Settings Page component
function SettingsPage({ rules, currentUser, onRuleChange }) {
    const Toggle = (rule, label, desc, allowed) => {
        const can = hasPermission(currentUser.role, allowed);
        return (
            <div className="flex items-start justify-between py-2 border-b last:border-0">
                <div>
                    <p className="text-sm font-medium">{label} {!can && <span className="ml-1 text-gray-400">🔒</span>}</p>
                    <p className="text-xs text-gray-500">{desc}</p>
                </div>
                <button
                    type="button"
                    disabled={!can}
                    onClick={() => can && onRuleChange(rule, !rules[rule])}
                    className={`h-6 w-11 rounded-full transition-colors ${rules[rule] ? 'bg-indigo-600' : 'bg-gray-200'} ${!can ? 'opacity-50' : 'hover:opacity-80'}`}
                >
                    <span className={`inline-block h-5 w-5 bg-white rounded-full transform transition ${rules[rule] ? 'translate-x-5' : 'translate-x-0'}`}></span>
                </button>
            </div>
        );
    };
    return (
        <div className="p-4 max-w-md mx-auto bg-white rounded shadow">
            {Toggle('allowOffsiteClocking','Allow Off-Site Clock In/Out','Permit clocking when away from site',[ROLES.SUPER_ADMIN,ROLES.ADMIN,ROLES.MANAGEMENT])}
            {Toggle('requirePinForClocking','Require PIN','Ask for PIN on clock actions',[ROLES.SUPER_ADMIN,ROLES.ADMIN])}
        </div>
    );
}

// StartEndDay component manages sessions
function StartEndDay({ locations, activeSessions, onSessionUpdate, currentUser, rules, clockedInLaborerCount, onEndDayClearLaborers }) {
    const [selectedLocation, setSelectedLocation] = useState(locations[0]?.id || '');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const currentSession = activeSessions[selectedLocation];
    const today = new Date().toISOString().split('T')[0];

    const canPerformAction = (type) => {
        setError('');
        const allowedRoles = [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.MANAGEMENT, ROLES.FIELD];
        if (!hasPermission(currentUser.role, allowedRoles)) {
            setError(`Role "${currentUser.role}" cannot ${type} day.`);
            return false;
        }
        if (type === 'end' && clockedInLaborerCount > 0) {
            setError(`Cannot end day. ${clockedInLaborerCount} laborer(s) still clocked in.`);
            return false;
        }
        return true;
    };

    const handleStartDay = async () => {
        setError('');
        if (activeSessions[selectedLocation]) { setError('A session is already active for this location.'); return; }
        if (!canPerformAction('start')) return;
        setIsLoading(true);
        await new Promise(r => setTimeout(r, 500));
        const locName = locations.find(l => l.id == selectedLocation)?.name || `Location ${selectedLocation}`;
        const newSession = { id: Math.floor(Math.random()*1000), location_id: parseInt(selectedLocation,10), date: today, start_time: new Date().toISOString(), status: 'active', location: { name: locName } };
        onSessionUpdate(prev => ({ ...prev, [selectedLocation]: newSession }));
        setIsLoading(false);
    };

    const handleEndDay = async () => {
        setError('');
        const sessionToEnd = activeSessions[selectedLocation];
        if (!sessionToEnd) { setError('No active session selected to end.'); return; }
        if (!canPerformAction('end')) return;
        setIsLoading(true);
        await new Promise(r => setTimeout(r, 500));
        onSessionUpdate(prev => { const u={...prev}; delete u[selectedLocation]; return u; });
        onEndDayClearLaborers();
        setIsLoading(false);
    };

    return (
        <div className="p-4 mb-4 bg-white rounded shadow max-w-md mx-auto">
            <h2 className="font-semibold mb-2 text-center">Manage Work Day</h2>
            {error && <p className="text-red-500 text-sm mb-2 text-center">{error}</p>}
            <select value={selectedLocation} onChange={e=>{setSelectedLocation(e.target.value);setError('');}} className="w-full p-2 border rounded mb-2">
                {locations.map(l=> <option key={l.id} value={l.id}>{l.name}</option>)}
            </select>
            {!currentSession ? (
                <button onClick={handleStartDay} disabled={isLoading} className="w-full bg-green-600 text-white rounded py-2">{isLoading?'Starting...':'Start Day'}</button>
            ) : (
                <div className="text-center">
                    <p className="text-sm mb-2">Work day active for <span className="font-semibold">{currentSession.location.name}</span></p>
                    <button onClick={handleEndDay} disabled={isLoading} className="w-full bg-red-600 text-white rounded py-2">{isLoading?'Ending...':'End Day'}</button>
                </div>
            )}
        </div>
    );
}

// ClockInterface component
function ClockInterface({ sessionInfo, deviceIdentifier, rules, clockedInLaborers, onClockAction }) {
    const [currentTime, setCurrentTime] = useState(new Date());
    const [laborerInput, setLaborerInput] = useState('');
    const [isClocking, setIsClocking] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });
    const inputRef = useRef(null);
    const [isOffsite, setIsOffsite] = useState(false);

    useEffect(() => {
        const t = setInterval(()=>setCurrentTime(new Date()),1000);
        return () => clearInterval(t);
    }, []);
    useEffect(() => { if(sessionInfo) inputRef.current?.focus(); }, [sessionInfo]);

    const handleClockInOrOut = async (e) => {
        e.preventDefault();
        setMessage({type:'',text:''});
        const input = laborerInput.trim();
        if(!input){ setMessage({type:'error',text:'Please enter Employee ID or Name.'}); return; }
        if(!sessionInfo?.session){ setMessage({type:'error', text:'Active work session required to clock in/out.'}); return; }
        setIsClocking(true);
        const found = DUMMY_LABORERS.find(l => l.employee_id.toLowerCase()===input.toLowerCase() || l.name.toLowerCase()===input.toLowerCase());
        if(!found){ setMessage({type:'error', text:`Laborer "${input}" not found.`}); setIsClocking(false); setLaborerInput(''); return; }
        const isIn = clockedInLaborers.has(found.id);
        const action = isIn ? 'out' : 'in';
        if(isOffsite && !rules.allowOffsiteClocking){ setMessage({type:'error', text:'Rule Violation: Off-site clocking is not permitted.'}); setIsClocking(false); return; }
        if(rules.requirePinForClocking){ const pin = prompt(`Enter PIN for ${found.name}:`); if(!pin || pin!==found.pin){ setMessage({type:'error', text:'Invalid PIN.'}); setIsClocking(false); return; } }
        await new Promise(r=>setTimeout(r,400));
        setMessage({type:'success', text:`Successfully clocked ${action} ${found.name}`});
        onClockAction(found.id, action);
        setLaborerInput('');
        setIsClocking(false);
        setTimeout(()=>setMessage({type:'',text:''}),4000);
    };

    return (
        <div className="p-4 bg-gray-50 rounded shadow max-w-sm mx-auto">
            <div className="text-center mb-4">
                <div className="text-2xl font-bold">{currentTime.toLocaleTimeString()}</div>
                <div className="text-sm text-gray-600">{currentTime.toLocaleDateString()}</div>
                {sessionInfo?.location && <div className="text-xs text-gray-500">Location: {sessionInfo.location.name}</div>}
                {sessionInfo?.device && <div className="text-xs text-gray-500">Device: {sessionInfo.device.name || deviceIdentifier}</div>}
            </div>
            {sessionInfo?.session ? (
                <form onSubmit={handleClockInOrOut} className="mb-4">
                    {message.text && <div className={`mb-2 text-center text-sm ${message.type==='success'?'text-green-700':'text-red-700'}`}>{message.text}</div>}
                    <input ref={inputRef} type="text" value={laborerInput} onChange={e=>setLaborerInput(e.target.value)} placeholder="Employee ID or Name" className="w-full border rounded p-2" disabled={isClocking} autoComplete="off" />
                    <button type="submit" disabled={isClocking || !laborerInput.trim()} className="w-full mt-3 bg-indigo-600 text-white py-2 rounded disabled:opacity-50">{isClocking?'Processing...':'Clock In or Out'}</button>
                </form>
            ) : (
                <div className="p-4 text-center text-red-600">No active work session found for this device.</div>
            )}
            <div className="mt-2 text-xs text-gray-600 flex items-center"><input type="checkbox" className="mr-1" checked={isOffsite} onChange={e=>setIsOffsite(e.target.checked)} />Is Off-site</div>
        </div>
    );
}

export default function TimeCaptureDemo() {
    const [view, setView] = useState('main');
    const [currentUser, setCurrentUser] = useState({ role: ROLES.SUPER_ADMIN });
    const [activeSessions, setActiveSessions] = useState({});
    const [rules, setRules] = useState({ allowOffsiteClocking:false, requirePinForClocking:false });
    const [clockedInLaborerIds, setClockedInLaborerIds] = useState(new Set());

    const handleClockAction = (id, action) => {
        setClockedInLaborerIds(prev => { const u=new Set(prev); action==='in'?u.add(id):u.delete(id); return u; });
    };
    const handleEndDayClear = () => setClockedInLaborerIds(new Set());

    const deviceSession = activeSessions[DUMMY_DEVICE_LOCATION_ID] || null;
    const deviceInfo = { id: 999, unique_identifier: DUMMY_DEVICE_IDENTIFIER, name: `Tablet ${DUMMY_DEVICE_IDENTIFIER.split('-').pop()}` };
    const sessionInfo = deviceSession ? { session: deviceSession, device: deviceInfo, location: DUMMY_LOCATIONS.find(l=>l.id===DUMMY_DEVICE_LOCATION_ID) } : null;

    return (
        <AppLayout header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Time Capture Demo</h2>}>
            <div className="p-4 space-y-6">
                <div className="flex gap-4 items-center">
                    <label className="text-sm">Role:</label>
                    <select value={currentUser.role} onChange={e=>{setCurrentUser({role:e.target.value}); setActiveSessions({}); setClockedInLaborerIds(new Set());}} className="border p-1 text-sm">
                        {Object.values(ROLES).map(r=><option key={r} value={r}>{r}</option>)}
                    </select>
                </div>
                {view==='main' && (
                    <>
                        <StartEndDay locations={DUMMY_LOCATIONS} activeSessions={activeSessions} onSessionUpdate={setActiveSessions} currentUser={currentUser} rules={rules} clockedInLaborerCount={clockedInLaborerIds.size} onEndDayClearLaborers={handleEndDayClear} />
                        <ClockInterface sessionInfo={sessionInfo} deviceIdentifier={DUMMY_DEVICE_IDENTIFIER} rules={rules} clockedInLaborers={clockedInLaborerIds} onClockAction={handleClockAction} />
                        <button onClick={()=>setView('settings')} className="text-sm text-blue-600 underline">Settings</button>
                    </>
                )}
                {view==='settings' && <SettingsPage rules={rules} currentUser={currentUser} onRuleChange={(r,v)=>setRules(prev=>({...prev,[r]:v}))} />}
                {view==='settings' && <button onClick={()=>setView('main')} className="text-sm text-blue-600 underline">Back</button>}
            </div>
        </AppLayout>
    );
}

