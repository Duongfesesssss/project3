<script setup lang="ts">
definePageMeta({ layout: 'cms-default' });

import Textarea from 'primevue/textarea';
import { SupportService } from '~/packages/base/services/support.service';
import { io } from 'socket.io-client';

const home = ref({ icon: 'pi pi-home', route: '/cms' });
const items = ref([{ label: 'Hỗ trợ' }, { label: 'Hội thoại' }]);
const runtimeConfig = useRuntimeConfig();
const socketUrl = runtimeConfig.public.apiBase;

const threads = ref<any[]>([]);
const selectedId = ref<string | null>(null);
const selectedRow = ref<any | null>(null);
let poll: ReturnType<typeof setInterval> | null = null;
const loading = ref(false);
const loadingMessages = ref(false);
const messagesError = ref<string | null>(null);
const messages = ref<any[]>([]);
const lastRawMessages = ref<any>(null);
const input = ref('');
const mode = ref<'admin' | 'ai'>('admin');
const sending = ref(false);
const messageBox = ref<HTMLElement | null>(null);
let socket: any = null;
let currentRoom: string | null = null;

function normalizeMessages(payload: any): any[] {
  if (typeof payload === 'string') {
    try {
      const parsed = JSON.parse(payload);
      return normalizeMessages(parsed);
    } catch (e) {
      console.warn('parse message payload failed', e);
    }
  }
  if (!payload) return [];
  if (payload.data?.messages) return payload.data.messages;
  if (payload.messages) return payload.messages;
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload.data)) return payload.data;
  return [];
}

function getMessageText(m: any): string {
  return m?.text ?? m?.message ?? m?.content ?? '';
}

function getMessageTime(m: any): string {
  const ts = m?.createdAt || m?.created_at || m?.created;
  return ts ? new Date(ts).toLocaleTimeString() : '';
}

function scrollToBottom() {
  nextTick(() => {
    if (messageBox.value) messageBox.value.scrollTop = messageBox.value.scrollHeight;
  });
}

const selectedThread = computed(() => threads.value.find((t) => t._id === selectedId.value) || selectedRow.value);

async function fetchThreads() {
  loading.value = true;
  try {
    const res = await SupportService.listThreads();
    const raw = ((res as any[]) || [])
      .slice()
      .sort((a, b) => new Date(b.last_message_at).getTime() - new Date(a.last_message_at).getTime());

    // Gộp theo user_id, giữ thread cập nhật mới nhất
    const deduped = new Map<string, any>();
    for (const t of raw) {
      const userKey = t?.user_id?._id || t?.user_id;
      if (!userKey) continue;
      if (!deduped.has(String(userKey))) deduped.set(String(userKey), t);
    }
    threads.value = Array.from(deduped.values());

    if (threads.value.length > 0) {
      const exists = threads.value.some((t) => t._id === selectedId.value);
      if (!selectedId.value || !exists) {
        const firstId = threads.value[0]._id;
        selectedId.value = firstId;
        selectedRow.value = threads.value[0];
        messages.value = [];
      }
    } else {
      selectedId.value = null;
      selectedRow.value = null;
    }
  } finally {
    loading.value = false;
  }
}

async function selectThread(id: string) {
  if (!id) return;
  selectedId.value = id;
  const found = threads.value.find((t) => t._id === id) || selectedRow.value;
  selectedRow.value = found;
  mode.value = found?.current_mode || 'admin';
  messages.value = [];
}

async function loadMessages(id: string) {
  loadingMessages.value = true;
  messagesError.value = null;
  try {
    const res = await SupportService.getMessages(id);
    console.log('messages payload', res);
    lastRawMessages.value = res;
    messages.value = normalizeMessages(res);
    scrollToBottom();
  } catch (err: any) {
    console.error('loadMessages error', err);
    messagesError.value = 'Không tải được tin nhắn. Thử lại.';
  } finally {
    loadingMessages.value = false;
  }
}

function connectSocket() {
  if (socket) return;
  socket = io(socketUrl, { transports: ['websocket'], withCredentials: true });

  socket.on('connect', () => {
    messagesError.value = null;
    if (currentRoom) socket.emit('support:join', { threadId: currentRoom });
  });

  socket.on('connect_error', (err: any) => {
    messagesError.value = 'Không kết nối được realtime. Vui lòng thử lại hoặc kiểm tra API base.';
    console.error('socket connect_error', err);
  });

  socket.on('support:message', (msg: any) => {
    if (msg.thread_id === currentRoom) {
      // loại bỏ bản tạm nếu nội dung trùng
      messages.value = [
        ...messages.value.filter(
          (m) => !(m._id?.toString().startsWith('temp-') && m.text === msg.text && m.sender_role === msg.sender_role)
        ),
        msg,
      ];
      scrollToBottom();
    }
  });

}

