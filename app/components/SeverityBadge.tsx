'use client';

interface SeverityBadgeProps {
  severity: 'error' | 'warning' | 'info';
  size?: 'sm' | 'md';
  showText?: boolean;
}

export default function SeverityBadge({ 
  severity, 
  size = 'md', 
  showText = true 
}: SeverityBadgeProps) {
  // Define colors for each severity
  const colors = {
    error: {
      bg: 'bg-red-100',
      text: 'text-red-800',
      icon: 'text-red-500'
    },
    warning: {
      bg: 'bg-yellow-100',
      text: 'text-yellow-800',
      icon: 'text-yellow-500'
    },
    info: {
      bg: 'bg-blue-100',
      text: 'text-blue-800',
      icon: 'text-blue-500'
    }
  };
  
  // Get styles for current severity
  const style = colors[severity];
  
  // Size classes
  const sizeClasses = {
    sm: 'px-1.5 py-0.5 text-xs rounded',
    md: 'px-2 py-1 text-sm rounded'
  };
  
  // Icon for each severity
  const getIcon = () => {
    switch (severity) {
      case 'error':
        return (
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
          </svg>
        );
      case 'warning':
        return (
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
        );
      case 'info':
        return (
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
        );
    }
  };
  
  return (
    <span className={`inline-flex items-center ${style.bg} ${style.text} ${sizeClasses[size]}`}>
      <span className={`mr-1 ${style.icon}`}>{getIcon()}</span>
      {showText && severity}
    </span>
  );
} 