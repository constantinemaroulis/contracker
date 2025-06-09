import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';

export default forwardRef(function TextInput(
    { type = 'text', className = '', isFocused = false, label, error, ...props  },
    ref,
) {
    const localRef = useRef(null);

    useImperativeHandle(ref, () => ({
        focus: () => localRef.current?.focus(),
    }));

    useEffect(() => {
        if (isFocused) {
            localRef.current?.focus();
        }
    }, [isFocused]);

    return (
        // Add a wrapping div to hold the label and error message
        <div className="w-full">
            {/* Render the label if it exists */}
            {label && (
                <label htmlFor={props.id} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {label}
                </label>
            )}
            <input
                {...props}
                type={type}
                className={
                    `rounded-md shadow-sm border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 dark:focus:border-indigo-600 dark:focus:ring-indigo-600 ` +
                    // Add a red border if there is an error
                    (error ? 'border-red-500 ' : '') +
                    className
                }
                ref={localRef}
            />
            {/* Render the error message if it exists */}
            {error && <p className="text-sm text-red-600 mt-2">{error}</p>}
        </div>
    );
});
