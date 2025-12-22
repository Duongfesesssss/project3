const SupportThread = require('../models/supportThreadModel');
const SupportMessage = require('../models/supportMessageModel');
const { generateSupportReply } = require('../services/ai/geminiService');

function aiFallback(userText) {
  if (!userText) return 'Mình chưa nhận được câu hỏi, bạn có thể mô tả rõ hơn không?';
  if (userText.length < 20) return 'Mình đã ghi nhận, bạn cho thêm chi tiết nhé.';
  return 'Mình đang ghi nhận yêu cầu của bạn. Nhân viên sẽ hỗ trợ sớm, bạn muốn ưu tiên chủ đề nào trước?';
}

function setupSupportSocket(io) {
  io.on('connection', (socket) => {
    socket.on('support:join', ({ threadId }) => {
      if (!threadId) return;
      socket.join(String(threadId));
    });

    socket.on('support:mode', async ({ threadId, mode }) => {
      if (!threadId || !['admin', 'ai'].includes(mode)) return;
      await SupportThread.findByIdAndUpdate(threadId, { current_mode: mode });
      io.to(String(threadId)).emit('support:mode', { threadId, mode });
    });

    socket.on('support:message', async (payload, ack) => {
      try {
        const { threadId, senderRole, senderId, text, mode } = payload || {};
        if (!threadId || !senderRole || !text) return ack?.({ error: 'missing fields' });

        const message = await SupportMessage.create({
          thread_id: threadId,
          sender_role: senderRole,
          sender_id: senderId,
          text,
          mode: mode || 'admin',
        });

        await SupportThread.findByIdAndUpdate(threadId, { last_message_at: new Date(), current_mode: mode || 'admin' });

        const safe = {
          _id: message._id,
          thread_id: message.thread_id,
          sender_role: message.sender_role,
          sender_id: message.sender_id,
          text: message.text,
          mode: message.mode,
          createdAt: message.createdAt,
        };

        io.to(String(threadId)).emit('support:message', safe);
        ack?.({ ok: true });

        if ((mode || 'admin') === 'ai' && senderRole !== 'ai') {
          let aiText;
          try {
            aiText = await generateSupportReply(text);
          } catch (err) {
            console.error('Gemini error, fallback:', err.message);
            aiText = aiFallback(text);
          }

          const aiMsg = await SupportMessage.create({
            thread_id: threadId,
            sender_role: 'ai',
            text: aiText,
            mode: 'ai',
          });
          io.to(String(threadId)).emit('support:message', {
            _id: aiMsg._id,
            thread_id: aiMsg.thread_id,
            sender_role: aiMsg.sender_role,
            text: aiMsg.text,
            mode: 'ai',
            createdAt: aiMsg.createdAt,
          });
        }
      } catch (err) {
        console.error('support:message error', err);
        ack?.({ error: 'failed' });
      }
    });
  });
}

module.exports = { setupSupportSocket };
