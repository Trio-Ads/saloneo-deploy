export const generateSalonSlug = (text: string): string =>
  text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

export const salonBaseSlug = (u: { establishmentName?: string; firstName?: string; lastName?: string }): string =>
  generateSalonSlug(u.establishmentName || `${u.firstName || ''} ${u.lastName || ''}`) || 'salon';
