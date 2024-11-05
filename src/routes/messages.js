import { Router } from 'express';
import pkg from 'whatsapp-web.js';
const { MessageMedia } = pkg;
import logger from '../utils/logger.js';

const router = Router();

export default function messagesRouter(whatsappClient) {
  /**
   * @swagger
   * /messages/send:
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
  router.post('/send', async (req, res) => {
    try {
      const { to, message } = req.body;
      if (!to || !message) {
        return res.status(400).json({ error: 'To and message are required' });
      }
      await whatsappClient.sendMessage(to, message);
      res.json({ success: true });
    } catch (error) {
      logger.error('Error sending message:', error);
      res.status(500).json({ error: error.message });
    }
  });

  /**
   * @swagger
   * /messages/media:
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
  router.post('/media', async (req, res) => {
    try {
      const { to, mediaUrl, caption } = req.body;
      if (!to || !mediaUrl) {
        return res.status(400).json({ error: 'To and mediaUrl are required' });
      }
      const media = await MessageMedia.fromUrl(mediaUrl);
      await whatsappClient.sendMessage(to, media, { caption });
      res.json({ success: true });
    } catch (error) {
      logger.error('Error sending media:', error);
      res.status(500).json({ error: error.message });
    }
  });

  /**
   * @swagger
   * /messages/react:
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
  router.post('/react', async (req, res) => {
    try {
      const { messageId, reaction } = req.body;
      if (!messageId || !reaction) {
        return res.status(400).json({ error: 'MessageId and reaction are required' });
      }
      const message = await whatsappClient.getMessageById(messageId);
      await message.react(reaction);
      res.json({ success: true });
    } catch (error) {
      logger.error('Error reacting to message:', error);
      res.status(500).json({ error: error.message });
    }
  });

  return router;
}