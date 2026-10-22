/**
 * JerseyStudio Cryptographic Entitlement Verifier
 *
 * Implements offline asymmetric signature verification using WebCrypto (RSASSA-PKCS1-v1_5 with SHA-256).
 * Embedded with ONLY the public key.
 */

import { CLOUD_AUDIENCE, CLOUD_ISSUER, SERVER_PUBLIC_KEY_SPKI_B64 } from './publicKey';
import { EntitlementPayload, VerificationResult } from './types';

// Convert base64 / base64url string to Uint8Array / ArrayBuffer
export function base64UrlToUint8Array(base64UrlStr: string): Uint8Array {
  // Convert URL-safe characters back to standard base64
  let b64 = base64UrlStr.replace(/-/g, '+').replace(/_/g, '/');
  // Pad with '='
  while (b64.length % 4 !== 0) {
    b64 += '=';
  }
  const binaryString = atob(b64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

export function uint8ArrayToBase64Url(bytes: Uint8Array): string {
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

export function decodePayloadJson(payloadB64Url: string): EntitlementPayload {
  let b64 = payloadB64Url.replace(/-/g, '+').replace(/_/g, '/');
  while (b64.length % 4 !== 0) {
    b64 += '=';
  }
  const jsonStr = decodeURIComponent(
    atob(b64)
      .split('')
      .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
      .join('')
  );
  return JSON.parse(jsonStr);
}

let cachedCryptoKey: CryptoKey | null = null;

async function getVerificationCryptoKey(): Promise<CryptoKey> {
  if (cachedCryptoKey) {
    return cachedCryptoKey;
  }

  const binaryDer = base64UrlToUint8Array(SERVER_PUBLIC_KEY_SPKI_B64);
  cachedCryptoKey = await window.crypto.subtle.importKey(
    'spki',
    binaryDer.buffer as ArrayBuffer,
    {
      name: 'RSASSA-PKCS1-v1_5',
      hash: 'SHA-256',
    },
    false,
    ['verify']
  );

  return cachedCryptoKey;
}

/**
 * Deterministically sorts keys to ensure canonical JSON matching server signing.
 */
export function canonicalizeJson(obj: Record<string, any>): string {
  const sortedKeys = Object.keys(obj).sort();
  const sortedObj: Record<string, any> = {};
  for (const key of sortedKeys) {
    sortedObj[key] = obj[key];
  }
  return JSON.stringify(sortedObj);
}

/**
 * Asynchronously verifies the token's cryptographic signature and validates all claims offline.
 */
export async function verifyEntitlementOffline(
  compactToken: string,
  currentTimeSec: number = Math.floor(Date.now() / 1000)
): Promise<VerificationResult> {
  try {
    if (!compactToken || typeof compactToken !== 'string') {
      return {
        valid: false,
        status: 'unregistered',
        daysRemaining: 0,
        hoursRemaining: 0,
        errorMessage: 'No entitlement token found',
      };
    }

    const parts = compactToken.trim().split('.');
    if (parts.length !== 2) {
      return {
        valid: false,
        status: 'unregistered',
        daysRemaining: 0,
        hoursRemaining: 0,
        errorMessage: 'Invalid token format. Expected canonical_payload.signature',
      };
    }

    const [payloadB64Url, signatureB64Url] = parts;

    // 1. Decode JSON payload
    let payload: EntitlementPayload;
    try {
      payload = decodePayloadJson(payloadB64Url);
    } catch (e) {
      return {
        valid: false,
        status: 'unregistered',
        daysRemaining: 0,
        hoursRemaining: 0,
        errorMessage: 'Malformed payload JSON in entitlement token',
      };
    }

    // 2. Validate Issuer & Audience
    if (payload.iss !== CLOUD_ISSUER) {
      return {
        valid: false,
        status: 'unregistered',
        daysRemaining: 0,
        hoursRemaining: 0,
        errorMessage: `Untrusted issuer: ${payload.iss}. Expected ${CLOUD_ISSUER}`,
      };
    }

    if (payload.aud !== CLOUD_AUDIENCE) {
      return {
        valid: false,
        status: 'unregistered',
        daysRemaining: 0,
        hoursRemaining: 0,
        errorMessage: `Invalid audience: ${payload.aud}. Expected ${CLOUD_AUDIENCE}`,
      };
    }

    // 3. Cryptographic Signature Verification using WebCrypto
    const canonicalPayloadString = canonicalizeJson(payload as unknown as Record<string, any>);
    const encoder = new TextEncoder();
    const dataBytes = encoder.encode(canonicalPayloadString);
    const signatureBytes = base64UrlToUint8Array(signatureB64Url);

    try {
      const cryptoKey = await getVerificationCryptoKey();
      const isSignatureValid = await window.crypto.subtle.verify(
        'RSASSA-PKCS1-v1_5',
        cryptoKey,
        signatureBytes.buffer as ArrayBuffer,
        dataBytes.buffer as ArrayBuffer
      );

      if (!isSignatureValid) {
        return {
          valid: false,
          status: 'unregistered',
          daysRemaining: 0,
          hoursRemaining: 0,
          errorMessage: 'Cryptographic signature verification failed: token signature is invalid or tampered',
        };
      }
    } catch (err: any) {
      // In automated test environments without full WebCrypto, check if signature matches
      return {
        valid: false,
        status: 'unregistered',
        daysRemaining: 0,
        hoursRemaining: 0,
        errorMessage: `Crypto subsystem error: ${err?.message || 'Verification unavailable'}`,
      };
    }

    // 4. Time & Offline Grace Window Calculations
    // Clock rollback defense: current time cannot be significantly before token issuance
    if (currentTimeSec < payload.iat - 300) {
      return {
        valid: false,
        status: 'expired',
        payload,
        daysRemaining: 0,
        hoursRemaining: 0,
        errorMessage: 'System clock tampering detected: current time is earlier than token issuance date',
      };
    }

    const secondsLeft = payload.exp - currentTimeSec;
    const hoursRemaining = Math.max(0, Math.floor(secondsLeft / 3600));
    const daysRemaining = Math.max(0, Math.ceil(secondsLeft / 86400));

    // Day 8+ Expired: 7-day offline grace period has elapsed
    if (secondsLeft <= 0) {
      return {
        valid: false,
        status: 'expired',
        payload,
        daysRemaining: 0,
        hoursRemaining: 0,
        errorMessage: 'Offline grace period of 7 days has expired. Please connect to the internet to refresh license.',
      };
    }

    // Grace period warning: Less than 48 hours left
    if (hoursRemaining <= 48) {
      return {
        valid: true,
        status: 'grace_period',
        payload,
        daysRemaining,
        hoursRemaining,
      };
    }

    // Day 0 to Day 5: 100% active offline
    return {
      valid: true,
      status: 'active',
      payload,
      daysRemaining,
      hoursRemaining,
    };
  } catch (e: any) {
    return {
      valid: false,
      status: 'unregistered',
      daysRemaining: 0,
      hoursRemaining: 0,
      errorMessage: e?.message || 'Unknown entitlement verification error',
    };
  }
}
