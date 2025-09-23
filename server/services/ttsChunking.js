const googleTTSService = require('./googleTTSService');
const awsTTSService = require('./awsTTSService');

class TTSChunkingService {
  /**
   * Chia text thành các chunk nhỏ để TTS xử lý
   * @param {string} text - Text cần chia
   * @param {number} maxChunkSize - Kích thước tối đa mỗi chunk
   * @returns {Array} Mảng các text chunks
   */
  splitTextIntoChunks(text, maxChunkSize = 180) {
    const chunks = [];
    
    // Thử chia theo câu trước
    const sentences = text.match(/[^\.!?]+[\.!?]+/g);
    
    if (sentences) {
      let currentChunk = '';
      
      for (const sentence of sentences) {
        if ((currentChunk + sentence).length <= maxChunkSize) {
          currentChunk += sentence;
        } else {
          if (currentChunk) chunks.push(currentChunk.trim());
          currentChunk = sentence;
        }
      }
      
      if (currentChunk) chunks.push(currentChunk.trim());
    } else {
      // Nếu không có câu, chia theo từ
      const words = text.split(' ');
      let currentChunk = '';
      
      for (const word of words) {
        if ((currentChunk + ' ' + word).length <= maxChunkSize) {
          currentChunk += (currentChunk ? ' ' : '') + word;
        } else {
          if (currentChunk) chunks.push(currentChunk);
          currentChunk = word;
        }
      }
      
      if (currentChunk) chunks.push(currentChunk);
    }
    
    return chunks;
  }

  /**
   * Tạo audio từ text dài bằng cách chia chunk
   * @param {string} text - Text đầy đủ
   * @param {string} language - Ngôn ngữ (vi/en)
   * @returns {Promise<Buffer>} Combined audio buffer
   */
  async synthesizeLongText(text, language = 'vi') {
    try {
      console.log(`🔄 Chunking text dài: ${text.length} ký tự`);
      
      const chunks = this.splitTextIntoChunks(text, 180);
      console.log(`📝 Chia thành ${chunks.length} chunks:`, chunks.map(c => c.length));
      
      const audioBuffers = [];
      
      for (let i = 0; i < chunks.length; i++) {
        const chunk = chunks[i];
        console.log(`🎵 Xử lý chunk ${i + 1}/${chunks.length}: ${chunk.length} chars`);
        
        try {
          let audioBuffer;
          
          if (language === 'vi') {
            // Dùng Google TTS cho tiếng Việt
            audioBuffer = await googleTTSService.synthesizeSpeech(chunk, language);
          } else {
            // Dùng AWS TTS cho tiếng Anh
            audioBuffer = await awsTTSService.synthesizeSpeech(chunk);
          }
          
          audioBuffers.push(audioBuffer);
          
          // Thêm pause ngắn giữa các chunk (optional)
          if (i < chunks.length - 1) {
            const silenceBuffer = Buffer.alloc(1000); // 1KB silence
            audioBuffers.push(silenceBuffer);
          }
          
        } catch (error) {
          console.error(`❌ Lỗi chunk ${i + 1}:`, error.message);
          // Tiếp tục với chunk tiếp theo
        }
      }
      
      // Ghép tất cả audio buffers
      const combinedBuffer = Buffer.concat(audioBuffers);
      console.log(`✅ Hoàn thành chunking: ${combinedBuffer.length} bytes`);
      
      return combinedBuffer;
      
    } catch (error) {
      console.error('❌ Lỗi chunking service:', error);
      throw error;
    }
  }
}

module.exports = new TTSChunkingService();