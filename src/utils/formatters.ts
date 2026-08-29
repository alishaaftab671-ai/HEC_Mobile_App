const MONTHS_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/** Formats an ISO date string as "12 Aug 2026". */
export function formatDate(iso: string | null | undefined): string {
  if (!iso) return '—';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '—';
  return `${d.getDate()} ${MONTHS_SHORT[d.getMonth()]} ${d.getFullYear()}`;
}

/** Formats an ISO datetime as "12 Aug 2026, 4:35 PM". */
export function formatDateTime(iso: string | null | undefined): string {
  if (!iso) return '—';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '—';
  let hours = d.getHours();
  const mins = d.getMinutes().toString().padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12 || 12;
  return `${formatDate(iso)}, ${hours}:${mins} ${ampm}`;
}

/** "3 min ago", "2 hrs ago", "5 days ago". */
export function timeAgo(iso: string): string {
  const then = new Date(iso).getTime();
  if (isNaN(then)) return '';
  const diff = Math.max(0, Date.now() - then);
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins} min ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} hr${hrs > 1 ? 's' : ''} ago`;
  const days = Math.floor(hrs / 24);
  if (days < 30) return `${days} day${days > 1 ? 's' : ''} ago`;
  return formatDate(iso);
}

/** "35202-1234567-1" from digits-only input. */
export function formatCNIC(raw: string): string {
  const digits = raw.replace(/\D/g, '').slice(0, 13);
  const p1 = digits.slice(0, 5);
  const p2 = digits.slice(5, 12);
  const p3 = digits.slice(12, 13);
  let out = p1;
  if (p2) out += `-${p2}`;
  if (p3) out += `-${p3}`;
  return out;
}

/** "0300-1234567" from digits-only input. */
export function formatPhone(raw: string): string {
  const digits = raw.replace(/\D/g, '').slice(0, 11);
  if (digits.length <= 4) return digits;
  return `${digits.slice(0, 4)}-${digits.slice(4)}`;
}

/** "0000 0000 0000 0000" grouping for demo card numbers. */
export function formatCardNumber(raw: string): string {
  const digits = raw.replace(/\D/g, '').slice(0, 16);
  return digits.replace(/(\d{4})(?=\d)/g, '$1 ').trim();
}

/** "MM/YY" expiry formatting. */
export function formatExpiry(raw: string): string {
  const digits = raw.replace(/\D/g, '').slice(0, 4);
  if (digits.length <= 2) return digits;
  return `${digits.slice(0, 2)}/${digits.slice(2)}`;
}

export function formatFileSize(bytes: number): string {
  if (!bytes && bytes !== 0) return '—';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/** Masks a CNIC like 35202-•••••••-1. */
export function maskCNIC(cnic: string): string {
  const digits = cnic.replace(/\D/g, '');
  if (digits.length < 13) return cnic;
  return `${digits.slice(0, 5)}-•••••••-${digits.slice(12)}`;
}

/** Masks phone like 0300-•••4567. */
export function maskPhone(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  if (digits.length < 11) return phone;
  return `${digits.slice(0, 4)}-•••${digits.slice(7)}`;
}

/** Masks email like a•••@gmail.com. */
export function maskEmail(email: string): string {
  const [name, domain] = email.split('@');
  if (!domain || !name) return email;
  return `${name[0]}•••@${domain}`;
}

export function formatPKR(amount: number): string {
  return `PKR ${amount.toLocaleString('en-PK')}`;
}
