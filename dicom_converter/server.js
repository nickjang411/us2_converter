const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const dicomController = require('./src/controller/dicom.controller');
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });
const swaggerUi = require('swagger-ui-express');
const swaggerJsDoc = require('swagger-jsdoc');

require('dotenv').config();

const PORT = process.env.PORT || 3001;

app.use(bodyParser.raw({ type: 'application/octet-stream', limit: '10mb' }));
app.use(express.json());

//================================================================================
// Swagger definition
//================================================================================
const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'us2_converter API Documentation',
    version: '1.0.0',
    description: 'API documentation for the DICOM service',
  },
  servers: [
    {
      url: `http://localhost:${PORT}`,
    },
  ],
  components: {
    schemas: {
      DicomFile: {
        type: 'object',
        properties: {
          fileName: { type: 'string', example: 'dicom-image.dcm' },
        },
      },
    },
  },
};

const swaggerOptions = {
  swaggerDefinition,
  apis: [__filename], // Current file for API annotations
};

const swaggerSpec = swaggerJsDoc(swaggerOptions);

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
//================================================================================

//================================================================================
// Endpoints
//================================================================================
/**
 * @swagger
 * /iopc/dicom:
 *   post:
 *     summary: Upload a DICOM file
 *     description: Upload a DICOM file for processing
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: The DICOM file to upload
 *     responses:
 *       200:
 *         description: Successfully processed
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "File processed successfully"
 *       400:
 *         description: Bad request
 */
app.post('/iopc/dicom', upload.single('file'), dicomController.iopcDicom);
//================================================================================

process.on('unhandledRejection', (reason, p) => {
  console.log('Unhandled Rejection at:', p, 'reason:', reason);
});

const server = app.listen(PORT, (err) => {
  if (err) {
    return console.error(err);
  }
  console.log(`Server running on: http://localhost:${PORT}`);
});
