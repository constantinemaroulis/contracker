/*
 * Cost Code Allocator - React Application JS Code for CodePen (COMPLETE & VERIFIED)
 * Alias: "CostCode Good" - With Note Modal Fixes v2
 * Generated on: Monday, May 5, 2025 at 12:04 PM EDT
 * FIX: Corrected note saving logic (pass text directly on save).
 * FIX: Reinstated expand toggle using JS-calculated fixed pixel height for mobile stability.
 * FIX: Addressed modal movement during typing via fixed pixel height & local state.
 * FIX: Added check for window.ReactBeautifulDnd library loading.
 * NEW: Added FileUploadZone component (now inside NoteEditorModal, triggered by Receipt icon).
 * NEW: Added Snippet buttons to NoteEditorModal.
 * FIX: Adjusted Cost Code header layout to move search input to the right (consistent across sizes).
 * NEW: Added "Select All" button per Local in unassigned list.
 * NEW: Added "Remove All" button per Cost Code in assigned list (with confirmation).
 * REVERT: Put FileUploadZone back into NoteEditorModal, triggered by Receipt icon.
 * Includes all previous features & fixes.
 *
 * --- CodePen Setup ---
 * 1.  **HTML:**
 * <div id="root"></div>
 * * <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
 * 2.  **CSS:** https://cdn.tailwindcss.com (via External Stylesheets)
 * 3.  **JS:** Babel Preprocessor + External Scripts (React, ReactDOM, RBD)
 * - React (e.g., react.development.js)
 * - ReactDOM (e.g., react-dom.development.js)
 * - React Beautiful DnD (e.g., https://cdnjs.cloudflare.com/ajax/libs/react-beautiful-dnd/13.1.1/react-beautiful-dnd.min.js) - MUST be loaded AFTER React/ReactDOM.
 */

// Imports & Setup
const { useState, useEffect, useMemo, useRef } = React;
const { createRoot } = ReactDOM;

// --- Check if react-beautiful-dnd is loaded ---
if (!window.ReactBeautifulDnd) {
  console.error(
    "ERROR: react-beautiful-dnd library not found on window.ReactBeautifulDnd. Please ensure the external script (react-beautiful-dnd.min.js) is added correctly in your CodePen JS settings *after* React and ReactDOM."
  );
  const rootContainer = document.getElementById("root");
  if (rootContainer) {
    rootContainer.innerHTML = `<div style="color: red; padding: 20px; font-family: sans-serif; border: 2px solid red; background-color: #ffeeee; border-radius: 8px;">... Error Message ...</div>`; // Simplified error message for brevity
  }
  throw new Error(
    "React Beautiful DnD library (window.ReactBeautifulDnd) not found. Check external script loading order."
  );
}

const DragDropContext = window.ReactBeautifulDnd.DragDropContext;
const Droppable = window.ReactBeautifulDnd.Droppable;
const Draggable = window.ReactBeautifulDnd.Draggable;

// --- Job/Timecard Context (Dummy Data for CodePen) ---
const JOB_ID = "OFF-001";
const TIMECARD_ID = "OFF-001-522025";
const TIMECARD_DATE = "FRIDAY, MAY 2nd, 2025";

// --- Static Data Generation ---
const LOCALS = ["Local79", "Local102", "Local23", "Local1"];
const FIRST_NAMES = ["John", "Mary", "James", "Patricia", "Robert", "Linda", "Michael", "Barbara", "William", "Elizabeth", "David", "Jennifer", "Richard", "Maria", "Charles", "Susan", "Joseph", "Jessica", "Thomas", "Sarah"];
const LAST_NAMES = ["Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis", "Rodriguez", "Martinez", "Hernandez", "Lopez", "Gonzalez", "Wilson", "Anderson", "Thomas", "Taylor", "Moore", "Jackson", "Martin"];
const FULL_NAMES = Array.from({ length: 15 }, (_, i) => `${FIRST_NAMES[Math.floor(Math.random() * FIRST_NAMES.length)]} ${LAST_NAMES[Math.floor(Math.random() * LAST_NAMES.length)]} #${i + 1}`);
const ALL_COST_CODES = Array.from({ length: 15 }, (_, i) => ({ id: `costcode-${i + 1}`, code: `S10001-${String(i + 1).padStart(3, "0")}`, name: ["Carpentry", "Plumbing", "Electrical", "Roofing", "Framing", "Drywall", "Painting", "Masonry", "Concrete", "Landscaping", "Insulation", "Windows", "Doors", "Siding", "Demolition"][i] || `Misc Task ${i + 1}` }));
const CLOCK_IN_TIME = "07:00 AM";
const CLOCK_OUT_TIME = "05:00 PM";
const FIXED_HOURS = 10;
const ALL_LABORERS = Array.from({ length: 15 }, (_, i) => ({ id: `laborer-${i + 1}`, name: FULL_NAMES[i], local: LOCALS[i % LOCALS.length], originalHours: FIXED_HOURS, clockInTime: CLOCK_IN_TIME, clockOutTime: CLOCK_OUT_TIME }));

// --- SVG Icons ---
const PlusIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" /></svg>);
const XIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" /></svg>);
const MinusIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" /></svg>);
const NotepadIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm0 2h12v10H4V5z" clipRule="evenodd" /><path d="M6 7h8v1H6zM6 9h8v1H6zM6 11h5v1H6z" /></svg>);
const CheckIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>);
const ChevronUpIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" /></svg>);
const ChevronDownIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>);
const ReceiptIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>);
const SettingsIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>);
const TrashIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>);
const UploadIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-gray-400 group-hover:text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}><path strokeLinecap="round" strokeLinejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>);
const SelectAllIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>);
const RemoveAllIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16m-9-4l-1 1m1-1l1 1m-1-1v3" /></svg>); // Modified TrashIcon


