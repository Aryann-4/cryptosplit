export function generateSecret(): Uint8Array {
  const secret = new Uint8Array(32);
  crypto.getRandomValues(secret);
  return secret;
}

export function getMemberId(memberSecret: Uint8Array): Uint8Array {
  return deriveId(memberSecret, padDomain('cryptosplit:member:v1'));
}

export function getDebtKey(debtorId: Uint8Array, creditorId: Uint8Array): Uint8Array {
  const step1 = persistentHash(padDomain('cryptosplit:debt:v1'), debtorId);
  return persistentHash(step1, creditorId);
}

function padDomain(domain: string): Uint8Array {
  const bytes = new Uint8Array(32);
  const encoded = new TextEncoder().encode(domain);
  bytes.set(encoded.slice(0, 32));
  return bytes;
}

function persistentHash(a: Uint8Array, b: Uint8Array): Uint8Array {
  // Simple deterministic hash for demo purposes
  // In production, this would use the same ZK-friendly hash as the contract
  const combined = new Uint8Array(64);
  combined.set(a, 0);
  combined.set(b, 32);

  const result = new Uint8Array(32);
  for (let i = 0; i < 32; i++) {
    result[i] = combined[i] ^ combined[i + 32];
    for (let j = 1; j < 8; j++) {
      result[i] ^= combined[(i + j * 4) % 64];
    }
  }
  return result;
}

function deriveId(secret: Uint8Array, domain: Uint8Array): Uint8Array {
  return persistentHash(domain, secret);
}

export function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

export function hexToBytes(hex: string): Uint8Array {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.substring(i, i + 2), 16);
  }
  return bytes;
}

export function bytesEqual(a: Uint8Array, b: Uint8Array): boolean {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) return false;
  }
  return true;
}

export function bytesToBase64(bytes: Uint8Array): string {
  let binary = '';
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

export function base64ToBytes(base64: string): Uint8Array {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}
