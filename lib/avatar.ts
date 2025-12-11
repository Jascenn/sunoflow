/**
 * 生成 DiceBear 头像 URL
 * 文档: https://www.dicebear.com/introduction/
 *
 * @param seed - 用于生成头像的种子（通常使用用户ID或邮箱）
 * @param style - 头像风格，默认使用 'avataaars'
 * @returns DiceBear 头像 URL
 */
export function generateDiceBearAvatar(
  seed: string,
  style: 'avataaars' | 'bottts' | 'lorelei' | 'notionists' | 'personas' | 'shapes' = 'avataaars'
): string {
  // 使用 DiceBear API v9
  return `https://api.dicebear.com/9.x/${style}/svg?seed=${encodeURIComponent(seed)}`;
}

/**
 * 判断是否为第三方登录（OAuth）提供的头像
 * Clerk 的第三方登录头像通常包含特定域名
 *
 * @param imageUrl - 头像 URL
 * @returns 是否为第三方头像
 */
export function isOAuthAvatar(imageUrl: string | null): boolean {
  if (!imageUrl) return false;

  // Clerk 的第三方登录头像通常来自这些域名
  const oauthDomains = [
    'googleusercontent.com',  // Google
    'github.com',              // GitHub
    'githubusercontent.com',    // GitHub
    'facebook.com',            // Facebook
    'twimg.com',               // Twitter
    'microsoft.com',           // Microsoft
    'discord.com',             // Discord
    'discordapp.com',          // Discord
  ];

  return oauthDomains.some(domain => imageUrl.includes(domain));
}

/**
 * 获取用户头像 URL
 * - 如果是 OAuth 登录且有头像，使用原头像
 * - 如果是邮箱注册或无头像，使用 DiceBear 生成
 *
 * @param clerkImageUrl - Clerk 提供的头像 URL
 * @param seed - 生成头像的种子（邮箱或用户ID）
 * @returns 最终的头像 URL
 */
export function getUserAvatarUrl(
  clerkImageUrl: string | null | undefined,
  seed: string
): string {
  // 如果是 OAuth 头像且存在，直接使用
  if (clerkImageUrl && isOAuthAvatar(clerkImageUrl)) {
    return clerkImageUrl;
  }

  // 否则使用 DiceBear 生成头像
  return generateDiceBearAvatar(seed, 'avataaars');
}
