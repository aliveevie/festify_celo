import React from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface NotificationProps {
  title: string;
  description?: string;
  type?: 'default' | 'success' | 'error' | 'warning' | 'info';
  onClose?: () => void;
  className?: string;
}

const Notification: React.FC<NotificationProps> = ({
  title,
  description,
  type = 'default',
  onClose,
  className,
}) => {
  const typeStyles = {
    default: 'bg-background border',
    success: 'bg-green-50 border-green-200 text-green-800',
    error: 'bg-red-50 border-red-200 text-red-800',
    warning: 'bg-amber-50 border-amber-200 text-amber-800',
    info: 'bg-blue-50 border-blue-200 text-blue-800',
  };

  return (
    <div
      className={cn(
        'relative rounded-lg border p-4 shadow-sm',
        typeStyles[type],
        className
      )}
    >
      <div className="flex items-start gap-4">
        <div className="flex-1">
          <h3 className="font-medium">{title}</h3>
          {description && <p className="mt-1 text-sm">{description}</p>}
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="inline-flex h-6 w-6 items-center justify-center rounded-full hover:bg-muted/50"
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </button>
        )}
      </div>
    </div>
  );
};

export default Notification;
