import { describe, it, expect } from 'vitest';
import { cn } from './utils';

describe('utils', () => {
  describe('cn()', () => {
    it('should merge tailwind classes correctly', () => {
      const result = cn('text-red-500', 'bg-blue-500');
      expect(result).toBe('text-red-500 bg-blue-500');
    });

    it('should handle conditional classes', () => {
      const isActive = true;
      const result = cn('base-class', isActive && 'active-class');
      expect(result).toBe('base-class active-class');
    });

    it('should resolve tailwind conflicts using tailwind-merge', () => {
      const result = cn('px-2 py-1 bg-red-500', 'p-3 bg-[#B91C1C]');
      // 'p-3' overrides 'px-2 py-1', 'bg-[#B91C1C]' overrides 'bg-red-500'
      expect(result).toBe('p-3 bg-[#B91C1C]');
    });
  });
});
