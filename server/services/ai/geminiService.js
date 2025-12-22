const fetch = (...args) => import('node-fetch').then(({ default: f }) => f(...args)).catch(() => global.fetch(...args));

const DEFAULT_MODEL = process.env.GEMINI_MODEL || 'gemini-2.5-flash';
const GEMINI_API_BASE = process.env.GEMINI_API_BASE || 'https://generativelanguage.googleapis.com';

function buildEndpoint(model) {
  const safeModel = encodeURIComponent(model || DEFAULT_MODEL);
  return `${GEMINI_API_BASE.replace(/\/$/, '')}/v1beta/models/${safeModel}:generateContent`;
}

async function generateSupportReply(userText) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is missing');
  }
  const prompt = userText || 'Xin chào, tôi cần hỗ trợ';

  const body = {
    contents: [
      {
        role: 'user',
        parts: [
          {
            text:
              'Bạn là trợ lý hỗ trợ khách hàng, trả lời ngắn gọn, lịch sự, hỏi lại thông tin cần thiết. Nội dung người dùng: ' + prompt,
          },
        ],
      },
    ],
  };

  const tryModels = [DEFAULT_MODEL];
  let lastErr;

  for (const model of tryModels) {
    try {
      const url = `${buildEndpoint(model)}?key=${encodeURIComponent(apiKey)}`;
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const text = await res.text().catch(() => '');
        const err = new Error(`Gemini request failed: ${res.status} ${text}`);
        err.status = res.status;
        throw err;
      }

      const data = await res.json();
      const reply = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (reply) return reply.trim();
      throw new Error('Gemini returned no content');
    } catch (err) {
      lastErr = err;
      // Nếu lỗi 404 do model không tồn tại, thử model kế tiếp
      if (err?.status === 404) {
        continue;
      }
    }
  }

  throw lastErr || new Error('Gemini request failed');
}

module.exports = { generateSupportReply };
