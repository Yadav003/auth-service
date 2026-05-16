/**
 * OAuth Utilities
 * Helpers for PKCE, state/nonce creation, and cookie parsing
 */

import crypto from 'crypto';

const base64UrlEncode = (buffer) =>
  buffer.toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');

export const generateCodeVerifier = () => base64UrlEncode(crypto.randomBytes(32));

export const generateCodeChallenge = (verifier) =>
  base64UrlEncode(crypto.createHash('sha256').update(verifier).digest());

export const generateState = () => base64UrlEncode(crypto.randomBytes(16));

export const generateNonce = () => base64UrlEncode(crypto.randomBytes(16));

export const parseCookies = (cookieHeader = '') => {
  if (!cookieHeader) {
    return {};
  }

  return cookieHeader.split(';').reduce((cookies, part) => {
    const [rawKey, ...rest] = part.trim().split('=');
    if (!rawKey) {
      return cookies;
    }
    cookies[rawKey] = decodeURIComponent(rest.join('='));
    return cookies;
  }, {});
};

export const buildGoogleAuthUrl = ({ clientId, redirectUri, state, nonce, codeChallenge }) => {
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: 'openid email profile',
    state,
    nonce,
    code_challenge: codeChallenge,
    code_challenge_method: 'S256',
  });

  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
};
