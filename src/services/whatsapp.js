import pkg from 'whatsapp-web.js';
const { Client, LocalAuth } = pkg;
import qrcode from 'qrcode';
import { whatsappConfig, initializeBrowser } from '../config/whatsapp.js';
import { notifyWebhook } from './webhook.js';
import logger from '../utils/logger.js';

export class WhatsAppService {
  constructor() {
    this.client = null;
    this.qrCode = null;
  }

  async initialize() {
    try {
      const config = await initializeBrowser();
      this.client = new Client({
        authStrategy: new LocalAuth(),
        ...config
      });

      this.setupEventListeners();
      await this.client.initialize();
      return this.client;
    } catch (error) {
      logger.error('Failed to initialize WhatsApp client:', error);
      throw error;
    }
  }

  setupEventListeners() {
    this.client.on('qr', async (qr) => {
      try {
        this.qrCode = await qrcode.toDataURL(qr);
        notifyWebhook('qr_received', { qr: this.qrCode });
        logger.info('New QR code generated');
      } catch (error) {
        logger.error('Error generating QR code:', error);
      }
    });

    this.client.on('ready', () => {
      logger.info('Client is ready!');
      notifyWebhook('client_ready', { status: 'ready' });
    });

    this.client.on('message', async (message) => {
      try {
        await notifyWebhook('message_received', {
          from: message.from,
          body: message.body,
          timestamp: message.timestamp
        });
      } catch (error) {
        logger.error('Error processing message:', error);
      }
    });

    this.client.on('disconnected', (reason) => {
      logger.warn('Client was disconnected:', reason);
      notifyWebhook('client_disconnected', { reason });
    });

    this.client.on('auth_failure', (error) => {
      logger.error('Authentication failed:', error);
      notifyWebhook('auth_failure', { error: error.message });
    });
  }

  getQRCode() {
    return this.qrCode;
  }

  async destroy() {
    try {
      if (this.client) {
        await this.client.destroy();
        logger.info('WhatsApp client destroyed successfully');
      }
    } catch (error) {
      logger.error('Error destroying WhatsApp client:', error);
      throw error;
    }
  }
}