const fetch = require('node-fetch');

class GoogleTTSService {
  /**
   * Tạo audio từ Google Translate TTS với xử lý text dài
   * @param {string} text - Nội dung cần đọc
   * @param {string} lang - Mã ngôn ngữ (vi, en)
   * @returns {Promise<Buffer>} Audio buffer
   */
  async synthesizeSpeech(text, lang = 'vi') {
    try {
      console.log(`Google TTS - Text length: ${text.length} characters`);
      console.log(`Google TTS - Text preview: ${text.substring(0, 100)}...`);

      // Nếu text dài, chia thành chunks và ghép lại
      if (text.length > 150) {
        return await this.synthesizeLongText(text, lang);
      }

      // Text ngắn - xử lý trực tiếp
      return await this.synthesizeChunk(text, lang);
    } catch (error) {
      console.error('Google TTS failed:', error.message);
      throw new Error('Google TTS service unavailable: ' + error.message);
    }
  }

  /**
   * Xử lý text dài bằng cách chia chunk và ghép audio
   * @param {string} text - Text đầy đủ
   * @param {string} lang - Ngôn ngữ
   * @returns {Promise<Buffer>} Combined audio buffer
   */
  async synthesizeLongText(text, lang) {
    console.log(`🔄 Xử lý text dài với chunking: ${text.length} ký tự`);
    
    const chunks = this.smartChunkText(text, 140); // Giới hạn 140 chars/chunk
    console.log(`📝 Chia thành ${chunks.length} chunks`);
    
    const audioBuffers = [];
    
    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i];
      console.log(`🎵 Processing chunk ${i + 1}/${chunks.length}: "${chunk.substring(0, 50)}..."`);
      
      try {
        const audioBuffer = await this.synthesizeChunk(chunk, lang);
        audioBuffers.push(audioBuffer);
        
        // Thêm pause ngắn giữa các chunk (0.5 giây silence)
        if (i < chunks.length - 1) {
          const silenceBuffer = this.createSilenceBuffer(500);
          audioBuffers.push(silenceBuffer);
        }
        
        // Delay nhỏ để tránh rate limiting
        await new Promise(resolve => setTimeout(resolve, 200));
        
      } catch (error) {
        console.error(`❌ Chunk ${i + 1} failed:`, error.message);
        // Tiếp tục với chunk tiếp theo thay vì fail toàn bộ
      }
    }
    
    const combinedBuffer = Buffer.concat(audioBuffers);
    console.log(`✅ Chunking hoàn thành: ${combinedBuffer.length} bytes từ ${chunks.length} chunks`);
    
    return combinedBuffer;
  }

  /**
   * Chia text thành chunks thông minh theo câu và từ
   * @param {string} text - Text cần chia
   * @param {number} maxLength - Độ dài tối đa mỗi chunk
   * @returns {Array<string>} Mảng chunks
   */
  smartChunkText(text, maxLength = 140) {
    const chunks = [];
    
    // Chia theo câu trước
    const sentences = text.match(/[^\.!?]+[\.!?]+/g) || [text];
    
    let currentChunk = '';
    
    for (const sentence of sentences) {
      const trimmedSentence = sentence.trim();
      
      if ((currentChunk + ' ' + trimmedSentence).length <= maxLength) {
        currentChunk += (currentChunk ? ' ' : '') + trimmedSentence;
      } else {
        // Nếu chunk hiện tại không rỗng, thêm vào mảng
        if (currentChunk) {
          chunks.push(currentChunk.trim());
        }
        
        // Nếu câu quá dài, chia tiếp theo từ
        if (trimmedSentence.length > maxLength) {
          const words = trimmedSentence.split(' ');
          let wordChunk = '';
          
          for (const word of words) {
            if ((wordChunk + ' ' + word).length <= maxLength) {
              wordChunk += (wordChunk ? ' ' : '') + word;
            } else {
              if (wordChunk) chunks.push(wordChunk.trim());
              wordChunk = word;
            }
          }
          
          currentChunk = wordChunk;
        } else {
          currentChunk = trimmedSentence;
        }
      }
    }
    
    if (currentChunk) {
      chunks.push(currentChunk.trim());
    }
    
    return chunks.filter(chunk => chunk.length > 0);
  }

  /**
   * Tạo audio cho một chunk nhỏ
   * @param {string} text - Text chunk
   * @param {string} lang - Ngôn ngữ
   * @returns {Promise<Buffer>} Audio buffer
   */
  async synthesizeChunk(text, lang) {
    const url = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(text)}&tl=${lang}&client=tw-ob`;
    
    console.log(`🔗 Google TTS URL length: ${url.length}`);
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Google TTS HTTP ${response.status}: ${response.statusText} - ${errorText.substring(0, 100)}`);
    }

    const audioBuffer = await response.buffer();
    
    // Kiểm tra xem có phải file audio hợp lệ không
    if (audioBuffer.length < 500) {
      throw new Error(`Google TTS returned invalid/small audio (${audioBuffer.length} bytes) for text: "${text.substring(0, 50)}..."`);
    }
    
    return audioBuffer;
  }

  /**
   * Tạo buffer silence cho pause giữa các chunk
   * @param {number} durationMs - Thời gian silence (ms)
   * @returns {Buffer} Silence buffer
   */
  createSilenceBuffer(durationMs) {
    // Tạo MP3 silence buffer đơn giản (chỉ là placeholder)
    const silenceSize = Math.floor(durationMs / 10); // Rough calculation
    return Buffer.alloc(silenceSize, 0);
  }

  /**
   * Tự động phát hiện ngôn ngữ
   * @param {string} text 
   * @returns {string} Language code
   */
  detectLanguage(text) {
    const vietnamesePattern = /[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]/i;
    
    if (vietnamesePattern.test(text)) {
      return 'vi'; // Tiếng Việt
    }
    
    return 'en'; // Mặc định tiếng Anh
  }

  /**
   * Lấy danh sách giọng đọc có sẵn cho Google TTS
   * @returns {Promise<Array>} Danh sách voices
   */
  async getAvailableVoices() {
    try {
      return [
        {
          Id: 'vi-female',
          Name: 'Vietnamese Female',
          Gender: 'Female',
          LanguageCode: 'vi',
          LanguageName: 'Vietnamese'
        },
        {
          Id: 'en-female',
          Name: 'English Female',
          Gender: 'Female',
          LanguageCode: 'en',
          LanguageName: 'English'
        }
      ];
    } catch (error) {
      console.error('Lỗi khi lấy danh sách giọng đọc Google:', error);
      throw new Error('Không thể lấy danh sách giọng đọc Google: ' + error.message);
    }
  }
}

module.exports = new GoogleTTSService();