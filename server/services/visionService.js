const vision = require('@google-cloud/vision');

let visionClient;

const normalizeText = (text) => {
  if (!text) return '';
  return text
    .replace(/\s+/g, ' ')
    .replace(/["'`]/g, '')
    .trim();
};

const getVisionClient = () => {
  if (visionClient) return visionClient;
  try {
    visionClient = new vision.ImageAnnotatorClient();
    return visionClient;
  } catch (error) {
    console.error('Khởi tạo Vision client thất bại:', error);
    throw new Error('Google Vision chưa được cấu hình');
  }
};

const detectTextAndWeb = async (fileBuffer) => {
  const client = getVisionClient();
  const [textResult] = await client.textDetection(fileBuffer);
  const [webResult] = await client.webDetection(fileBuffer);

  const textAnnotations = textResult?.textAnnotations || [];
  const rawText = textAnnotations.length > 0 ? textAnnotations[0].description || '' : '';
  const lineCandidates = rawText
    .split('\n')
    .map((line) => normalizeText(line))
    .filter((line) => line.length >= 3);

  const webEntities = webResult?.webDetection?.webEntities || [];
  const webCandidates = webEntities
    .map((entity) => normalizeText(entity.description))
    .filter((desc) => desc && desc.length >= 3);

  return {
    rawText,
    lineCandidates,
    webCandidates,
  };
};

const buildQueryCandidates = ({ lineCandidates = [], webCandidates = [] }) => {
  const merged = [...lineCandidates, ...webCandidates];
  const deduped = Array.from(new Set(merged)).filter(Boolean);
  const primaryQuery = deduped[0] || '';

  return {
    primaryQuery,
    candidates: deduped,
  };
};

module.exports = {
  detectTextAndWeb,
  buildQueryCandidates,
};
