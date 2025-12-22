const SupportThread = require('../models/supportThreadModel');
const SupportMessage = require('../models/supportMessageModel');

async function createThread(req, res) {
  try {
    const { userId, mode } = req.body;
    if (!userId) return res.status(400).json({ error: 'userId is required' });

    const thread = await SupportThread.create({ user_id: userId, current_mode: mode || 'admin' });
    return res.json({ threadId: thread._id, mode: thread.current_mode });
  } catch (err) {
    console.error('createThread error', err);
    return res.status(500).json({ error: 'Unable to create thread' });
  }
}

async function listThreads(req, res) {
  try {
    const { status } = req.query;
    const filter = {};
    if (status) filter.status = status;
    const threads = await SupportThread.find(filter)
      .sort({ last_message_at: -1 })
      .limit(50)
      .populate('user_id', 'email name')
      .lean();
    return res.json(threads);
  } catch (err) {
    console.error('listThreads error', err);
    return res.status(500).json({ error: 'Unable to list threads' });
  }
}

async function getMessages(req, res) {
  try {
    const { id } = req.params;
    const messages = await SupportMessage.find({ thread_id: id }).sort({ createdAt: 1 }).lean();
    return res.json(messages);
  } catch (err) {
    console.error('getMessages error', err);
    return res.status(500).json({ error: 'Unable to get messages' });
  }
}

module.exports = {
  createThread,
  listThreads,
  getMessages,
};
