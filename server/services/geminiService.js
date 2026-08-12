import { normalizeWebsite } from '../utils/normalize.js';

const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';

function buildPrompt(lead, analysis) {
  const name = lead.businessName || lead.name || 'there';
  const website = lead.website ? normalizeWebsite(lead.website) : '';
  const location = [lead.city, lead.country].filter(Boolean).join(', ') || 'your area';
  const category = lead.category || 'business';

  const analysisText = analysis?.response
    ? `\n\nWebsite analysis summary:\n${JSON.stringify(analysis.response, null, 2)}`
    : '';

  if (website) {
    return `Write a professional, personalized outreach email to ${name}, a ${category} in ${location}. Their website is ${website}. Use the following website analysis to identify genuine, specific opportunities. Do not invent facts or problems not supported by the analysis. Keep the tone honest and professional.\n\nReturn the result as a JSON object with "subject" and "body" keys. Do not include markdown code fences.\n${analysisText}`;
  }

  return `Write a professional outreach email to ${name}, a ${category} in ${location}. They do not currently have a website. Offer professional website development/design services. Do not invent problems or facts. Keep the tone honest and professional.\n\nReturn the result as a JSON object with "subject" and "body" keys. Do not include markdown code fences.`;
}

function tryParseJSON(text) {
  try {
    const cleaned = text.replace(/```json\s*|```/g, '').trim();
    const parsed = JSON.parse(cleaned);
    if (parsed.subject && parsed.body) return parsed;
  } catch {
    // fall through
  }
  return null;
}

export async function generateEmail(lead, analysis = null) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('Gemini API key is not configured');
  }

  const prompt = buildPrompt(lead, analysis);

  let rawText = '';
  try {
    const res = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
      }),
    });

    if (!res.ok) {
      throw new Error(`Gemini API returned ${res.status}`);
    }

    const data = await res.json();
    rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
  } catch (err) {
    throw new Error(`Gemini unavailable: ${err.message}`);
  }

  const parsed = tryParseJSON(rawText);
  if (parsed) return parsed;

  const lines = rawText.split('\n').filter(Boolean);
  let subject = lines.find((l) => l.toLowerCase().startsWith('subject:'))?.replace(/subject:/i, '').trim() || 'Introduction';
  let body = rawText;

  return { subject, body };
}