function changeMode(next: 'admin' | 'ai') {
  mode.value = next;
  if (!currentRoom) return;
  connectSocket();
  if (socket && !socket.connected) socket.connect();
  socket.emit('support:mode', { threadId: currentRoom, mode: next });
}

function joinRoom(id: string) {
  connectSocket();
  if (currentRoom === id) return;
  currentRoom = id;
  if (socket && !socket.connected) socket.connect();
  socket?.emit('support:join', { threadId: id });
}

watch(
  () => selectedId.value,
  async (id) => {
    if (!id) {
      messages.value = [];
      currentRoom = null;
      return;
    }
    messages.value = [];
    await loadMessages(id);
    joinRoom(id);
  }
);

async function sendMessage() {
  const text = input.value.trim();
  if (!text || !selectedId.value) return;
  connectSocket();
  if (socket && !socket.connected) socket.connect();
  joinRoom(selectedId.value);

  const tempId = `temp-${Date.now()}`;
  const temp = {
    _id: tempId,
    thread_id: selectedId.value,
    sender_role: 'admin',
    text,
    mode: mode.value,
    createdAt: new Date().toISOString(),
  } as any;

  messages.value = [...messages.value, temp];
  input.value = '';
  sending.value = true;
  messagesError.value = null;

  const ackTimeout = setTimeout(() => {
    sending.value = false;
    messagesError.value = 'Không nhận được phản hồi từ server. Thử lại.';
    messages.value = messages.value.filter((m) => m._id !== tempId);
  }, 6000);

  socket.emit(
    'support:message',
    {
      threadId: selectedId.value,
      senderRole: 'admin',
      text,
      mode: mode.value,
    },
    async (ack: any) => {
      clearTimeout(ackTimeout);
      sending.value = false;
      if (ack?.error) {
        messagesError.value = 'Gửi tin nhắn thất bại.';
        messages.value = messages.value.filter((m) => m._id !== tempId);
        console.error('support:message ack error', ack.error);
        return;
      }

      // làm mới từ server để đồng bộ UI và đảm bảo user nhận được
      if (selectedId.value) await loadMessages(selectedId.value);
      scrollToBottom();
    }
  );
}

watch(
  () => messages.value.length,
  () => scrollToBottom()
);

onMounted(() => {
  fetchThreads();
  poll = setInterval(fetchThreads, 5000);
});

onBeforeUnmount(() => {
  if (poll) clearInterval(poll);
  if (socket) socket.disconnect();
});
</script>

