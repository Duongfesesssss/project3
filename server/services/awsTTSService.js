const AWS = require('aws-sdk');

// Cấu hình AWS credentials
AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION || 'ap-southeast-1'
});

const polly = new AWS.Polly();

class AWSTTSService {
  /**
   * Chuyển đổi text thành audio bằng AWS Polly
   * @param {string} text - Nội dung cần đọc
   * @param {string} voiceId - Giọng đọc (mặc định: Joanna)
   * @returns {Promise<Buffer>} Audio buffer
   */
  async synthesizeSpeech(text, voiceId = 'Joanna') {
    try {
      console.log(`AWS TTS - Text length: ${text.length} characters`);
      console.log(`AWS TTS - Text preview: ${text.substring(0, 100)}...`);

      // AWS Polly có giới hạn 3,000 ký tự
      if (text.length > 3000) {
        console.log(`Text quá dài (${text.length} chars), cắt xuống 3000 ký tự`);
        text = text.substring(0, 2950) + '...';
      }

      const params = {
        Text: text,
        OutputFormat: 'mp3',
        VoiceId: voiceId,
        Engine: 'standard', // Sử dụng standard để tiết kiệm chi phí
        LanguageCode: 'en-US'
      };

      console.log(`Đang tạo audio với AWS Polly - Giọng: ${voiceId}`);
      const result = await polly.synthesizeSpeech(params).promise();
      console.log('Tạo audio AWS Polly thành công');
      
      return result.AudioStream;
    } catch (error) {
      console.error('Lỗi khi tạo audio:', error);
      throw new Error('Không thể tạo audio từ text: ' + error.message);
    }
  }
  /**
   * Lấy danh sách giọng đọc có sẵn cho tiếng Anh
   * @returns {Promise<Array>} Danh sách voices
   */
  async getAvailableVoices() {
    try {
      return [
        {
          Id: 'Joanna',
          Name: 'Joanna',
          Gender: 'Female',
          LanguageCode: 'en-US',
          LanguageName: 'US English (Standard)'
        },
        {
          Id: 'Matthew',
          Name: 'Matthew', 
          Gender: 'Male',
          LanguageCode: 'en-US',
          LanguageName: 'US English (Standard)'
        }
      ];
    } catch (error) {
      console.error('Lỗi khi lấy danh sách giọng đọc:', error);
      throw new Error('Không thể lấy danh sách giọng đọc: ' + error.message);
    }
  }

  /**
   * Kiểm tra kết nối AWS
   * @returns {Promise<boolean>}
   */
  async testConnection() {
    try {
      await polly.describeVoices({ LanguageCode: 'en-US' }).promise();
      return true;
    } catch (error) {
      console.error('Không thể kết nối với AWS Polly:', error);
      return false;
    }
  }
}

module.exports = new AWSTTSService();