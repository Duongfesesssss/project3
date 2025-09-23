<template>
  <div class="audio-player bg-white rounded-lg shadow-md p-4 border">
    <!-- Header -->
    <div class="flex items-center justify-between mb-3">
      <h3 class="font-semibold text-gray-800">🔊 Nghe mô tả sách</h3>
      <div class="text-sm text-gray-500">
        {{ selectedProvider === 'google' ? '🇻🇳 Tiếng Việt' : '🇺🇸 English' }}
      </div>
    </div>

    <!-- Controls -->
    <div class="flex items-center gap-3">
      <!-- Play/Pause Button -->
      <button
        @click="handlePlayPause"
        :disabled="isLoading"
        class="flex-shrink-0 w-12 h-12 rounded-full bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white flex items-center justify-center transition-colors"
      >
        <div v-if="isLoading" class="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full"></div>
        <svg v-else-if="isPlaying" class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path d="M6 4h2v12H6V4zm6 0h2v12h-2V4z"/>
        </svg>
        <svg v-else class="w-5 h-5 ml-1" fill="currentColor" viewBox="0 0 20 20">
          <path d="M6.3 2.841A1.5 1.5 0 004 4.11v11.78a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.841z"/>
        </svg>
      </button>

      <!-- Info -->
      <div class="flex-1">
        <div class="text-sm font-medium text-gray-700">
          {{ isPlaying ? 'Đang phát...' : isLoading ? 'Đang tải...' : 'Nhấn để nghe' }}
        </div>
        <div class="text-xs text-gray-500">
          Tự động phát hiện ngôn ngữ
        </div>
      </div>

      <!-- Stop Button -->
      <button
        v-if="isPlaying"
        @click="handleStop"
        class="w-8 h-8 rounded bg-red-500 hover:bg-red-600 text-white flex items-center justify-center transition-colors"
      >
        <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path d="M4 4h12v12H4V4z"/>
        </svg>
      </button>
    </div>

    <!-- Error Message -->
    <div v-if="error" class="mt-3 p-2 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
      ⚠️ {{ error }}
    </div>

    <!-- Language Detection Info -->
    <div v-if="textToAnalyze" class="mt-3 p-2 bg-blue-50 border border-blue-200 rounded text-blue-700 text-xs">
      📝 Ngôn ngữ phát hiện: {{ detectedLanguage === 'vietnamese' ? 'Tiếng Việt (Google TTS)' : 'English (AWS Polly)' }}
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  text: {
    type: String,
    required: true
  },
  autoDetect: {
    type: Boolean,
    default: true
  }
})

// Debug log
console.log('🎧 AudioPlayer initialized with text:', props.text?.substring(0, 50))

// Import và khởi tạo composable từ đúng path
const tts = useTextToSpeech()

// Debug composable
console.log('🔧 TTS Composable methods:', Object.keys(tts))

// Destructure từ composable
const { 
  isPlaying, 
  isLoading, 
  error, 
  speak, 
  stop, 
  detectLanguage,
  selectProvider 
} = tts

// Reactive data
const textToAnalyze = computed(() => props.text?.substring(0, 200) || '')

// Safe computed với fallback và debug
const detectedLanguage = computed(() => {
  if (!textToAnalyze.value) return 'english'
  try {
    if (!detectLanguage) {
      console.warn('⚠️ detectLanguage function not available')
      return 'english'
    }
    const lang = detectLanguage(textToAnalyze.value)
    console.log('🌍 Detected language:', lang, 'for text:', textToAnalyze.value.substring(0, 30))
    return lang
  } catch (e) {
    console.error('❌ Error detecting language:', e)
    return 'english'
  }
})

const selectedProvider = computed(() => {
  if (!textToAnalyze.value) return 'aws'
  try {
    if (!selectProvider) {
      console.warn('⚠️ selectProvider function not available')
      return 'aws'
    }
    const provider = selectProvider(textToAnalyze.value)
    console.log('🎵 Selected provider:', provider)
    return provider
  } catch (e) {
    console.error('❌ Error selecting provider:', e)
    return 'aws'
  }
})

// Methods
const handlePlayPause = async () => {
  console.log('▶️ handlePlayPause called')
  
  if (!props.text) {
    console.log('❌ No text provided')
    return
  }

  try {
    console.log('🔧 speak function type:', typeof speak)
    console.log('🔧 isPlaying value:', isPlaying.value)
    console.log('🔧 Full text length:', props.text.length)
    
    if (!speak) {
      console.error('❌ speak function not available in composable')
      return
    }
    
    if (isPlaying.value) {
      console.log('⏸️ Stopping audio')
      stop && stop()
    } else {
      console.log('▶️ Starting audio with provider:', selectedProvider.value)
      console.log('📝 Full text to speak:', props.text.substring(0, 100) + '...')
      await speak(props.text, {  // Gửi FULL TEXT thay vì textToAnalyze
        provider: selectedProvider.value
      })
    }
  } catch (error) {
    console.error('❌ Lỗi play/pause:', error)
  }
}

const handleStop = () => {
  try {
    console.log('⏹️ Stop called')
    stop && stop()
  } catch (error) {
    console.error('❌ Lỗi stop:', error)
  }
}

// Debug watch để theo dõi thay đổi
watch(() => props.text, (newText) => {
  console.log('📝 Text changed:', newText?.substring(0, 50))
}, { immediate: true })

watch(detectedLanguage, (lang) => {
  console.log('🌍 Language detection changed to:', lang)
})

watch(selectedProvider, (provider) => {
  console.log('🎵 Provider changed to:', provider)
})
</script>