<template>
  <div class="space-y-4">
    <ToolBar class="mb-2">
      <template #start>
        <Breadcrumb :home="home" :model="items" />
      </template>
    </ToolBar>

    <div class="grid grid-cols-12 gap-4">
      <div class="col-span-5">
        <DataTable
          :value="threads"
          dataKey="_id"
          selectionMode="single"
          v-model:selection="selectedRow"
          @rowSelect="(e) => selectThread(e.data._id)"
          @rowClick="(e) => selectThread(e.data._id)"
          @selection-change="(e) => e.value?._id && selectThread(e.value._id)"
          :loading="loading"
          tableStyle="min-width: 100%"
          class="shadow-sm"
        >
          <template #header>
            <div class="flex items-center justify-between text-sm px-2 py-1">
              <div class="flex flex-col">
                <span>Danh sách hội thoại</span>
                <span class="text-xs text-gray-500">Bấm vào dòng hoặc nút Chat để mở</span>
              </div>
              <span class="text-gray-500">{{ threads.length }}</span>
            </div>
          </template>

          <Column field="user_id" header="User" style="width: 30%">
            <template #body="{ data }">
              <div class="flex flex-col text-xs">
                <span class="font-medium truncate" :title="data.user_id?._id || data.user_id">
                  {{ data.user_id?._id || data.user_id }}
                </span>
                <span v-if="data.user_id?.email" class="text-gray-500 truncate" :title="data.user_id.email">
                  {{ data.user_id.email }}
                </span>
              </div>
            </template>
          </Column>

          <Column field="status" header="Trạng thái" style="width: 15%">
            <template #body="{ data }">
              <Tag :value="data.status" :severity="data.status === 'open' ? 'success' : 'secondary'" />
            </template>
          </Column>

          <Column field="current_mode" header="Mode" style="width: 15%">
            <template #body="{ data }">
              <Tag :value="data.current_mode" :severity="data.current_mode === 'ai' ? 'info' : 'primary'" />
            </template>
          </Column>

          <Column field="last_message_at" header="Cập nhật" style="width: 25%">
            <template #body="{ data }">
              <span class="text-xs text-gray-600">{{ new Date(data.last_message_at).toLocaleString() }}</span>
            </template>
          </Column>

          <Column header="#" style="width: 15%">
            <template #body="{ data }">
              <Button label="Chat" size="small" text @click.stop="selectThread(data._id)" />
            </template>
          </Column>

          <template #empty>
            <div class="p-4 text-sm text-gray-500">Chưa có hội thoại nào</div>
          </template>
        </DataTable>
      </div>

      <div class="col-span-7">
        <Card class="h-full">
          <template #title>
            <div class="flex items-center justify-between">
              <div class="flex flex-col">
                <span v-if="selectedThread" class="font-semibold">
                  {{ selectedThread.user_id?.email || selectedThread.user_id || 'Người dùng' }}
                </span>
                <span v-else class="text-gray-500 text-sm">Chọn một hội thoại</span>
              </div>
              <div v-if="selectedThread" class="flex gap-2 text-xs items-center">
                <span class="text-gray-500">Chế độ:</span>
                <Button
                  size="small"
                  :severity="mode === 'admin' ? 'primary' : 'secondary'"
                  label="Admin"
                  @click="() => changeMode('admin')"
                />
                <Button
                  size="small"
                  :severity="mode === 'ai' ? 'primary' : 'secondary'"
                  label="AI"
                  @click="() => changeMode('ai')"
                />
              </div>
            </div>
          </template>

          <template #content>
            <div class="flex flex-col gap-3 h-[75vh]">
              <div v-if="selectedThread" class="flex flex-col gap-3 h-full">
                <div class="flex items-center justify-end text-xs text-gray-500 px-1">
                  <span>Tin nhắn: {{ messages.length }}</span>
                </div>

                <div ref="messageBox" class="flex-1 min-h-[320px] overflow-auto border rounded-md p-3 bg-gray-50">
                  <div v-if="loadingMessages" class="text-sm text-gray-500">Đang tải tin nhắn...</div>
                  <div v-if="messagesError" class="text-sm text-red-600">{{ messagesError }}</div>
                  <div v-if="!loadingMessages && !messagesError && !messages.length" class="text-sm text-gray-500">
                    Chưa có tin nhắn trong hội thoại này.
                  </div>
                  <div v-if="messages.length" class="text-xs text-gray-500 mb-2">
                    Đã tải {{ messages.length }} tin nhắn
                  </div>
                  <div
                    v-for="m in messages"
                    :key="m._id"
                    class="mb-3 flex"
                    :class="{
                      'justify-end': m.sender_role === 'admin',
                      'justify-start': m.sender_role !== 'admin',
                    }"
                  >
                    <div
                      class="max-w-[80%] rounded-lg p-2 shadow-sm"
                      :class="{
                        'bg-blue-50 border border-blue-100 text-blue-900': m.sender_role === 'admin',
                        'bg-gray-100 text-gray-800': m.sender_role === 'user',
                        'bg-indigo-50 text-indigo-900': m.sender_role === 'ai',
                      }"
                    >
                      <div class="text-xs flex justify-between text-gray-500 mb-1">
                        <span class="capitalize">{{ m.sender_role }}</span>
                        <span>{{ getMessageTime(m) }}</span>
                      </div>
                      <div class="text-sm whitespace-pre-wrap break-words">{{ getMessageText(m) }}</div>
                    </div>
                  </div>
                  <div v-if="!messages.length" class="text-sm text-gray-500">Chưa có tin nhắn</div>
                </div>
                <div class="flex gap-2 items-start pt-1 bg-white p-2 border rounded-md shadow-sm">
                  <Textarea
                    v-model="input"
                    autoResize
                    rows="2"
                    class="flex-1"
                    placeholder="Nhập trả lời..."
                  />
                  <Button
                    icon="pi pi-send"
                    :disabled="!input.trim() || sending"
                    :loading="sending"
                    @click="sendMessage"
                  />
                </div>
              </div>

              <div v-else class="text-sm text-gray-500">Chọn một hội thoại để bắt đầu chat</div>
            </div>
          </template>
        </Card>
      </div>
    </div>
  </div>
</template>
