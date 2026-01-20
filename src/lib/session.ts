import { SessionPayload } from '@/lib/definitions/auth';
import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import { cache } from 'react';
import 'server-only';

const secretKey = process.env.SESSION_SECRET;
const encodedKey = secretKey ? new TextEncoder().encode(secretKey) : null;

function requireEncodedKey() {
  if (!encodedKey) {
    throw new Error(
      'SESSION_SECRET is not set. Create a .env.local with SESSION_SECRET (see .env.local.example).'
    );
  }
  return encodedKey;
}

export const verifySession = cache(async () => {
  // Avoid crashing on import/build when env isn't configured.
  if (!encodedKey) return { isAuth: false as const };

  const cookieStore = await cookies();
  const cookie = cookieStore.get('session')?.value;
  const session = await decrypt(cookie);

  if (!session?.userId) {
    return { isAuth: false };
  }

  return { isAuth: true, userId: session.userId };
});

export async function encrypt(payload: SessionPayload) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('1d')
    .sign(requireEncodedKey());
}

export async function decrypt(session: string | undefined = '') {
  try {
    if (!encodedKey) return null;

    const { payload } = await jwtVerify(session, requireEncodedKey(), {
      algorithms: ['HS256'],
    });
    return payload;
  } catch (error) {
    return null;
  }
}

export async function createSession(userId: string) {
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
  const session = await encrypt({ userId, expiresAt });
  const cookieStore = await cookies();

  cookieStore.set('session', session, {
    httpOnly: true,
    secure: true,
    expires: expiresAt,
    sameSite: 'lax',
    path: '/',
  });
}

export async function deleteSession() {
  const cookieStore = await cookies();
  cookieStore.delete('session');
}
