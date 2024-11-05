import { Router } from 'express';
import logger from '../utils/logger.js';

const router = Router();

export default function groupsRouter(whatsappClient) {
  /**
   * @swagger
   * /groups/participants/add:
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
  router.post('/participants/add', async (req, res) => {
    try {
      const { groupId, participants } = req.body;
      if (!groupId || !participants || !participants.length) {
        return res.status(400).json({ error: 'GroupId and participants are required' });
      }
      const chat = await whatsappClient.getChatById(groupId);
      await chat.addParticipants(participants);
      res.json({ success: true });
    } catch (error) {
      logger.error('Error adding participants:', error);
      res.status(500).json({ error: error.message });
    }
  });

  return router;
}