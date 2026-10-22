/**
 * JerseyStudio Embedded Public Verification Key
 *
 * STRICT SECURITY PRINCIPLE:
 * ONLY the public key is embedded in the client application.
 * The signing private key is strictly kept server-side in the cloud admin backend.
 *
 * This key is used by the desktop app to verify server signatures offline.
 */

export const CLOUD_ISSUER = 'jerseystudio-cloud';
export const CLOUD_AUDIENCE = 'jerseystudio-desktop';
export const OFFLINE_GRACE_DAYS = 7;

export const SERVER_PUBLIC_KEY_PEM = `-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAmjq92D2vKYVGYqY7BLDD
GzPw0N4BBiZXAluKiPBTF9ysOu6S2kwRKvE6Dadb1E0KbSkaVzL8d1ypOM/1tc0f
23JAaE83OI8RkDiEJNqm3wZN/tHVeZfvzR/z1637fgfjhiUqlLxDY5/D9frRcvq1
r9GIqYfrf0kyX4pzG9z9xUBuZguMMWCdLvRVhOj9yUAYNSy2Ch6Y2HNhTwB2soQr
1QuC9xS6JsJ3oUxGHrgX//G00v/WUsgyxYL0jafXXPbEpF2k7OK47hjy/sIsfOVP
JeiSIBAnjpqUhKP+8wmy1p88Bd8ET9PVxlUA3yd6+wT+Y5AfMx6GEmDfSFswAoh8
MQIDAQAB
-----END PUBLIC KEY-----`;

/**
 * Clean base64-encoded SubjectPublicKeyInfo (SPKI) for WebCrypto importKey.
 */
export const SERVER_PUBLIC_KEY_SPKI_B64 = SERVER_PUBLIC_KEY_PEM
  .replace(/-----BEGIN PUBLIC KEY-----/, '')
  .replace(/-----END PUBLIC KEY-----/, '')
  .replace(/\s+/g, '');
