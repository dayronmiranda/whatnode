import axios from 'axios';
import logger from './logger.js';

let webhookUrl = null;

export function setWebhookUrl(url) {
  webhookUrl = url;
  logger.info(`Webhook URL set to: ${url}`);
}

export async function notifyWebhook(event, data) {
  if (!webhookUrl) return;

  try {
    await axios.post(webhookUrl, {
      event,
      data,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error notifying webhook:', error);
  }
}