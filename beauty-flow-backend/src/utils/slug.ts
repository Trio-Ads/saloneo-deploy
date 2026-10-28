export const generateSalonSlug = (text: string): string =>
  text.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

export const salonBaseSlug = (u: { establishmentName?: string; firstName?: string; lastName?: string }): string =>
  generateSalonSlug(u.establishmentName || `${u.firstName || ''} ${u.lastName || ''}`) || 'salon';
