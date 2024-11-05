import { Router } from 'express';
import { setWebhookUrl } from '../services/webhook.js';
import logger from '../utils/logger.js';

const router = Router();

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
router.post('/', (req, res) => {
  try {
    const { url } = req.body;
    if (!url) {
      return res.status(400).json({ error: 'URL is required' });
    }
    setWebhookUrl(url);
    res.json({ success: true, message: 'Webhook URL updated' });
  } catch (error) {
    logger.error('Error setting webhook URL:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;