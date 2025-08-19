// Comprehensive ResizeObserver error suppression
// This addresses the common "ResizeObserver loop completed with undelivered notifications" warning

// Method 1: Console error filtering
const originalConsoleError = console.error;
console.error = (...args: any[]) => {
  const message = args[0]?.toString() || '';
  
  // Filter out ResizeObserver warnings
  if (
    message.includes('ResizeObserver loop completed') ||
    message.includes('ResizeObserver loop limit exceeded') ||
    message.includes('undelivered notifications')
  ) {
    return; // Suppress the warning
  }
  
  // Allow other errors through
  originalConsoleError.apply(console, args);
};

// Method 2: Window error handler for uncaught ResizeObserver errors
window.addEventListener('error', (event) => {
  if (
    event.message?.includes('ResizeObserver') ||
    event.error?.message?.includes('ResizeObserver')
  ) {
    event.preventDefault();
    event.stopPropagation();
    return false;
  }
});

// Method 3: Unhandled rejection handler
window.addEventListener('unhandledrejection', (event) => {
  if (
    event.reason?.message?.includes('ResizeObserver') ||
    event.reason?.toString()?.includes('ResizeObserver')
  ) {
    event.preventDefault();
    return false;
  }
});

export {};
