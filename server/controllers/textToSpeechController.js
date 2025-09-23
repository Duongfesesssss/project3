const awsTTSService = require('../services/awsTTSService');
const googleTTSService = require('../services/googleTTSService');
const ttsChunking = require('../services/ttsChunking');

class TextToSpeechController {
  /**
   * API endpoint để tạo audio từ mô tả sách
   */
  async generateAudioFromBookDescription(req, res) {
    try {
      const { bookId, text, voiceId, provider } = req.body;

      // Validate input
      if (!text) {
        return res.status(400).json({
          success: false,
          message: 'Thiếu nội dung text cần đọc'
        });
      }

      console.log(`Tạo audio cho sách ID: ${bookId}, độ dài text: ${text.length} ký tự, provider: ${provider}`);

      let audioBuffer;
      let serviceUsed = 'unknown';

      // Phát hiện ngôn ngữ để chọn service phù hợp
      const detectedLang = googleTTSService.detectLanguage(text);
      const isVietnamese = detectedLang === 'vi';

      console.log(`Ngôn ngữ phát hiện: ${isVietnamese ? 'Tiếng Việt' : 'Tiếng Anh'}`);

      if (isVietnamese) {
        // Tiếng Việt - chỉ dùng Google TTS với chunking thông minh
        console.log('🇻🇳 Xử lý tiếng Việt với Google TTS...');
        audioBuffer = await googleTTSService.synthesizeSpeech(text, detectedLang);
        serviceUsed = `Google TTS (Vietnamese - ${text.length} chars)`;
        console.log('✅ Hoàn thành tiếng Việt');
      } else {
        // Tiếng Anh - chỉ dùng AWS TTS  
        console.log('🇺🇸 Xử lý tiếng Anh với AWS TTS...');
        audioBuffer = await awsTTSService.synthesizeSpeech(text, voiceId || 'Joanna');
        serviceUsed = `AWS TTS (English - ${text.length} chars)`;
        console.log('✅ Hoàn thành tiếng Anh');
      }

      // Set headers cho audio response
      res.set({
        'Content-Type': 'audio/mpeg',
        'Content-Length': audioBuffer.length,
        'Cache-Control': 'public, max-age=3600',
        'Content-Disposition': `inline; filename="book-${bookId}-audio.mp3"`,
        'X-TTS-Service': serviceUsed,
        'X-Text-Length': text.length.toString(),
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Expose-Headers': 'X-TTS-Service, X-Text-Length'
      });

      res.send(audioBuffer);
    } catch (error) {
      console.error('Lỗi tạo audio:', error);
      res.status(500).json({
        success: false,
        message: 'Lỗi server khi tạo audio',
        error: error.message
      });
    }
  }

  /**
   * Lấy danh sách giọng đọc có sẵn
   */
  async getVoices(req, res) {
    try {
      const [awsVoices, googleVoices] = await Promise.all([
        awsTTSService.getAvailableVoices(),
        googleTTSService.getAvailableVoices()
      ]);
      
      res.json({
        success: true,
        data: {
          aws: awsVoices,
          google: googleVoices
        },
        message: `AWS: ${awsVoices.length} giọng, Google: ${googleVoices.length} giọng`
      });
    } catch (error) {
      console.error('Lỗi lấy danh sách giọng đọc:', error);
      res.status(500).json({
        success: false,
        message: 'Lỗi server khi lấy danh sách giọng đọc',
        error: error.message
      });
    }
  }

  /**
   * Kiểm tra kết nối với AWS Polly
   */
  async testConnection(req, res) {
    try {
      const isConnected = await awsTTSService.testConnection();
      
      if (isConnected) {
        res.json({
          success: true,
          message: 'Kết nối AWS Polly thành công',
          timestamp: new Date().toISOString()
        });
      } else {
        res.status(500).json({
          success: false,
          message: 'Không thể kết nối với AWS Polly'
        });
      }
    } catch (error) {
      console.error('Lỗi kiểm tra kết nối:', error);
      res.status(500).json({
        success: false,
        message: 'Lỗi server khi kiểm tra kết nối',
        error: error.message
      });
    }
  }
}

module.exports = new TextToSpeechController();