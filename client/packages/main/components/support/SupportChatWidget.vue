<script setup lang="ts">
import { io } from 'socket.io-client';
import Button from 'primevue/button';
import Dialog from 'primevue/dialog';
import Textarea from 'primevue/textarea';
import ScrollPanel from 'primevue/scrollpanel';

const runtimeConfig = useRuntimeConfig();
const auth = useAuth();
const apiBase = runtimeConfig.public.apiBase;
const apiPrefix = runtimeConfig.public.apiPrefix || '/api';
const socketUrl = apiBase;
const STORAGE_KEY = 'support_thread_id';

const visible = ref(false);
const threadId = ref<string | null>(null);
const mode = ref<'admin' | 'ai'>('admin');
const messages = ref<any[]>([]);
const input = ref('');
const loading = ref(false);
let socket: any = null;

const dialogStyle = computed(() => ({
  width: 'min(420px, 95vw)',
  height: 'min(560px, 80vh)',
}));

const userId = computed(() => (auth.data.value as any)?.user?._id);
const isAuthed = computed(() => !!userId.value);
const modeLabel = computed(() => (mode.value === 'ai' ? 'Đang chat AI' : 'Đang chat Admin'));

async function ensureThread() {
  if (!userId.value) throw new Error('Bạn cần đăng nhập để chat');
  if (!threadId.value && typeof localStorage !== 'undefined') {
    const cached = localStorage.getItem(STORAGE_KEY);
    if (cached) threadId.value = cached;
  }
  if (threadId.value) return threadId.value;
  loading.value = true;
  try {
    const { data } = await useFetch(`${apiBase}${apiPrefix}/support/threads`, {
      method: 'POST',
      body: { userId: userId.value, mode: mode.value },
      headers: { 'Content-Type': 'application/json' },
    });
    threadId.value = (data.value as any)?.threadId;
    mode.value = (data.value as any)?.mode || 'admin';
    if (threadId.value && typeof localStorage !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, threadId.value);
    }
    return threadId.value;
  } finally {
    loading.value = false;
  }
}

async function loadMessages(id: string) {
  const { data } = await useFetch(`${apiBase}${apiPrefix}/support/threads/${id}/messages`);
  messages.value = (data.value as any[]) || [];
}

function bindSocketEvents(id: string) {
  socket.on('connect', () => socket.emit('support:join', { threadId: id }));
  socket.on('support:message', (msg: any) => {
    if (msg.thread_id === id) messages.value = [...messages.value, msg];
  });
  socket.on('support:mode', (payload: any) => {
    if (payload?.threadId === id && payload.mode) mode.value = payload.mode;
  });
}

function connectSocket(id: string) {
  if (socket) return;
  socket = io(socketUrl, { transports: ['websocket'], withCredentials: true });
  bindSocketEvents(id);
}

async function initChat() {
  if (!isAuthed.value) return;
  const id = await ensureThread();
  if (!id) return;
  await loadMessages(id);
  connectSocket(id);
}

watch(threadId, async (id) => {
  if (!id) return;
  await loadMessages(id);
  connectSocket(id);
});

watch(
  () => isAuthed.value,
  (loggedIn) => {
    if (!loggedIn) {
      threadId.value = null;
      messages.value = [];
      if (typeof localStorage !== 'undefined') {
        localStorage.removeItem(STORAGE_KEY);
      }
      if (socket) {
        socket.disconnect();
        socket = null;
      }
    }
  }
);

async function sendMessage() {
  const text = input.value.trim();
  if (!text || !isAuthed.value) return;
  if (!threadId.value) await initChat();
  if (!threadId.value) return;
  if (!socket) connectSocket(threadId.value);
  socket.emit('support:message', {
    threadId: threadId.value,
    senderRole: 'user',
    text,
    mode: mode.value,
  });
  input.value = '';
}

function setMode(next: 'admin' | 'ai') {
  mode.value = next;
  if (!threadId.value || !socket) return;
  socket.emit('support:mode', { threadId: threadId.value, mode: mode.value });
}

function toggleChat() {
  visible.value = !visible.value;
  if (visible.value) initChat();
}

onBeforeUnmount(() => {
  if (socket) socket.disconnect();
});
</script>

