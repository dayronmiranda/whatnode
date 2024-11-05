export const swaggerConfig = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'WhatsApp API Platform',
      version: '1.0.0',
      description: 'API platform for WhatsApp Web functionality'
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Local Development Server'
      }
    ],
    components: {
      schemas: {
        Message: {
          type: 'object',
          properties: {
            to: {
              type: 'string',
              description: 'Phone number in format: country code + number (e.g., 5219991234567)'
            },
            message: {
              type: 'string',
              description: 'Text message to send'
            }
          }
        },
        MediaMessage: {
          type: 'object',
          properties: {
            to: {
              type: 'string',
              description: 'Phone number in format: country code + number'
            },
            mediaUrl: {
              type: 'string',
              description: 'URL of the media to send'
            },
            caption: {
              type: 'string',
              description: 'Optional caption for the media'
            }
          }
        }
      }
    }
  },
  apis: ['./src/routes/*.js']
};