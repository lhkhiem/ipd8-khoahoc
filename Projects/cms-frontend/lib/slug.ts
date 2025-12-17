export function generateSlug(title: string): string {
  if (!title) return '';
  
  return title
    .normalize('NFD') // Decompose characters (é → e + ́)
    .replace(/[\u0300-\u036f]/g, '') // Remove combining diacritical marks
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .replace(/[^a-zA-Z0-9\s-]/g, '') // Remove special characters first (except spaces and hyphens)
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple consecutive dashes with single dash
    .replace(/^-+|-+$/g, '') // Remove leading/trailing dashes
    .toLowerCase();
}
