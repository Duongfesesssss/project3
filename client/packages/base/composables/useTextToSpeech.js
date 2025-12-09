/**
 * Composable cho Text-to-Speech với hỗ trợ cả AWS và Google TTS
 */
export const useTextToSpeech = () => {
  const isPlaying = ref(false)
  const isLoading = ref(false)
  const error = ref(null)
  const currentAudio = ref(null)
  const runtimeConfig = useRuntimeConfig()

  const apiBase = runtimeConfig.public?.apiBase || runtimeConfig.public?.apiURL || ''
  const apiPrefix = runtimeConfig.public?.apiPrefix || '/api'
  const ttsBase = `${apiBase}${apiPrefix}/text-to-speech`

  /**
   * Tự động phát hiện ngôn ngữ từ text
   */
  const detectLanguage = (text) => {
    if (!text) return 'english'
    const vietnamesePattern = /[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]/i
    return vietnamesePattern.test(text) ? 'vietnamese' : 'english'
  }

  /**
   * Chọn provider phù hợp dựa trên ngôn ngữ
   */
  const selectProvider = (text) => {
    const language = detectLanguage(text)
    return language === 'vietnamese' ? 'google' : 'aws'
  }

  /**
   * Phát audio từ text
   */
  const speak = async (text, options = {}) => {
    try {
      error.value = null
      isLoading.value = true

      // Dừng audio hiện tại nếu có
      if (currentAudio.value) {
        currentAudio.value.pause()
        currentAudio.value = null
        isPlaying.value = false
      }

      // Tự động chọn provider nếu không chỉ định
      const provider = options.provider || selectProvider(text)
      const voiceId = options.voiceId || (provider === 'google' ? 'vi' : 'Joanna')

      console.log(`🎵 Sử dụng ${provider} TTS cho text: "${text.substring(0, 50)}..."`)
      console.log(`🌍 Ngôn ngữ phát hiện: ${detectLanguage(text)}`)

      // Gọi API backend
      console.log('🌐 Calling API with:', { text: text.substring(0, 50), provider, voiceId })
      
      const response = await fetch(`${ttsBase}/synthesize`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text,
          provider,
          voiceId
        })
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      // Lấy audio blob
      const audioBuffer = await response.arrayBuffer()
      console.log('✅ Received audio buffer:', audioBuffer.byteLength, 'bytes')

      // Tạo audio object từ response
      const audioBlob = new Blob([audioBuffer], { type: 'audio/mpeg' })
      const audioUrl = URL.createObjectURL(audioBlob)
      
      console.log('🎵 Created audio URL:', audioUrl)
      
      const audio = new Audio(audioUrl)
      currentAudio.value = audio

      // Event listeners
      audio.addEventListener('loadstart', () => {
        console.log('🔄 Audio loading started')
        isLoading.value = true
      })

      audio.addEventListener('canplay', () => {
        console.log('✅ Audio can play')
        isLoading.value = false
      })

      audio.addEventListener('play', () => {
        console.log('▶️ Audio started playing')
        isPlaying.value = true
      })

      audio.addEventListener('pause', () => {
        console.log('⏸️ Audio paused')
        isPlaying.value = false
      })

      audio.addEventListener('ended', () => {
        console.log('🏁 Audio ended')
        isPlaying.value = false
        URL.revokeObjectURL(audioUrl)
        currentAudio.value = null
      })

      audio.addEventListener('error', (e) => {
        console.error('❌ Audio error:', e)
        error.value = 'Lỗi phát audio: ' + e.message
        isLoading.value = false
        isPlaying.value = false
      })

      audio.addEventListener('timeupdate', () => {
        console.log(`⏱️ Audio progress: ${audio.currentTime.toFixed(1)}s / ${audio.duration?.toFixed(1)}s`)
      })

      // Phát audio
      await audio.play()

    } catch (err) {
      console.error('❌ Lỗi TTS:', err)
      error.value = err.message || 'Không thể tạo audio'
      isLoading.value = false
      isPlaying.value = false
    }
  }

  /**
   * Dừng phát audio
   */
  const stop = () => {
    if (currentAudio.value) {
      currentAudio.value.pause()
      currentAudio.value.currentTime = 0
      isPlaying.value = false
    }
  }

  /**
   * Tạm dừng/tiếp tục audio
   */
  const togglePlay = () => {
    if (currentAudio.value) {
      if (isPlaying.value) {
        currentAudio.value.pause()
      } else {
        currentAudio.value.play()
      }
    }
  }

  /**
   * Lấy danh sách giọng đọc có sẵn
   */
  const getVoices = async () => {
    try {
      const response = await $fetch(`${ttsBase}/voices`)
      return response.data
    } catch (err) {
      console.error('Lỗi lấy danh sách giọng:', err)
      throw err
    }
  }

  // Cleanup khi component unmount
  onUnmounted(() => {
    if (currentAudio.value) {
      currentAudio.value.pause()
      currentAudio.value = null
    }
  })

  return {
    // State
    isPlaying: readonly(isPlaying),
    isLoading: readonly(isLoading),
    error: readonly(error),
    
    // Methods
    speak,
    stop,
    togglePlay,
    getVoices,
    detectLanguage,
    selectProvider
  }
}