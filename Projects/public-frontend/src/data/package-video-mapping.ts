/**
 * Mapping video cho các gói học
 * Key: package slug hoặc package id
 * Value: Google Drive video ID (để tạo embed URL)
 */

export const packageVideoMapping: Record<string, string> = {
  // Gói 1.8 triệu - Hiểu về con yêu
  'goi-hoc-8i-hieu-ve-con-yeu': '10CLvLMECzQSFCQJtruVujLSK47nNav-X',
  '17': '10CLvLMECzQSFCQJtruVujLSK47nNav-X',

  // Gói 186.15 triệu - Chắp cánh cho con (720 buổi)
  'goi-hoc-8i-chap-canh-cho-con-720': '18Wo3XpTGZysMeagNuDz94_tWYe70H0vK',
  '22': '18Wo3XpTGZysMeagNuDz94_tWYe70H0vK',

  // Gói 240 triệu - Chắp cánh cho con (1.000 buổi)
  'goi-hoc-8i-chap-canh-cho-con-1000': '18Wo3XpTGZysMeagNuDz94_tWYe70H0vK',
  '23': '18Wo3XpTGZysMeagNuDz94_tWYe70H0vK',
}

/**
 * Lấy video ID cho một gói học
 * @param packageSlug - Slug của gói học
 * @param packageId - ID của gói học (fallback)
 * @returns Video ID nếu có, null nếu không có
 */
export function getPackageVideoId(packageSlug: string, packageId?: string): string | null {
  return packageVideoMapping[packageSlug] || (packageId ? packageVideoMapping[packageId] : null) || null
}

/**
 * Tạo embed URL từ video ID
 * @param videoId - Google Drive video ID
 * @returns Embed URL
 */
export function getVideoEmbedUrl(videoId: string): string {
  return `https://drive.google.com/file/d/${videoId}/preview`
}

