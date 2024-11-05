import pkg from 'whatsapp-web.js';
const { MessageMedia } = pkg;
import logger from './logger.js';
import { setWebhookUrl } from './webhook.js';

export function setupRoutes(app, client) {
  /**
   * @swagger
   * /qr:
   *   get:
   *     summary: Get the current QR code for WhatsApp Web authentication
   *     responses:
   *       200:
   *         description: QR code data URL
   */
  app.get('/qr', (req, res) => {
    if (!global.qrCode) {
      return res.status(404).json({ error: 'QR code not generated yet' });
    }
    res.json({ qr: global.qrCode });
  });

  /**
   * @swagger
   * /webhook:
   *   post:
   *     summary: Set webhook URL for notifications
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               url:
   *                 type: string
   */
  app.post('/webhook', (req, res) => {
    const { url } = req.body;
    if (!url) {
      return res.status(400).json({ error: 'URL is required' });
    }
    setWebhookUrl(url);
    res.json({ success: true, message: 'Webhook URL updated' });
  });

  /**
   * @swagger
   * /send/message:
   *   post:
   *     summary: Send a text message
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               to:
   *                 type: string
   *               message:
   *                 type: string
   */
  app.post('/send/message', async (req, res) => {
    try {
      const { to, message } = req.body;
      if (!to || !message) {
        return res.status(400).json({ error: 'To and message are required' });
      }
      await client.sendMessage(to, message);
      res.json({ success: true });
    } catch (error) {
      logger.error('Error sending message:', error);
      res.status(500).json({ error: error.message });
    }
  });

  /**
   * @swagger
   * /send/media:
   *   post:
   *     summary: Send media (image, audio, document)
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               to:
   *                 type: string
   *               mediaUrl:
   *                 type: string
   *               caption:
   *                 type: string
   */
  app.post('/send/media', async (req, res) => {
    try {
      const { to, mediaUrl, caption } = req.body;
      if (!to || !mediaUrl) {
        return res.status(400).json({ error: 'To and mediaUrl are required' });
      }
      const media = await MessageMedia.fromUrl(mediaUrl);
      await client.sendMessage(to, media, { caption });
      res.json({ success: true });
    } catch (error) {
      logger.error('Error sending media:', error);
      res.status(500).json({ error: error.message });
    }
  });

  /**
   * @swagger
   * /group/participants/add:
   *   post:
   *     summary: Add participants to a group
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               groupId:
   *                 type: string
   *               participants:
   *                 type: array
   *                 items:
   *                   type: string
   */
  app.post('/group/participants/add', async (req, res) => {
    try {
      const { groupId, participants } = req.body;
      if (!groupId || !participants || !participants.length) {
        return res.status(400).json({ error: 'GroupId and participants are required' });
      }
      const chat = await client.getChatById(groupId);
      await chat.addParticipants(participants);
      res.json({ success: true });
    } catch (error) {
      logger.error('Error adding participants:', error);
      res.status(500).json({ error: error.message });
    }
  });

  /**
   * @swagger
   * /message/react:
   *   post:
   *     summary: React to a message
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               messageId:
   *                 type: string
   *               reaction:
   *                 type: string
   */
  app.post('/message/react', async (req, res) => {
    try {
      const { messageId, reaction } = req.body;
      if (!messageId || !reaction) {
        return res.status(400).json({ error: 'MessageId and reaction are required' });
      }
      const message = await client.getMessageById(messageId);
      await message.react(reaction);
      res.json({ success: true });
    } catch (error) {
      logger.error('Error reacting to message:', error);
      res.status(500).json({ error: error.message });
    }
  });
}