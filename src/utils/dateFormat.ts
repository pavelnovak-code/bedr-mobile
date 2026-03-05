import { format, parseISO } from 'date-fns';
import { cs } from 'date-fns/locale';

/**
 * Formátuje datum a čas: "po 5. 3. 2026, 10:00"
 */
export function formatDT(dt: string | Date): string {
  const date = typeof dt === 'string' ? parseISO(dt) : dt;
  return format(date, 'EEEEEE d. M. yyyy, HH:mm', { locale: cs });
}

/**
 * Formátuje datum: "pondělí 5. března 2026"
 */
export function formatDate(dt: string | Date): string {
  const date = typeof dt === 'string' ? parseISO(dt) : dt;
  return format(date, 'EEEE d. MMMM yyyy', { locale: cs });
}

/**
 * Formátuje čas: "10:00"
 */
export function formatTime(dt: string | Date): string {
  const date = typeof dt === 'string' ? parseISO(dt) : dt;
  return format(date, 'HH:mm', { locale: cs });
}

/**
 * Krátký formát: "5. 3."
 */
export function formatShortDate(dt: string | Date): string {
  const date = typeof dt === 'string' ? parseISO(dt) : dt;
  return format(date, 'd. M.', { locale: cs });
}

/**
 * Měsíc a rok: "březen 2026"
 */
export function formatMonthYear(dt: string | Date): string {
  const date = typeof dt === 'string' ? parseISO(dt) : dt;
  return format(date, 'LLLL yyyy', { locale: cs });
}
