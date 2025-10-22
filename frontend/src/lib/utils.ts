import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, formatDistanceToNow, isBefore, isToday, isTomorrow } from "date-fns";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string | Date, formatStr: string = "MMM dd, yyyy"): string {
  return format(new Date(date), formatStr);
}

export function formatRelativeTime(date: string | Date): string {
  return formatDistanceToNow(new Date(date), { addSuffix: true });
}

export function isOverdue(date: string | Date): boolean {
  return isBefore(new Date(date), new Date());
}

export function isDueSoon(date: string | Date, days: number = 3): boolean {
  const dueDate = new Date(date);
  const now = new Date();
  const diffTime = dueDate.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays <= days && diffDays >= 0;
}

export function getDueDateStatus(date: string | Date): {
  status: 'overdue' | 'due-soon' | 'due-today' | 'due-tomorrow' | 'upcoming';
  label: string;
  className: string;
} {
  const dueDate = new Date(date);
  
  if (isOverdue(dueDate)) {
    return {
      status: 'overdue',
      label: 'Overdue',
      className: 'bg-error-100 text-error-800 border-error-200'
    };
  }
  
  if (isToday(dueDate)) {
    return {
      status: 'due-today',
      label: 'Due Today',
      className: 'bg-warning-100 text-warning-800 border-warning-200'
    };
  }
  
  if (isTomorrow(dueDate)) {
    return {
      status: 'due-tomorrow',
      label: 'Due Tomorrow',
      className: 'bg-warning-50 text-warning-700 border-warning-100'
    };
  }
  
  if (isDueSoon(dueDate)) {
    return {
      status: 'due-soon',
      label: 'Due Soon',
      className: 'bg-primary-50 text-primary-700 border-primary-100'
    };
  }
  
  return {
    status: 'upcoming',
    label: formatDate(dueDate),
    className: 'bg-neutral-100 text-neutral-700 border-neutral-200'
  };
}

export function getPriorityColor(priority: 'low' | 'medium' | 'high'): {
  bg: string;
  text: string;
  border: string;
} {
  switch (priority) {
    case 'high':
      return {
        bg: 'bg-error-100',
        text: 'text-error-800',
        border: 'border-error-200'
      };
    case 'medium':
      return {
        bg: 'bg-warning-100',
        text: 'text-warning-800',
        border: 'border-warning-200'
      };
    case 'low':
      return {
        bg: 'bg-success-100',
        text: 'text-success-800',
        border: 'border-success-200'
      };
    default:
      return {
        bg: 'bg-neutral-100',
        text: 'text-neutral-800',
        border: 'border-neutral-200'
      };
  }
}

export function getStatusColor(status: 'pending' | 'in-progress' | 'completed'): {
  bg: string;
  text: string;
  border: string;
} {
  switch (status) {
    case 'completed':
      return {
        bg: 'bg-success-100',
        text: 'text-success-800',
        border: 'border-success-200'
      };
    case 'in-progress':
      return {
        bg: 'bg-primary-100',
        text: 'text-primary-800',
        border: 'border-primary-200'
      };
    case 'pending':
      return {
        bg: 'bg-neutral-100',
        text: 'text-neutral-800',
        border: 'border-neutral-200'
      };
    default:
      return {
        bg: 'bg-neutral-100',
        text: 'text-neutral-800',
        border: 'border-neutral-200'
      };
  }
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
}

export function generateInitials(name: string): string {
  return name
    .split(' ')
    .map(word => word.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

export function throttle<T extends (...args: unknown[]) => unknown>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}
