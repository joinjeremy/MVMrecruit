export const isValidEmail = (email: string): boolean => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

export const isValidSortCode = (code: string): boolean => {
  // Accepts 12-34-56 or 123456
  return /^(?:\d{2}-\d{2}-\d{2}|\d{6})$/.test(code);
};

export const isValidAccountNumber = (num: string): boolean => {
  return /^\d{8}$/.test(num);
};

export const isValidNINumber = (ni: string): boolean => {
  // Basic UK NI Number regex
  return /^[A-CEGHJ-PR-TW-Z]{1}[A-CEGHJ-NPR-TW-Z]{1}[0-9]{6}[A-D]{1}$/i.test(ni.replace(/\s/g, ''));
};

export const formatSortCode = (val: string): string => {
  const digits = val.replace(/\D/g, '');
  if (digits.length <= 2) return digits;
  if (digits.length <= 4) return `${digits.slice(0, 2)}-${digits.slice(2)}`;
  return `${digits.slice(0, 2)}-${digits.slice(2, 4)}-${digits.slice(4, 6)}`;
};