/**
 * 子路径部署前缀（如 /family-planning）
 */
export const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

/**
 * 为 API 或资源路径加上 basePath
 * @param path - 以 / 开头的路径
 */
export function withBasePath(path: string): string {
  if (!basePath) return path;
  return `${basePath}${path.startsWith("/") ? path : `/${path}`}`;
}
