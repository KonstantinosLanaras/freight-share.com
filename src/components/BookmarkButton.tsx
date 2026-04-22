import { useState } from 'react';
import { Bookmark } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BookmarkButtonProps {
  id: string;
  className?: string;
}

/**
 * Local-only bookmark toggle for demo purposes.
 * Persists to localStorage so it survives page reloads but does not hit the database.
 */
export const BookmarkButton = ({ id, className }: BookmarkButtonProps) => {
  const storageKey = 'fs_bookmarks';
  const [saved, setSaved] = useState<boolean>(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      const arr: string[] = raw ? JSON.parse(raw) : [];
      return arr.includes(id);
    } catch {
      return false;
    }
  });

  const toggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setSaved((prev) => {
      const next = !prev;
      try {
        const raw = localStorage.getItem(storageKey);
        const arr: string[] = raw ? JSON.parse(raw) : [];
        const updated = next ? [...new Set([...arr, id])] : arr.filter((x) => x !== id);
        localStorage.setItem(storageKey, JSON.stringify(updated));
      } catch {
        /* ignore */
      }
      return next;
    });
  };

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={saved ? 'Remove bookmark' : 'Save load'}
      aria-pressed={saved}
      className={cn(
        'inline-flex items-center justify-center h-8 w-8 rounded-full text-muted-foreground hover:text-primary hover:bg-muted transition-colors',
        saved && 'text-primary',
        className
      )}
    >
      <Bookmark className={cn('h-4 w-4', saved && 'fill-current')} />
    </button>
  );
};
