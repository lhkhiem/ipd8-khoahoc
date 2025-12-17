/**
 * Helper functions for metadata processing
 */

/**
 * Strip HTML tags and decode HTML entities from text
 * Used for cleaning description text for metadata
 */
export function stripHtmlAndDecode(text: string): string {
  if (!text) return '';
  
  // First strip HTML tags
  let cleaned = text.replace(/<[^>]*>/g, '');
  
  // Decode HTML entities - process numeric entities first, then named entities
  // Replace numeric entities (&#123; and &#x1F;) first
  cleaned = cleaned.replace(/&#(\d+);/g, (match, dec) => {
    try {
      return String.fromCharCode(parseInt(dec, 10));
    } catch {
      return match; // Return original if conversion fails
    }
  });
  cleaned = cleaned.replace(/&#x([0-9A-Fa-f]+);/gi, (match, hex) => {
    try {
      return String.fromCharCode(parseInt(hex, 16));
    } catch {
      return match; // Return original if conversion fails
    }
  });
  
  // Decode common named HTML entities (Vietnamese and common entities)
  const entities: { [key: string]: string } = {
    '&nbsp;': ' ',
    '&amp;': '&',
    '&lt;': '<',
    '&gt;': '>',
    '&quot;': '"',
    '&#39;': "'",
    '&apos;': "'",
    '&ndash;': '–',
    '&mdash;': '—',
    '&hellip;': '…',
    // Vietnamese characters
    '&Agrave;': 'À', '&agrave;': 'à',
    '&Aacute;': 'Á', '&aacute;': 'á',
    '&Acirc;': 'Â', '&acirc;': 'â',
    '&Atilde;': 'Ã', '&atilde;': 'ã',
    '&Auml;': 'Ä', '&auml;': 'ä',
    '&Aring;': 'Å', '&aring;': 'å',
    '&AElig;': 'Æ', '&aelig;': 'æ',
    '&Ccedil;': 'Ç', '&ccedil;': 'ç',
    '&Egrave;': 'È', '&egrave;': 'è',
    '&Eacute;': 'É', '&eacute;': 'é',
    '&Ecirc;': 'Ê', '&ecirc;': 'ê',
    '&Euml;': 'Ë', '&euml;': 'ë',
    '&Igrave;': 'Ì', '&igrave;': 'ì',
    '&Iacute;': 'Í', '&iacute;': 'í',
    '&Icirc;': 'Î', '&icirc;': 'î',
    '&Iuml;': 'Ï', '&iuml;': 'ï',
    '&ETH;': 'Ð', '&eth;': 'ð',
    '&Ntilde;': 'Ñ', '&ntilde;': 'ñ',
    '&Ograve;': 'Ò', '&ograve;': 'ò',
    '&Oacute;': 'Ó', '&oacute;': 'ó',
    '&Ocirc;': 'Ô', '&ocirc;': 'ô',
    '&Otilde;': 'Õ', '&otilde;': 'õ',
    '&Ouml;': 'Ö', '&ouml;': 'ö',
    '&Oslash;': 'Ø', '&oslash;': 'ø',
    '&Ugrave;': 'Ù', '&ugrave;': 'ù',
    '&Uacute;': 'Ú', '&uacute;': 'ú',
    '&Ucirc;': 'Û', '&ucirc;': 'û',
    '&Uuml;': 'Ü', '&uuml;': 'ü',
    '&Yacute;': 'Ý', '&yacute;': 'ý',
    '&THORN;': 'Þ', '&thorn;': 'þ',
    '&yuml;': 'ÿ', '&Yuml;': 'Ÿ',
  };
  
  // Replace named entities (case-insensitive)
  for (const [entity, char] of Object.entries(entities)) {
    cleaned = cleaned.replace(new RegExp(entity.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi'), char);
  }
  
  // Clean up multiple spaces and trim
  cleaned = cleaned.replace(/\s+/g, ' ').trim();
  
  return cleaned;
}

/**
 * Normalize slug to match frontend normalization
 * This ensures the path matches what the frontend generates when querying metadata
 */
export function normalizeSlug(slug: string): string {
  if (!slug) return '';
  
  // Decode URL-encoded characters first
  try {
    slug = decodeURIComponent(slug);
  } catch (e) {
    // If decode fails, use original slug
  }
  
  return slug
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9-]/g, '-') // Replace special chars with dash
    .replace(/-+/g, '-') // Replace multiple dashes with single dash
    .replace(/^-+|-+$/g, ''); // Remove leading/trailing dashes
}

