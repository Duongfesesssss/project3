<script setup lang="ts">
import { io } from 'socket.io-client';
import { SupportService } from '~/packages/base/services/support.service';

const runtimeConfig = useRuntimeConfig();
const apiBase = runtimeConfig.public.apiBase;
const socketUrl = apiBase;

const props = defineProps<{ threadId?: string }>();
const messages = ref<any[]>([]);
const input = ref('');
const mode = ref<'admin' | 'ai'>('admin');
let socket: any = null;
let currentRoom: string | null = null;

async function loadMessages(id: string) {
  const res = await SupportService.getMessages(id);
  messages.value = (res as any[]) || [];
}

function connectSocket() {
  if (socket) return;
  socket = io(socketUrl, { transports: ['websocket'], withCredentials: true });

  socket.on('connect', () => {
    if (currentRoom) socket.emit('support:join', { threadId: currentRoom });
  });

  socket.on('support:message', (msg: any) => {
    if (msg.thread_id === currentRoom) messages.value = [...messages.value, msg];
  });

  socket.on('support:mode', (payload: any) => {
    if (payload?.threadId === currentRoom && payload.mode) mode.value = payload.mode;
  });
}

function joinRoom(id: string) {
  if (!socket) connectSocket();
  if (currentRoom === id) return;
  currentRoom = id;
  socket?.emit('support:join', { threadId: id });
}

watch(
  () => props.threadId,
  async (id) => {
    if (!id) return;
    messages.value = [];
    await loadMessages(id);
    connectSocket();
    joinRoom(id);
  },
  { immediate: true }
);

async function sendMessage() {
  if (!props.threadId || !input.value.trim()) return;
  connectSocket();
  joinRoom(props.threadId);
  socket.emit('support:message', {
    threadId: props.threadId,
    senderRole: 'admin',
    text: input.value.trim(),
    mode: mode.value,
  });
  input.value = '';
}

function toggleMode() {
  if (!props.threadId || !socket) return;
  mode.value = mode.value === 'admin' ? 'ai' : 'admin';
  socket.emit('support:mode', { threadId: props.threadId, mode: mode.value });
}

onBeforeUnmount(() => {
  if (socket) socket.disconnect();
});
</script>

<template>
  <Card v-if="props.threadId">
    <template #title>
      <div class="flex items-center justify-between">
        <span>Thread: {{ props.threadId }}</span>
        <ToggleButton
          :checked="mode === 'ai'"
          onLabel="AI"
          offLabel="Admin"
          onIcon="pi pi-robot"
          offIcon="pi pi-user"
          @change="toggleMode"
        />
      </div>
    </template>
    <div class="mb-3" style="height: 360px; overflow: auto;">
      <div
        v-for="m in messages"
        :key="m._id"
        class="p-2 mb-2 border rounded-md"
        :class="{ 'bg-blue-50': m.sender_role === 'admin', 'bg-gray-50': m.sender_role === 'ai' }"
      >
        <div class="text-xs text-gray-500 flex justify-between">
          <span>{{ m.sender_role }}</span>
          <span>{{ new Date(m.createdAt).toLocaleTimeString() }}</span>
        </div>
        <div class="text-sm">{{ m.text }}</div>
      </div>
    </div>
    <div class="flex gap-2">
      <InputTextarea v-model="input" autoResize rows="2" class="flex-1" placeholder="Nhập trả lời..." />
      <Button icon="pi pi-send" :disabled="!input.trim()" @click="sendMessage" />
    </div>
  </Card>
  <div v-else class="text-sm text-gray-500">Chọn một hội thoại</div>
</template>
