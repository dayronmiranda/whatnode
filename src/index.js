import express from 'express';
import swaggerUi from 'swagger-ui-express';
import swaggerJsdoc from 'swagger-jsdoc';
import cors from 'cors';
import { WhatsAppService } from './services/whatsapp.js';
import { swaggerConfig } from './config/swagger.js';
import webhookRoutes from './routes/webhook.js';
import messagesRouter from './routes/messages.js';
import groupsRouter from './routes/groups.js';
import logger from './utils/logger.js';

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Basic route for health check
app.get('/', (req, res) => {
  res.json({ status: 'API is running' });
});

// Swagger setup
const swaggerDocs = swaggerJsdoc(swaggerConfig);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// Initialize WhatsApp service
const whatsappService = new WhatsAppService();

// Routes setup
app.use('/webhook', webhookRoutes);

// Start server
const PORT = process.env.PORT || 3000;
const server = app.listen(PORT, '0.0.0.0', async () => {
  logger.info(`Server running on http://localhost:${PORT}`);
  logger.info(`API Documentation available at http://localhost:${PORT}/api-docs`);
  
  try {
    const client = await whatsappService.initialize();
    app.use('/messages', messagesRouter(client));
    app.use('/groups', groupsRouter(client));

    // QR code endpoint
    app.get('/qr', (req, res) => {
      const qrCode = whatsappService.getQRCode();
      if (!qrCode) {
        return res.status(404).json({ error: 'QR code not generated yet' });
      }
      res.json({ qr: qrCode });
    });
  } catch (error) {
    logger.error('Failed to start the application:', error);
    process.exit(1);
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  logger.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('SIGTERM received. Shutting down gracefully');
  await whatsappService.destroy();
  server.close(() => {
    logger.info('Server closed');
    process.exit(0);
  });
});

process.on('unhandledRejection', (error) => {
  logger.error('Unhandled rejection:', error);
});