import jwt, { SignOptions } from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'changeme-in-prod';

export function signJwt(
  payload: object,
  expiresIn: SignOptions['expiresIn'] = '1h'
) {
  return jwt.sign(payload, JWT_SECRET as string, { expiresIn });
}

export function verifyJwt(token: string) {
  try {
    return jwt.verify(token, JWT_SECRET as string);
  } catch {
    return null;
  }
}