// --- AssignmentCard Component ---
function AssignmentCard({ assignment, meta, flagged, isUnderHours, isInputDisabled, hasNote, onSplit, onRemove, onChange, onShowImage, isNewlySplit, onEditNote }) {
  const [hrs, setHrs] = useState(assignment.hours);
  useEffect(() => { setHrs(assignment.hours); }, [assignment.hours]);
  const roundToHalf = (value) => Math.round(value * 2) / 2;
  const handleHrsChange = (e) => { let v = parseFloat(e.target.value); if (isNaN(v) || isInputDisabled) return; let rV = roundToHalf(v); rV = Math.max(0, rV); if (rV <= 0 && assignment.hours > 0) { if (window.confirm(`Hours set to 0 or less for ${meta.name}. Remove?`)) { onRemove(assignment.id); return; } rV = 0; } setHrs(rV); if (rV !== assignment.hours) { onChange(assignment.id, rV); } };
  const handleBlur = (e) => { if (isInputDisabled) return; const v = parseFloat(e.target.value); let fV; if (isNaN(v)) { fV = assignment.hours; } else { fV = Math.max(0, roundToHalf(v)); } if (fV <= 0 && assignment.hours > 0) { if (window.confirm(`Hours set to 0 or less for ${meta.name}. Remove?`)) { onRemove(assignment.id); return; } fV = 0; } setHrs(fV); if (fV !== assignment.hours) { onChange(assignment.id, fV); } };
  const handleDecrement = () => { if (isInputDisabled) return; const current = hrs; let next = roundToHalf(current - 0.5); next = Math.max(0, next); if (next === current) return; if (next <= 0 && current > 0) { if (window.confirm(`Hours set to 0 or less for ${meta.name}. Remove?`)) { onRemove(assignment.id); return; } next = 0; } setHrs(next); onChange(assignment.id, next); };
  const handleIncrement = () => { if (isInputDisabled) return; const current = hrs; const next = roundToHalf(current + 0.5); if (next === current) return; setHrs(next); onChange(assignment.id, next); };
  const borderClass = isNewlySplit ? "border-4 border-green-500 animate-bounce" : "border-4 border-transparent";
  let ringClass = ""; if (!isNewlySplit) { if (flagged) ringClass = "ring-2 ring-red-500 ring-offset-1"; else if (isUnderHours) ringClass = "ring-2 ring-yellow-400 ring-offset-1"; }
  const flagIndicatorClass = "absolute top-0 right-0 -mt-1 -mr-1 px-1 py-0 text-[9px] font-bold rounded-full z-10";
  return (<div className={`relative bg-white rounded-lg shadow p-2 flex flex-col gap-1 w-full transition-opacity duration-300 ease-in-out ${borderClass} ${ringClass} ${isInputDisabled ? "opacity-70" : ""}`}>{flagged && !isNewlySplit && (<div className={`${flagIndicatorClass} bg-red-500 text-white`} title={`Total > original ${meta.originalHours}h`}>!</div>)}{isUnderHours && !flagged && !isNewlySplit && (<div className={`${flagIndicatorClass} bg-yellow-400 text-black`} title={`Total < original ${meta.originalHours}h`}>!</div>)}<div className="w-full flex justify-between items-start"><div><h4 onClick={() => onShowImage(meta.id)} title={`Click to view image for ${meta.name}`} className="font-semibold text-sm mb-0 leading-tight cursor-pointer hover:text-blue-600 hover:underline whitespace-normal break-words">{meta.name}</h4><p className="text-xs text-gray-600 leading-tight">{meta.local}</p></div><button onClick={() => onEditNote("assignment", assignment.id, meta.name)} title={`Edit note for ${meta.name}`} className={`p-1 rounded flex-shrink-0 hover:bg-gray-100 ${hasNote ? "text-blue-600" : "text-gray-400"}`}> <NotepadIcon /> </button></div><div className={`w-full mt-1 sm:flex sm:items-center sm:justify-between sm:gap-1 ${isInputDisabled ? "cursor-not-allowed" : ""}`}><div className={`flex items-center rounded py-0.5 gap-0.5 w-auto mb-1 sm:mb-0 ${isInputDisabled ? "bg-gray-200" : "bg-gray-100"}`}><button onClick={handleDecrement} title="-0.5h" disabled={isInputDisabled || hrs <= 0} className="p-1 text-gray-700 hover:bg-gray-300 disabled:hover:bg-transparent rounded disabled:opacity-50 disabled:cursor-not-allowed"><MinusIcon /></button><input type="number" inputMode="decimal" min="0" step="0.5" value={hrs} onChange={handleHrsChange} onBlur={handleBlur} onFocus={(e) => e.target.select()} disabled={isInputDisabled} className={`w-10 text-sm text-center border-none focus:ring-1 focus:ring-blue-500 focus:outline-none font-medium appearance-none ${isInputDisabled ? "bg-gray-200 text-gray-500 cursor-not-allowed" : "bg-transparent"}`} style={{ MozAppearance: "textfield" }} /><button onClick={handleIncrement} title="+0.5h" disabled={isInputDisabled} className="p-1 text-green-600 hover:bg-green-100 disabled:hover:bg-transparent rounded disabled:opacity-50 disabled:cursor-not-allowed"><PlusIcon /></button></div><div className="flex items-center self-end sm:self-center"><button onClick={() => onSplit(assignment.id)} title="Split" className="p-1 rounded text-blue-600 hover:bg-blue-100"><PlusIcon /></button><button onClick={() => onRemove(assignment.id)} title="Remove" className="p-1 rounded text-red-600 hover:bg-red-100"><XIcon /></button></div></div></div>);
}

// --- FileUploadZone Component ---
function FileUploadZone({ targetId, targetName }) {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const fileInputRef = useRef(null);
  const allowedTypes = { 'image/jpeg': ['.jpg', '.jpeg'], 'image/png': ['.png'], 'application/pdf': ['.pdf'], 'image/tiff': ['.tif', '.tiff'], 'image/heic': ['.heic'], };
  const acceptString = Object.keys(allowedTypes).join(',');
  const isFileTypeAllowed = (file) => { if (allowedTypes[file.type]) { return true; } const extension = '.' + file.name.split('.').pop().toLowerCase(); for (const type in allowedTypes) { if (allowedTypes[type].includes(extension)) { return true; } } if ((!file.type || file.type === 'application/octet-stream') && extension === '.heic') { return true; } return false; };
  const handleFiles = (files) => { const validFiles = []; const invalidFiles = []; Array.from(files).forEach(file => { if (isFileTypeAllowed(file)) { validFiles.push(file); } else { invalidFiles.push(file); } }); if (invalidFiles.length > 0) { const invalidNames = invalidFiles.map(f => f.name).join(', '); alert(`Unsupported file type(s): ${invalidNames}.\nAllowed types: JPG, PNG, PDF, TIF, HEIC`); } if (validFiles.length > 0) { console.log(`Files "uploaded" for Target ${targetId} (${targetName}):`, validFiles.map(f => f.name)); setUploadedFiles(validFiles.map(f => f.name)); if(fileInputRef.current) { fileInputRef.current.value = ""; } /* Upload logic here */ } };
  const handleDragEnter = (e) => { e.preventDefault(); e.stopPropagation(); setIsDragging(true); };
  const handleDragLeave = (e) => { e.preventDefault(); e.stopPropagation(); if (e.currentTarget.contains(e.relatedTarget)) return; setIsDragging(false); };
  const handleDragOver = (e) => { e.preventDefault(); e.stopPropagation(); setIsDragging(true); };
  const handleDrop = (e) => { e.preventDefault(); e.stopPropagation(); setIsDragging(false); const files = e.dataTransfer.files; if (files && files.length > 0) { handleFiles(files); e.dataTransfer.clearData(); } };
  const handleClick = () => { fileInputRef.current?.click(); };
  const handleFileChange = (e) => { const files = e.target.files; if (files && files.length > 0) { handleFiles(files); } };
  return (
    <div className="mt-2 mb-1">
      <label htmlFor={`file-upload-${targetId}`} onClick={handleClick} onDragEnter={handleDragEnter} onDragLeave={handleDragLeave} onDragOver={handleDragOver} onDrop={handleDrop} className={`group relative flex justify-center px-4 py-4 border-2 ${isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300 border-dashed'} rounded-md cursor-pointer transition-colors duration-150 ease-in-out`}>
        <div className="space-y-1 text-center pointer-events-none"><UploadIcon /><div className="flex text-xs text-gray-600 group-hover:text-gray-700"><span className="relative font-medium text-blue-600 group-hover:text-blue-800">Upload a file</span><p className="pl-1">or drag and drop</p></div><p className="text-[10px] text-gray-500">JPG, PNG, PDF, TIF, HEIC</p></div>
        <input id={`file-upload-${targetId}`} name={`file-upload-${targetId}`} ref={fileInputRef} type="file" multiple accept={acceptString} onChange={handleFileChange} className="sr-only" />
      </label>
      {uploadedFiles.length > 0 && (<div className="mt-1 text-xs text-gray-600"><p className="font-medium">Selected:</p><ul className="list-disc list-inside">{uploadedFiles.map((name, index) => (<li key={index} className="truncate">{name}</li>))}</ul></div>)}
    </div>
  );
}

