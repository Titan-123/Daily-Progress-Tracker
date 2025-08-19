// Suppress ResizeObserver loop completed warnings
// This is a known issue with Radix UI and other libraries that use ResizeObserver
// The warning is harmless and doesn't affect functionality

const suppressResizeObserverWarning = () => {
  // Store the original console.error
  const originalError = console.error;
  
  // Override console.error to filter out ResizeObserver warnings
  console.error = (...args: any[]) => {
    const message = args[0]?.toString() || '';
    
    // Skip ResizeObserver loop warnings
    if (message.includes('ResizeObserver loop completed') || 
        message.includes('ResizeObserver loop limit exceeded')) {
      return;
    }
    
    // Call original console.error for other errors
    originalError.apply(console, args);
  };
};

// Apply the suppression when the module loads
suppressResizeObserverWarning();

export {};
