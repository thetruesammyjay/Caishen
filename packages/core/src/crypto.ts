import { createCipheriv, createDecipheriv, randomBytes, scryptSync } from 'node:crypto';

const ALGO = 'aes-256-gcm';

export function encryptSecret(plainText: string, passphrase: string): string {
  const iv = randomBytes(12);
  const key = scryptSync(passphrase, 'caishen-wdk-salt', 32);
  const cipher = createCipheriv(ALGO, key, iv);

  const encrypted = Buffer.concat([cipher.update(plainText, 'utf8'), cipher.final()]);
  const authTag = cipher.getAuthTag();

  return [iv.toString('base64'), authTag.toString('base64'), encrypted.toString('base64')].join('.');
}

export function decryptSecret(cipherText: string, passphrase: string): string {
  const [ivB64, authTagB64, payloadB64] = cipherText.split('.');
  if (!ivB64 || !authTagB64 || !payloadB64) {
    throw new Error('Invalid encrypted payload format.');
  }

  const iv = Buffer.from(ivB64, 'base64');
  const authTag = Buffer.from(authTagB64, 'base64');
  const payload = Buffer.from(payloadB64, 'base64');
  const key = scryptSync(passphrase, 'caishen-wdk-salt', 32);

  const decipher = createDecipheriv(ALGO, key, iv);
  decipher.setAuthTag(authTag);

  const plain = Buffer.concat([decipher.update(payload), decipher.final()]);
  return plain.toString('utf8');
}