// --- NoteEditorModal Component ---
function NoteEditorModal({ target, noteText, onSave, onCancel, onDelete }) {
  if (!target) return null;
  const textareaRef = useRef(null);
  const [isShowing, setIsShowing] = useState(false);
  const [isExpandedMobile, setIsExpandedMobile] = useState(false);
  const [localNoteText, setLocalNoteText] = useState("");
  const [dynamicMobileMaxHeight, setDynamicMobileMaxHeight] = useState(null);
  const [showFileUpload, setShowFileUpload] = useState(false); // State for file upload visibility
  const panelMaxHeightClass = isExpandedMobile ? "max-h-[600px]" : "max-h-[450px]";
  const snippets = [ { label: "Weather Delay", text: "Delayed start due to weather conditions. " }, { label: "Material Wait", text: "Waiting on material delivery. " }, { label: "Site Condition", text: "Unexpected site condition encountered. " }, { label: "RFI Sent", text: "RFI submitted regarding [SPECIFY]. " }, ];
  const handleInsertSnippet = (snippetText) => { setLocalNoteText((prevText) => prevText + snippetText); textareaRef.current?.focus(); };
  const handleDeleteClick = () => { if (window.confirm(`Are you sure you want to delete the note for "${target.name}"? This cannot be undone.`)) { setIsShowing(false); setTimeout(() => { onDelete(); }, 300); } };
  useEffect(() => { setLocalNoteText(noteText); setShowFileUpload(false); }, [target, noteText]); // Reset file upload on target change
  useEffect(() => { const showTimer = setTimeout(() => setIsShowing(true), 10); const focusTimer = setTimeout(() => { if (textareaRef.current) { textareaRef.current.focus(); textareaRef.current.selectionStart = textareaRef.current.selectionEnd = textareaRef.current.value.length; } }, 100); const calculateAndSetHeight = () => { if (window.innerWidth < 640) { const vh = window.visualViewport ? window.visualViewport.height : window.innerHeight; const mult = isExpandedMobile ? 0.9 : 0.8; const calcH = Math.max(250, vh * mult); setDynamicMobileMaxHeight(`${Math.round(calcH)}px`); } else { setDynamicMobileMaxHeight(null); } }; calculateAndSetHeight(); setIsExpandedMobile(false); const targetViewport = window.visualViewport || window; targetViewport.addEventListener("resize", calculateAndSetHeight); return () => { clearTimeout(showTimer); clearTimeout(focusTimer); targetViewport.removeEventListener("resize", calculateAndSetHeight); }; }, [target, isExpandedMobile]);
  const toggleExpandMobile = () => setIsExpandedMobile((prev) => !prev);
  const overlayOpacityClass = isShowing ? "opacity-[.85]" : "opacity-0";
  const panelTransformClass = isShowing ? "scale-100 opacity-100" : "scale-95 opacity-0";
  const handleClose = (action) => { setIsShowing(false); setTimeout(() => { if (action === "save") { const trimmedText = (typeof localNoteText === "string" ? localNoteText : "").trim(); onSave(trimmedText); } else { onCancel(); } }, 300); };
  const handleToggleFileUpload = () => { setShowFileUpload(prev => !prev); }; // Toggle function

  return (
    <div className={`fixed inset-0 bg-black z-50 transition-opacity duration-300 ease-in-out flex items-center justify-center p-4 ${overlayOpacityClass}`}>
      <div className={`bg-white rounded-lg shadow-xl w-full ${panelMaxHeightClass} sm:max-h-[85vh] sm:max-w-xl flex flex-col overflow-hidden transition-all duration-300 ease-in-out transform ${panelTransformClass}`} style={dynamicMobileMaxHeight ? { maxHeight: dynamicMobileMaxHeight } : {}}>
        {/* Header */}
        <div className="flex justify-between items-center p-3 border-b flex-shrink-0 bg-gray-50 gap-2">
          <h3 className="text-base font-semibold text-gray-700 truncate pr-1" title={target.name}> Note for: {target.name} </h3>
          <div className="flex items-center flex-shrink-0 gap-1 sm:gap-2">
            <button onClick={handleDeleteClick} title="Delete Note" className="p-1 text-red-500 hover:bg-red-100 rounded"><TrashIcon /></button>
            <button onClick={toggleExpandMobile} title={isExpandedMobile ? "Collapse" : "Expand"} className="p-1 text-gray-500 hover:bg-gray-200 rounded block sm:hidden"> {isExpandedMobile ? <ChevronDownIcon /> : <ChevronUpIcon />} </button>
            {/* Receipt button toggles file upload visibility */}
            <button onClick={handleToggleFileUpload} title={showFileUpload ? "Hide File Upload" : "Show File Upload"} className={`p-1 rounded ${showFileUpload ? 'bg-blue-100 text-blue-600' : 'text-gray-500 hover:bg-gray-200'}`}><ReceiptIcon /></button>
            <button onClick={() => handleClose("save")} title="Save Note" className="p-1 text-green-600 hover:bg-green-100 rounded"> <CheckIcon /> </button>
            <button onClick={() => handleClose("cancel")} title="Cancel" className="p-1 text-red-600 hover:bg-red-100 rounded"> <XIcon /> </button>
          </div>
        </div>
        {/* Body (Scrollable Area) */}
        <div className="flex-grow overflow-y-auto p-3 overscroll-contain">
          <textarea ref={textareaRef} value={localNoteText} onChange={(e) => setLocalNoteText(e.target.value)} placeholder="Enter notes here..." className="w-full min-h-[100px] resize-none border border-gray-300 rounded p-2 text-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500" />
          {/* Conditional File Upload Zone */}
          {showFileUpload && (
            <div className="mt-4 pt-4 border-t">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Attach Files:</h4>
                {/* Pass target id and name */}
                <FileUploadZone targetId={target.id} targetName={target.name} />
            </div>
          )}
        </div>
         {/* Snippets Footer */}
         <div className="p-2 border-t bg-gray-50 flex-shrink-0">
             <p className="text-xs font-medium text-gray-600 mb-1">Insert Snippet:</p>
             <div className="flex flex-wrap gap-1">
                 {snippets.map((snippet) => (<button key={snippet.label} onClick={() => handleInsertSnippet(snippet.text)} title={`Insert: "${snippet.text}"`} className="px-2 py-0.5 bg-blue-100 text-blue-800 text-xs font-medium rounded hover:bg-blue-200 focus:outline-none focus:ring-1 focus:ring-blue-500">{snippet.label}</button>))}
             </div>
         </div>
      </div>
    </div>
  );
}

