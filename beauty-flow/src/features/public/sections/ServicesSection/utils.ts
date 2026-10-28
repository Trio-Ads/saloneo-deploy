import { PublicService } from '../../types';

export function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes} min`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m === 0 ? `${h}h` : `${h}h${String(m).padStart(2, '0')}`;
}

export function currencySymbol(code: string): string {
  switch (code) {
    case 'EUR': return '€';
    case 'USD': return '$';
    case 'GBP': return '£';
    case 'DZD': return 'DA';
    default: return code;
  }
}

export function formatPrice(service: PublicService, mode: string, currency: string): string {
  if (mode === 'hidden') return '';
  const amount = `${Number(service.price).toLocaleString('fr-FR')} ${currencySymbol(currency)}`;
  return mode === 'from' || mode === 'range' ? `Dès ${amount}` : amount;
}