<template>
  <div class="support-widget">
    <Button class="support-toggle" icon="pi pi-comments" @click="toggleChat" aria-label="Chat hỗ trợ" />

    <Dialog
      v-model:visible="visible"
      :modal="false"
      :blockScroll="false"
      position="bottomright"
      :pt="{ header: { class: 'hidden' }, content: { style: 'padding:0; background:#fff;' } }"
      :style="dialogStyle"
      :breakpoints="{ '960px': '92vw', '640px': '100vw' }"
      class="messenger-shell"
    >
      <div class="messenger-frame">
        <div class="messenger-header">
          <div class="header-left">
            <Button class="header-close" icon="pi pi-minus" text rounded @click="toggleChat" />
            <div>
              <div class="title">Hỗ trợ</div>
              <div class="subtitle">{{ modeLabel }}</div>
            </div>
          </div>
          <div class="header-mode">
            <Button
              :severity="mode === 'admin' ? 'primary' : 'secondary'"
              size="small"
              label="Chat Admin"
              icon="pi pi-user"
              @click="() => setMode('admin')"
            />
            <Button
              :severity="mode === 'ai' ? 'primary' : 'secondary'"
              size="small"
              label="Chat AI"
              icon="pi pi-robot"
              @click="() => setMode('ai')"
            />
          </div>
        </div>

        <div v-if="!isAuthed" class="p-4 text-sm text-gray-200">
          Vui lòng đăng nhập để trò chuyện với hỗ trợ.
        </div>
        <template v-else>
          <div class="messenger-body">
            <ScrollPanel style="height: 380px">
              <div class="msg-list">
                <div
                  v-for="m in messages"
                  :key="m._id"
                  class="msg-item"
                  :class="{
                    mine: m.sender_role === 'user',
                    ai: m.sender_role === 'ai',
                  }"
                >
                  <div class="bubble">
                    <div class="text">{{ m.text }}</div>
                    <div class="time">
                      {{ new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }}
                    </div>
                  </div>
                </div>
              </div>
            </ScrollPanel>
          </div>
          <div class="messenger-input">
            <Textarea
              v-model="input"
              autoResize
              rows="2"
              class="flex-1"
              placeholder="Nhập tin nhắn..."
            />
            <Button
              icon="pi pi-send"
              rounded
              :disabled="!input.trim() || loading"
              @click="sendMessage"
            />
          </div>
        </template>
      </div>
    </Dialog>
  </div>
</template>

<style scoped>
.support-widget {
  position: fixed;
  right: 16px;
  bottom: 16px;
  z-index: 2000;
}
.support-toggle {
  border-radius: 999px;
}
.messenger-shell :deep(.p-dialog) {
  border-radius: 100;
  overflow: visible;
  background: transparent;
  box-shadow: none;
  border: none;
}
.messenger-shell :deep(.p-dialog-header) {
  display: none;
  padding: 0;
  margin: 0;
  border: 0;
}
.messenger-shell :deep(.p-dialog-content) {
  padding: 0;
  border-radius: 14px;
  overflow: visible;
  background: transparent;
  border: none;
  box-shadow: none;
}
.messenger-frame {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: #ffffff;
  border-radius: 14px;
  overflow: hidden; 
  isolation: isolate; 
  border: 1px solid #e5e7eb;
  box-shadow: 0 12px 30px rgba(15, 23, 42, 0.08);
  position: relative;
  z-index: 1;
}
.messenger-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 12px;
  background: #f8fafc;
  color: #0f172a;
  border-bottom: 1px solid #e5e7eb;
}
.header-left {
  display: flex;
  align-items: center;
  gap: 10px;
}
.header-close {
  color: #475569;
}
.messenger-header .title {
  font-weight: 700;
  font-size: 15px;
}
.messenger-header .subtitle {
  font-size: 12px;
  opacity: 0.7;
  color: #475569;
}
.header-mode {
  display: flex;
  gap: 6px;
}
.messenger-body {
  padding: 12px;
  flex: 1;
  background: #ffffff;
}
.msg-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding-right: 6px;
}
.msg-item {
  display: flex;
}
.msg-item.mine {
  justify-content: flex-end;
}
.msg-item.ai {
  justify-content: flex-start;
}
.msg-item .bubble {
  max-width: 80%;
  padding: 10px 12px;
  border-radius: 18px;
  background: #f4f5f7;
  color: #0f172a;
  border: 1px solid #e5e7eb;
  box-shadow: 0 8px 24px rgba(15, 23, 42, 0.06);
}
.msg-item.mine .bubble {
  background: #e8f5e9;
  color: #0f172a;
  border-color: #c9e7d3;
}
.msg-item.ai .bubble {
  background: #e8ecff;
  border-color: #cdd5ff;
}
.bubble .time {
  margin-top: 6px;
  font-size: 11px;
  opacity: 0.8;
  text-align: right;
  color: #475569;
}
.bubble .text {
  white-space: pre-wrap;
  word-break: break-word;
  font-size: 14px;
}
.messenger-input {
  display: flex;
  gap: 8px;
  padding: 12px;
  border-top: 1px solid #e5e7eb;
  background: #f8fafc;
}
.messenger-input :deep(.p-inputtext) {
  border-radius: 14px;
  min-height: 64px;
  background: #fff;
  color: #0f172a;
  border: 1px solid #e5e7eb;
}
</style>
