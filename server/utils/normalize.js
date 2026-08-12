export const normalizePhone = (value) => {
  if (!value) return '';
  const phone = Array.isArray(value) ? value[0] : value;
  return String(phone).replace(/\s|\D/g, '').trim();
};

export const normalizeEmail = (value) => {
  if (!value) return '';
  const email = Array.isArray(value) ? value[0] : value;
  return String(email).toLowerCase().trim();
};

export const normalizeWebsite = (value) => {
  if (!value) return '';
  const website = Array.isArray(value) ? value[0] : value;
  let url = String(website).trim();
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
