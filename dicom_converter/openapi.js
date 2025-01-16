const swaggerJsDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

// Swagger definition
const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'Node.js API Documentation',
    version: '1.0.0',
    description: 'This is the API documentation for the Node.js application',
    contact: {
      name: 'Developer Name',
      email: 'developer@example.com',
    },
  },
  servers: [
    {
      url: 'http://localhost:3001',
    },
  ],
};

// Options for swagger-jsdoc
const options = {
  swaggerDefinition,
  apis: ['./routes/*.js'],
};

// Initialize swagger-jsdoc
const swaggerSpec = swaggerJsDoc(options);

module.exports = {
  swaggerUi,
  swaggerSpec,
};
