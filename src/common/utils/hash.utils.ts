import * as bcrypt from 'bcrypt';

const SALT_ROUNDS = 10; // pode ajustar, 10–12 é bom equilíbrio entre segurança e performance

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

export async function comparePassword(
  password: string,
  hash: string,
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}
