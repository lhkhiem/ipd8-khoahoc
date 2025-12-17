/**
 * Generate a URL-friendly slug from a title
 * Converts "Hello World" to "hello-world"
 */
export function generateSlug(title: string): string {
  if (!title) return '';
  
  return title
    .normalize('NFD') // Normalize to decomposed form
    .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/[^a-z0-9\-]/g, '') // Remove non-alphanumeric except hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single
    .replace(/^-|-$/g, ''); // Remove leading/trailing hyphens
}

/**
 * Generate a unique slug by appending a number if needed
 */
export async function generateUniqueSlug(
  baseSlug: string,
  checkUnique: (slug: string) => Promise<boolean>,
  maxAttempts: number = 100
): Promise<string> {
  let slug = baseSlug;
  let attempt = 0;
  
  while (attempt < maxAttempts) {
    const isUnique = await checkUnique(slug);
    if (isUnique) {
      return slug;
    }
    
    attempt++;
    slug = `${baseSlug}-${attempt}`;
  }
  
  // Fallback: append timestamp
  return `${baseSlug}-${Date.now()}`;
}
