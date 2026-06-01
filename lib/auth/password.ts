import bcrypt from "bcryptjs";

const ROUNDS = 10;

/**
 * 哈希密码
 * @param password - 明文密码
 */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, ROUNDS);
}

/**
 * 校验密码
 * @param password - 明文
 * @param hash - 存储哈希
 */
export async function verifyPassword(
  password: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}