// --- Helper function to load notes from localStorage ---
const loadInitialNotes = () => { try { const savedNotes = localStorage.getItem("costCodeAllocatorNotes"); if (savedNotes) { const parsedNotes = JSON.parse(savedNotes); if (typeof parsedNotes === "object" && parsedNotes !== null) return parsedNotes; else localStorage.removeItem("costCodeAllocatorNotes"); } } catch (error) { console.error("Failed to load notes:", error); } return {}; };

// --- Main Allocator Component ---
function CostCodeAllocator() {
  const [assignments, setAssignments] = useState([]);
  const [modalImg, setModalImg] = useState(null);
  const [isSelectingCostCodeTarget, setIsSelectingCostCodeTarget] = useState(false);
  const [collectedLaborers, setCollectedLaborers] = useState(new Set());
  const [selectedLabs, setSelectedLabs] = useState(new Set());
  const [highlightedNewSplitId, setHighlightedNewSplitId] = useState(null);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [reportContent, setReportContent] = useState("");
  const [costCodeSearchTerm, setCostCodeSearchTerm] = useState("");
  const [notes, setNotes] = useState(loadInitialNotes);
  const [editingNoteTarget, setEditingNoteTarget] = useState(null);
  const highlightTimeoutRef = useRef(null);
  const LABORERS = ALL_LABORERS; const COST_CODES = ALL_COST_CODES;
  useEffect(() => { return () => { if (highlightTimeoutRef.current) clearTimeout(highlightTimeoutRef.current); }; }, []);
  useEffect(() => { try { localStorage.setItem("costCodeAllocatorNotes", JSON.stringify(notes)); } catch (error) { console.error("Failed to save notes:", error); alert("Could not save notes. Storage might be full."); } }, [notes]);
  const nextAssignId = () => `assign-${Date.now()}-${Math.random().toString(16).slice(2)}`;
  const roundToHalf = (value) => Math.round(value * 2) / 2;
  const assignedLaborerIds = useMemo(() => new Set(assignments.map((a) => a.laborerId)), [assignments]);
  const unassignedByLocal = useMemo(() => { const map = {}; LOCALS.forEach((loc) => (map[loc] = [])); LABORERS.forEach((l) => { if (!assignedLaborerIds.has(l.id)) { if (!map[l.local]) map[l.local] = []; map[l.local].push(l); } }); return map; }, [assignedLaborerIds, LABORERS]);
  const assignedHoursPerLaborer = useMemo(() => { const sums = {}; assignments.forEach((a) => { sums[a.laborerId] = (sums[a.laborerId] || 0) + a.hours; }); for (const key in sums) sums[key] = roundToHalf(sums[key]); return sums; }, [assignments]);
  const assignmentCountPerLaborer = useMemo(() => { const counts = {}; assignments.forEach((a) => { counts[a.laborerId] = (counts[a.laborerId] || 0) + 1; }); return counts; }, [assignments]);
  const flaggedSet = useMemo(() => { const flagged = new Set(); LABORERS.forEach((l) => { const assigned = assignedHoursPerLaborer[l.id] || 0; if (assigned > l.originalHours + 0.01) flagged.add(l.id); }); return flagged; }, [assignedHoursPerLaborer, LABORERS]);
  const underHoursSet = useMemo(() => { const under = new Set(); LABORERS.forEach((l) => { const assigned = assignedHoursPerLaborer[l.id] || 0; if (l.originalHours - assigned > 0.01) under.add(l.id); }); return under; }, [assignedHoursPerLaborer, LABORERS]);
  const filteredCostCodes = useMemo(() => { const term = costCodeSearchTerm.toLowerCase().trim(); if (!term) return COST_CODES; return COST_CODES.filter((cc) => cc.code.toLowerCase().includes(term) || cc.name.toLowerCase().includes(term)); }, [costCodeSearchTerm, COST_CODES]);
  const { readyForReport, totalAssigned, totalOriginal } = useMemo(() => { const allAssigned = LABORERS.every((l) => assignedLaborerIds.has(l.id)); const totalAss = Object.values(assignedHoursPerLaborer).reduce((s, h) => s + h, 0); const totalOrig = LABORERS.reduce((s, l) => s + l.originalHours, 0); const allMatch = LABORERS.every((l) => { const a = assignedHoursPerLaborer[l.id] || 0; return assignedLaborerIds.has(l.id) ? Math.abs(a - l.originalHours) < 0.01 : false; }); const isReady = allAssigned && allMatch && flaggedSet.size === 0 && underHoursSet.size === 0; return { readyForReport: isReady, totalAssigned: roundToHalf(totalAss), totalOriginal: roundToHalf(totalOrig), }; }, [assignedLaborerIds, assignedHoursPerLaborer, flaggedSet, underHoursSet, LABORERS]);

  // --- Event Handlers ---
  const handleClearSelection = () => setSelectedLabs(new Set());
  const handleCollectClick = () => { if (selectedLabs.size === 0) return; setCollectedLaborers(new Set(selectedLabs)); setSelectedLabs(new Set()); setIsSelectingCostCodeTarget(true); };
  const handleCancelCollect = () => { setCollectedLaborers(new Set()); setIsSelectingCostCodeTarget(false); };
  const handleSettingsClick = () => { alert(`Settings clicked!\nJob: ${JOB_ID}\nTimecard: ${TIMECARD_ID}`); };
  const handleAssignCollectedToCostCode = (targetCostCodeId) => { if (collectedLaborers.size === 0) { setIsSelectingCostCodeTarget(false); return; } const currentAssignedIds = new Set(assignments.map((a) => a.laborerId)); const newAssignments = Array.from(collectedLaborers).map((lId) => LABORERS.find((l) => l.id === lId)).filter((l) => l && !currentAssignedIds.has(l.id)).map((l) => ({ id: nextAssignId(), laborerId: l.id, costCodeId: targetCostCodeId, hours: l.originalHours, })); if (newAssignments.length > 0) { setAssignments((prev) => [...prev, ...newAssignments]); } setCollectedLaborers(new Set()); setIsSelectingCostCodeTarget(false); };
  const handleEditNote = (type, id, name) => { const existingNote = notes[id] || ""; setEditingNoteTarget({ type, id, name, initialNote: existingNote }); };
  const handleSaveNote = (trimmedFinalText) => { if (!editingNoteTarget || !editingNoteTarget.id) { console.error("handleSaveNote called without a valid target.", editingNoteTarget); return; } const textToSave = typeof trimmedFinalText === "string" ? trimmedFinalText : ""; const targetId = editingNoteTarget.id; console.log(`Saving note for ID ${targetId}: "${textToSave}"`); setNotes((prevNotes) => { const newNotes = { ...prevNotes, [targetId]: textToSave, }; return newNotes; }); setEditingNoteTarget(null); };
  const handleCancelNote = () => { setEditingNoteTarget(null); };
  const handleDeleteNote = () => { if (!editingNoteTarget || !editingNoteTarget.id) return; const targetId = editingNoteTarget.id; setNotes((prevNotes) => { const newNotes = { ...prevNotes }; delete newNotes[targetId]; return newNotes; }); setEditingNoteTarget(null); };
  const handleReport = () => { const formatHours = (hrs) => hrs.toFixed(1); const byCode = COST_CODES.map((cc) => { const t = assignments.filter((a) => a.costCodeId === cc.id).reduce((s, a) => s + a.hours, 0); return t > 0.01 ? `${cc.code} (${cc.name}): ${formatHours(roundToHalf(t))}h` : null; }).filter(Boolean); const byLocal = LOCALS.map((loc) => { const t = assignments.filter((a) => LABORERS.find((x) => x.id === a.laborerId)?.local === loc).reduce((s, a) => s + a.hours, 0); return t > 0.01 ? `${loc}: ${formatHours(roundToHalf(t))}h` : null; }).filter(Boolean); const individualLaborerHours = LABORERS.map((l) => { const a = assignedHoursPerLaborer[l.id] || 0; const o = l.originalHours; const s = Math.abs(a - o) < 0.01 ? "OK" : a > o ? `OVER (${formatHours(a - o)}h)` : `UNDER (${formatHours(o - a)}h)`; const aL = assignments.filter((x) => x.laborerId === l.id).map((x) => { const c = COST_CODES.find((c) => c.id === x.costCodeId); return `  - ${c ? c.code : "??"}: ${formatHours(x.hours)}h`; }).join("\n"); return `${l.name} (${l.local}): ${formatHours(a)}h / ${formatHours(o)}h [${s}]\n${aL}`; }).join("\n\n"); const reportParts = [`Job: ${JOB_ID}`, `Timecard: ${TIMECARD_ID}`, `Allocation Report`, `Timestamp: ${new Date().toLocaleString()}`, `----------------------------------------`, `Total Hours Assigned: ${formatHours(totalAssigned)}h / ${formatHours(totalOriginal)}h`, `Status: ${readyForReport ? "Ready (All Assigned & Balanced)" : "Incomplete / Imbalanced"}`, flaggedSet.size > 0 ? `\nWARNING: ${flaggedSet.size} laborer(s) have hours strictly OVER their original amount!` : "", underHoursSet.size > 0 ? `\nWARNING: ${underHoursSet.size} laborer(s) have hours LESS than their original amount!` : "", `----------------------------------------`, `Hours by Cost Code:`, byCode.length > 0 ? byCode.join("\n") : " (None assigned)", `----------------------------------------`, `Hours by Local:`, byLocal.length > 0 ? byLocal.join("\n") : " (None assigned)", `----------------------------------------`, `Hours by Laborer:`, individualLaborerHours || " (None assigned)",]; const finalReportString = reportParts.filter(Boolean).join("\n\n").trim(); setReportContent(finalReportString); setIsReportModalOpen(true); };
  const onDragEnd = ({ destination, source, draggableId }) => { if (isSelectingCostCodeTarget) return; if (!destination || (destination.droppableId === source.droppableId && destination.index === source.index)) return; if (highlightTimeoutRef.current) { clearTimeout(highlightTimeoutRef.current); setHighlightedNewSplitId(null); } const [type, id] = draggableId.split(":"); if (type === "lab") { const targetId = destination.droppableId; if (!targetId.startsWith("costcode-")) return; const labsToAssign = selectedLabs.has(id) ? Array.from(selectedLabs) : [id]; const currentAssigned = new Set(assignments.map((a) => a.laborerId)); const newAssigns = labsToAssign.map((lId) => LABORERS.find((l) => l.id === lId)).filter((l) => l && !currentAssigned.has(l.id)).map((l) => ({ id: nextAssignId(), laborerId: l.id, costCodeId: targetId, hours: l.originalHours, })); if (newAssigns.length > 0) { setAssignments((prev) => [...prev, ...newAssigns]); } setSelectedLabs(new Set()); } else if (type === "assign") { if (destination.droppableId === "laborersList") { handleRemove(id); } else if (destination.droppableId.startsWith("costcode-")) { setAssignments((prev) => prev.map((a) => a.id === id ? { ...a, costCodeId: destination.droppableId } : a)); } } };
  const rebalanceLaborerHours = (currentAssignments, laborerId) => { const laborer = LABORERS.find((l) => l.id === laborerId); if (!laborer) return currentAssignments; const assignmentsForLaborer = currentAssignments.filter((a) => a.laborerId === laborerId); const count = assignmentsForLaborer.length; if (count === 0) return currentAssignments; const hoursPerAssignment = roundToHalf(laborer.originalHours / count); let assignedTotal = 0; const updatedAssignments = assignmentsForLaborer.map((a, index) => { let hoursToAssign = hoursPerAssignment; if (index === count - 1) { hoursToAssign = roundToHalf(laborer.originalHours - assignedTotal); } assignedTotal += hoursToAssign; return { ...a, hours: Math.max(0, hoursToAssign), }; }); const otherAssignments = currentAssignments.filter((a) => a.laborerId !== laborerId); return [...otherAssignments, ...updatedAssignments]; };
  const handleSplit = (assignmentId) => { let newData = null; let laborerId = null; const assignmentToSplit = assignments.find((a) => a.id === assignmentId); if (!assignmentToSplit) return; laborerId = assignmentToSplit.laborerId; const newId = nextAssignId(); newData = { ...assignmentToSplit, id: newId, hours: 0 }; setAssignments((prev) => { const stateWithNew = [...prev, newData]; return rebalanceLaborerHours(stateWithNew, laborerId); }); if (highlightTimeoutRef.current) clearTimeout(highlightTimeoutRef.current); setHighlightedNewSplitId(newId); highlightTimeoutRef.current = setTimeout(() => { setHighlightedNewSplitId(null); highlightTimeoutRef.current = null; }, 900); };
  const handleHoursChange = (assignmentId, newRoundedHours) => { setAssignments((prev) => { const index = prev.findIndex((a) => a.id === assignmentId); if (index === -1) return prev; const changed = prev[index]; const laborerId = changed.laborerId; const laborer = LABORERS.find((l) => l.id === laborerId); if (!laborer) return prev; const assignmentsForLaborer = prev.filter((a) => a.laborerId === laborerId); const count = assignmentsForLaborer.length; if (count === 2) { const otherAssignment = assignmentsForLaborer.find((a) => a.id !== assignmentId); if (!otherAssignment) return prev; let otherHours = roundToHalf(laborer.originalHours - newRoundedHours); if (otherHours <= 0.0 && otherAssignment.hours > 0) { const otherMeta = LABORERS.find((l) => l.id === otherAssignment.laborerId); const otherName = otherMeta?.name || `assignment ${otherAssignment.id}`; if (window.confirm(`This change sets hours to 0 for ${otherName}'s other assignment. Remove that zero-hour assignment instead?`)) { return prev.filter((a) => a.id !== otherAssignment.id).map((a) => a.id === assignmentId ? { ...a, hours: laborer.originalHours, } : a); } else { console.log(`User cancelled removal of ${otherAssignment.id}, aborting hour change.`); return prev; } } else { return prev.map((a) => { if (a.laborerId === laborerId) { return a.id === assignmentId ? { ...a, hours: Math.max(0, newRoundedHours), } : { ...a, hours: Math.max(0, otherHours), }; } else { return a; } }); } } else { return prev.map((a) => a.id === assignmentId ? { ...a, hours: Math.max(0, newRoundedHours) } : a); } }); };
  const handleRemove = (assignmentId) => { let laborerId = null; let needsRebalanceCheck = false; setAssignments((prev) => { const toRemove = prev.find((a) => a.id === assignmentId); if (!toRemove) return prev; laborerId = toRemove.laborerId; const beforeRemove = prev.filter((a) => a.laborerId === laborerId); const initialCount = beforeRemove.length; const newState = prev.filter((a) => a.id !== assignmentId); if (initialCount === 2) { const laborer = LABORERS.find((l) => l.id === laborerId); if (laborer) { return newState.map((a) => { if (a.laborerId === laborerId) { return { ...a, hours: laborer.originalHours }; } return a; }); } else { console.error("Laborer not found during remover for 2->1"); return newState; } } else { if (initialCount > 2) { needsRebalanceCheck = true; } return newState; } }); if (laborerId && needsRebalanceCheck) { setAssignments((current) => rebalanceLaborerHours(current, laborerId)); } };

  // --- NEW: Select All Unassigned in a Local ---
  const handleSelectAllLocal = (localName) => { const laborersInLocal = unassignedByLocal[localName] || []; if (laborersInLocal.length === 0) return; const localIds = laborersInLocal.map(l => l.id); setSelectedLabs(prevSelected => { const newSelection = new Set(prevSelected); localIds.forEach(id => newSelection.add(id)); return newSelection; }); };

  // --- NEW: Remove All Assignments from a Cost Code ---
  const handleRemoveAllFromCostCode = (costCodeId, costCodeName) => { const assignmentsToRemove = assignments.filter(a => a.costCodeId === costCodeId); if (assignmentsToRemove.length === 0) { alert(`No assignments to remove from ${costCodeName}.`); return; } if (window.confirm(`Are you sure you want to remove all ${assignmentsToRemove.length} assignments from ${costCodeName}?`)) { setAssignments(prevAssignments => prevAssignments.filter(a => a.costCodeId !== costCodeId)); } };


  return (
    <div className="flex flex-col h-screen overflow-hidden p-2 md:p-4 lg:p-6 bg-gray-100">
      {/* Header */}
      <div className="mb-3 flex-shrink-0 flex flex-col sm:flex-row justify-between sm:items-center gap-2">
        <div><h1 className="text-xl md:text-2xl font-bold text-gray-800">Cost Code Allocator - <span className="text-md text-indigo-700 font-medium">Job: {JOB_ID}</span></h1>{!isSelectingCostCodeTarget ? (<p className="text-xs sm:text-sm text-gray-600">Select laborers, then Collect or Drag. Tap/Click to multi-select.</p>) : (<p className="text-lg font-semibold text-blue-700 animate-pulse">Click Cost Code below to assign ({collectedLaborers.size}) laborer(s).</p>)}{!isSelectingCostCodeTarget && (<p className="text-xs sm:text-sm text-gray-500 mt-1">Total: {totalAssigned.toFixed(1)}h/{totalOriginal.toFixed(1)}h {flaggedSet.size > 0 && (<span className="ml-2 text-red-600 font-semibold">({flaggedSet.size} Over!)</span>)} {underHoursSet.size > 0 && (<span className="ml-2 text-yellow-600 font-semibold">({underHoursSet.size} Under!)</span>)} {!readyForReport && !flaggedSet.size && !underHoursSet.size && assignedLaborerIds.size === LABORERS.length && (<span className="ml-2 text-green-600 font-semibold">(Balanced)</span>)}</p>)}</div>
        <div className="flex gap-2 items-center flex-wrap">{!isSelectingCostCodeTarget ? (<><div className="flex items-center gap-1"><button onClick={handleCollectClick} disabled={selectedLabs.size === 0} title={selectedLabs.size === 0 ? "Select laborers first" : `Collect ${selectedLabs.size} selected`} className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded text-sm font-semibold text-white transition-colors ${selectedLabs.size > 0 ? "bg-blue-600 hover:bg-blue-700" : "bg-gray-400 cursor-not-allowed"} disabled:opacity-70`}>Collect</button>{selectedLabs.size > 0 && (<span className={`text-xs font-bold text-white bg-blue-500 rounded-full px-2 py-0.5`}>{selectedLabs.size}</span>)}</div>{selectedLabs.size > 0 && (<button onClick={handleClearSelection} title="Clear current laborer selection" className="px-3 py-1.5 sm:px-4 sm:py-2 rounded text-sm font-semibold bg-gray-500 text-white hover:bg-gray-600"> Clear Sel. ({selectedLabs.size}) </button>)}<button disabled={!readyForReport} onClick={handleReport} title={readyForReport ? "Generate report" : "Assign/balance all hours"} className={`px-3 py-1.5 sm:px-5 sm:py-2 rounded text-sm sm:text-base font-semibold text-white transition-colors duration-200 ease-in-out ${readyForReport ? "bg-green-600 hover:bg-green-700" : "bg-gray-400 cursor-not-allowed"} disabled:opacity-70`}>Report</button><button onClick={handleSettingsClick} title="Settings" className="p-2 text-gray-600 hover:bg-gray-200 rounded-full"><SettingsIcon /></button></>) : (<button onClick={handleCancelCollect} title="Cancel collection" className="px-3 py-1.5 sm:px-4 sm:py-2 rounded text-sm font-semibold text-white bg-red-600 hover:bg-red-700">Cancel Collect ({collectedLaborers.size})</button>)}</div>
      </div>
      {/* Main Content */}
      <DragDropContext onDragEnd={onDragEnd}>
        {!isSelectingCostCodeTarget ? (
          <div className="flex flex-col md:flex-row gap-3 lg:gap-4 flex-grow min-h-0">
            {/* Left Column */}
            <div className="flex flex-col bg-gray-200 rounded-lg shadow md:w-1/3 lg:w-1/3 h-1/2 md:h-auto overflow-hidden">
              <h2 className="text-base md:text-lg font-semibold text-gray-700 flex-shrink-0 p-3 pb-1.5 border-b"><span className="size-md"> {TIMECARD_DATE}<br /></span> Unassigned Laborers</h2>
              <div className="overflow-y-auto flex-grow touch-pan-y px-1.5 pt-1.5 pb-2"><Droppable droppableId="laborersList">{(provided) => (<div ref={provided.innerRef} {...provided.droppableProps} className={`p-1 rounded min-h-[80px]`}>{LOCALS.map((loc) => { const unassigned = unassignedByLocal[loc] || []; const assignedGhosts = LABORERS.filter((l) => l.local === loc && assignedLaborerIds.has(l.id)); if (unassigned.length === 0 && assignedGhosts.length === 0) return null; return (<div key={loc} className="mb-3 last:mb-0"><div className="flex justify-between items-center px-1.5 sticky top-0 bg-gray-200 py-1 z-[5]"><h3 className="font-medium text-sm md:text-base text-gray-600">{loc}</h3>{unassigned.length > 0 && (<button onClick={() => handleSelectAllLocal(loc)} title={`Select all unassigned in ${loc}`} className="p-1 text-blue-600 hover:bg-blue-100 rounded"><SelectAllIcon /></button>)}</div>{unassigned.map((l, idx) => (<Draggable key={l.id} draggableId={`lab:${l.id}`} index={idx}>{(prov, snap) => { const isSelected = selectedLabs.has(l.id); return (<div ref={prov.innerRef} {...prov.draggableProps} {...prov.dragHandleProps} onClick={() => { const u = new Set(selectedLabs); if (u.has(l.id)) u.delete(l.id); else u.add(l.id); setSelectedLabs(u); }} className={`relative p-2 mb-1.5 bg-white rounded shadow-sm cursor-pointer flex flex-col transition-all duration-150 ease-in-out hover:bg-gray-50 ${snap.isDragging ? "shadow-lg ring-2 ring-blue-400 opacity-90" : ""} ${isSelected ? "ring-2 ring-blue-500 bg-blue-100 scale-105" : "border border-transparent"}`}><div className="flex justify-between items-center w-full"><span className="font-medium text-sm truncate pr-2">{l.name}</span><strong className="bg-indigo-100 text-indigo-800 px-1.5 py-0.5 rounded text-xs font-bold flex-shrink-0">{l.originalHours}h</strong></div><div className="text-xs text-gray-500 mt-1 w-full"><span><strong>In:</strong> {l.clockInTime}</span>&nbsp;<span><strong>Out:</strong> {l.clockOutTime}</span></div></div>); }}</Draggable>))}{assignedGhosts.map((l) => (<div key={`ghost:${l.id}`} className="p-2 mb-1.5 bg-white rounded border border-gray-200 flex justify-between items-center text-sm text-gray-400 opacity-60" title={`${l.name} assigned`}><span>{l.name}</span><strong className="bg-gray-100 px-1.5 py-0.5 rounded text-xs font-medium">{l.originalHours}h <span className="italic">(assigned)</span></strong></div>))}</div>);})}{provided.placeholder}</div>)}</Droppable></div>
            </div>
            {/* Right Column */}
            <div className="flex flex-col bg-gray-50 rounded-lg shadow md:w-2/3 lg:w-2/3 h-1/2 md:h-auto overflow-hidden">
              {/* Header with Title and Search - Adjusted Layout */}
               <div className="flex flex-wrap justify-between items-center gap-2 flex-shrink-0 p-3 pb-1.5 border-b">
                 <h2 className="text-base md:text-lg font-semibold text-gray-700 ">Cost Codes (Drop Target)</h2>
                 <div className="w-full sm:w-auto flex-grow sm:flex-grow-0"> {/* Search takes full width on small screens, auto on larger */}
                   <input type="text" placeholder="Search by Code or Name..." value={costCodeSearchTerm} onChange={(e) => setCostCodeSearchTerm(e.target.value)} className="w-full px-3 py-1 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-sm shadow-sm"/>
                 </div>
               </div>
              {/* Scrollable Cost Code List */}
              <div className="overflow-y-auto flex-grow space-y-3 p-3 touch-pan-y">
                {filteredCostCodes.length > 0 ? (filteredCostCodes.map((cc) => { const assignmentsInCode = assignments.filter(a => a.costCodeId === cc.id); return (
                  <div key={cc.id} className={`bg-slate-100 p-3 rounded-lg shadow-md border border-gray-200`}>
                    <div className="flex justify-between items-center mb-2 gap-2"><h3 className="font-medium text-sm md:text-base text-gray-800 truncate pr-2">{cc.code} – {cc.name}</h3><div className="flex items-center flex-shrink-0 gap-1">{assignmentsInCode.length > 0 && (<button onClick={() => handleRemoveAllFromCostCode(cc.id, cc.name)} title={`Remove all assignments from ${cc.name}`} className="p-1 text-red-500 hover:bg-red-100 rounded"><RemoveAllIcon /></button>)}<button onClick={() => handleEditNote("costcode", cc.id, `${cc.code} - ${cc.name}`)} title={`Edit note for Cost Code ${cc.code}`} className={`p-1 rounded hover:bg-gray-200 ${notes[cc.id] ? "text-blue-600" : "text-gray-400"}`}> <NotepadIcon /> </button></div></div>
                    <Droppable droppableId={cc.id}>{(provided, snapshot) => (<div ref={provided.innerRef} {...provided.droppableProps} className={`transition-colors duration-200 ease-in-out rounded-md p-1 ${snapshot.isDraggingOver ? "bg-green-100 ring-1 ring-green-300" : ""}`}><div className="grid grid-cols-3 gap-1 sm:grid-cols-2 lg:grid-cols-3 sm:gap-2 md:gap-3 min-h-[70px]">{assignmentsInCode.map((a, index) => { const meta = LABORERS.find((l) => l.id === a.laborerId); if (!meta) return null; const laborerId = a.laborerId; const isNewlySplit = a.id === highlightedNewSplitId; const isFlagged = flaggedSet.has(laborerId); const isUnder = underHoursSet.has(laborerId); const assignmentCount = assignmentCountPerLaborer[laborerId] || 0; const isInputDisabled = assignmentCount <= 1; const hasNote = !!notes[a.id]; return (<Draggable key={a.id} draggableId={`assign:${a.id}`} index={index}>{(prov, snap) => (<div ref={prov.innerRef} {...prov.draggableProps} {...prov.dragHandleProps} className={`select-none transition-shadow duration-150 ease-in-out ${snap.isDragging ? "shadow-xl opacity-95" : ""}`} style={prov.draggableProps.style}><AssignmentCard assignment={a} meta={meta} flagged={isFlagged} isUnderHours={isUnder} isInputDisabled={isInputDisabled} hasNote={hasNote} onSplit={handleSplit} onRemove={handleRemove} onChange={handleHoursChange} onShowImage={() => setModalImg(`https://via.placeholder.com/400x300.png?text=${encodeURIComponent(meta.name)}`)} isNewlySplit={isNewlySplit} onEditNote={handleEditNote} /></div>)}</Draggable>);})}{provided.placeholder}</div></div>)}</Droppable>
                  </div>);
                })) : (<p className="text-center text-gray-500 italic p-4">No matching cost codes found.</p>)}
              </div>
            </div>
          </div>
        ) : ( /* Cost Code Selection Mode */
          <div className="flex flex-col bg-gray-50 rounded-lg shadow w-full flex-grow min-h-0 overflow-hidden">
            <h2 className="text-lg md:text-xl font-semibold text-blue-700 flex-shrink-0 p-3 pb-1.5 border-b bg-blue-50">Select Target Cost Code for ({collectedLaborers.size}) Laborer(s)</h2>
            <div className="p-2 border-b border-gray-200"> <input type="text" placeholder="Search by Code or Name..." value={costCodeSearchTerm} onChange={(e) => setCostCodeSearchTerm(e.target.value)} className="w-full px-3 py-1.5 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-sm shadow-sm" /> </div>
            <div className="overflow-y-auto flex-grow space-y-3 p-3 touch-pan-y">{filteredCostCodes.length > 0 ? (filteredCostCodes.map((cc) => (<div key={cc.id} onClick={() => handleAssignCollectedToCostCode(cc.id)} className={`bg-slate-100 p-3 rounded-lg shadow-md border border-gray-200 transition-all duration-200 ease-in-out cursor-pointer hover:bg-blue-200 hover:ring-2 hover:ring-blue-500 hover:scale-105`}><h3 className="font-medium text-sm md:text-base text-gray-800 mb-2 pointer-events-none">{cc.code} – {cc.name}</h3><div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-1 min-h-[30px] opacity-50 pointer-events-none">{assignments.filter((a) => a.costCodeId === cc.id).map((a) => { const m = LABORERS.find((l) => l.id === a.laborerId); return (<div key={a.id} className="text-xs bg-white p-1 rounded border truncate">{m?.name || "..."}({a.hours}h)</div>); })}{assignments.filter((a) => a.costCodeId === cc.id).length === 0 && (<span className="text-xs text-gray-400 italic col-span-full">No assignments yet</span>)}</div></div>))) : (<p className="text-center text-gray-500 italic p-4">No matching cost codes found.</p>)}</div>
          </div>
        )}
      </DragDropContext>
      {/* Modals */}
      {modalImg && (<div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4"><div className="bg-white p-4 rounded-lg shadow-xl max-w-lg w-full"><img src={modalImg} alt="Placeholder" className="w-full h-auto object-contain rounded mb-4 max-h-[70vh]" /><button onClick={() => setModalImg(null)} className="w-full px-4 py-2 bg-blue-600 text-white rounded font-semibold hover:bg-blue-700 transition-colors">Close</button></div></div>)}
      {editingNoteTarget && (<NoteEditorModal target={editingNoteTarget} noteText={editingNoteTarget.initialNote} onSave={handleSaveNote} onCancel={handleCancelNote} onDelete={handleDeleteNote} />)}
      {isReportModalOpen && (<div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4"><div className="bg-white p-5 rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] flex flex-col"><h2 className="text-xl font-semibold mb-4 flex-shrink-0 border-b pb-2">Allocation Report</h2><div className="overflow-y-auto flex-grow mb-4 pr-2"><pre className="text-xs whitespace-pre-wrap font-mono bg-gray-50 p-3 rounded border">{reportContent}</pre></div><div className="flex gap-3 mt-auto flex-shrink-0 pt-3 border-t"><button onClick={() => navigator.clipboard?.writeText(reportContent).then(() => alert("Report copied!"), () => alert("Copy failed."))} className="px-4 py-2 bg-gray-500 text-white rounded font-semibold hover:bg-gray-600 transition-colors text-sm" disabled={!navigator.clipboard} title="Copy report text">Copy Text</button><button onClick={() => setIsReportModalOpen(false)} className="ml-auto px-4 py-2 bg-blue-600 text-white rounded font-semibold hover:bg-blue-700 transition-colors">Close Report</button></div></div></div>)}
    </div>
  );
}

// --- Mount Application ---
const container = document.getElementById("root");
if (container) {
  if (window.ReactBeautifulDnd) {
      const root = createRoot(container);
      root.render(<CostCodeAllocator />);
  } else {
      console.error("Root element #root found, but react-beautiful-dnd is missing. Cannot render application.");
  }
} else {
  console.error("Root element #root not found in the DOM.");
}

/* Optional: Hide number input spinners */
input[type=number]::-webkit-inner-spin-button,
input[type=number]::-webkit-outer-spin-button {
    -webkit-appearance: none;
    margin: 0;
}
input[type=number] {
    -moz-appearance: textfield; /* Firefox */
}

/* Basic body style */
body {
    margin: 0;
    font-family: sans-serif; /* Or your preferred font */
}

<div id="root"></div>
