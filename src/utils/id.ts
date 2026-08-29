const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

export function uid(): string {
  let out = '';
  for (let i = 0; i < 10; i++) {
    out += ALPHABET[Math.floor(Math.random() * ALPHABET.length)];
  }
  return `${Date.now().toString(36)}${out}`;
}

/** Generates a HEC-style reference number, e.g. HEC-DA-2026-7K2M9Q */
export function generateReferenceId(): string {
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += ALPHABET[Math.floor(Math.random() * ALPHABET.length)];
  }
  return `HEC-DA-${new Date().getFullYear()}-${code}`;
}

export function generateTxnId(): string {
  let code = '';
  for (let i = 0; i < 10; i++) {
    code += Math.floor(Math.random() * 10).toString();
  }
  return `TXN${code}`;
}
