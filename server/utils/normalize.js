function cleanValue(value) {
  if (!value) return '';
  const v = Array.isArray(value) ? value[0] : value;
  if (v === undefined || v === null || v === 'undefined' || v === 'null') return '';
  return String(v).trim();
}

export const normalizePhone = (value) => {
  const phone = cleanValue(value);
  return phone.replace(/\s|\D/g, '');
};

export const normalizeEmail = (value) => {
  return cleanValue(value).toLowerCase();
};

export const normalizeWebsite = (value) => {
  let url = cleanValue(value);
  if (!url) return '';
  if (!/^https?:\/\//i.test(url) && !/^mailto:/i.test(url)) {
    url = 'https://' + url;
  }
  try {
    const u = new URL(url);
    return u.origin.replace(/\/$/, '') + u.pathname.replace(/\/$/, '');
  } catch {
    return url;
  }
};

export const hasWebsite = (value) => Boolean(normalizeWebsite(value));

export const stringHash = (str) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0;
  }
  return String(hash);
};
