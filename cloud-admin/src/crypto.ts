import * as crypto from 'crypto';
import * as fs from 'fs';
import * as path from 'path';
import { EntitlementPayload } from './types';

/**
 * Deterministically serializes a payload dictionary with sorted keys
 * to ensure cryptographic signature consistency across languages.
 */
export function canonicalizeJson(obj: Record<string, any>): string {
  const sortedKeys = Object.keys(obj).sort();
  const sortedObj: Record<string, any> = {};
  for (const key of sortedKeys) {
    sortedObj[key] = obj[key];
  }
  return JSON.stringify(sortedObj);
}

export function base64UrlEncode(buffer: Buffer): string {
  return buffer.toString('base64url');
}

export function base64UrlDecode(str: string): Buffer {
  return Buffer.from(str, 'base64url');
}

/**
 * Signs an entitlement payload using the server's private RSA key.
 * Private key is NEVER sent or exposed to clients.
 */
export function signEntitlementPayload(
  payload: EntitlementPayload,
  privateKeyPem: string
): { canonicalJson: string; signatureBase64Url: string; compactToken: string } {
  const canonicalJson = canonicalizeJson(payload as unknown as Record<string, any>);
  const signer = crypto.createSign('RSA-SHA256');
  signer.update(canonicalJson, 'utf8');
  signer.end();

  const signatureBuffer = signer.sign(privateKeyPem);
  const signatureBase64Url = base64UrlEncode(signatureBuffer);
  const payloadBase64Url = base64UrlEncode(Buffer.from(canonicalJson, 'utf8'));
  const compactToken = `${payloadBase64Url}.${signatureBase64Url}`;

  return { canonicalJson, signatureBase64Url, compactToken };
}

/**
 * Verifies an entitlement token using the public verification key.
 */
export function verifyEntitlementSignature(
  compactToken: string,
  publicKeyPem: string
): { valid: boolean; payload?: EntitlementPayload; error?: string } {
  try {
    const parts = compactToken.split('.');
    if (parts.length !== 2) {
      return { valid: false, error: 'Token format must be payload.signature' };
    }

    const payloadJson = base64UrlDecode(parts[0]).toString('utf8');
    const signatureBuffer = base64UrlDecode(parts[1]);

    const verifier = crypto.createVerify('RSA-SHA256');
    verifier.update(payloadJson, 'utf8');
    verifier.end();

    const isValid = verifier.verify(publicKeyPem, signatureBuffer);
    if (!isValid) {
      return { valid: false, error: 'Cryptographic signature verification failed' };
    }

    const payload: EntitlementPayload = JSON.parse(payloadJson);
    return { valid: true, payload };
  } catch (err: any) {
    return { valid: false, error: err.message || 'Verification error' };
  }
}
