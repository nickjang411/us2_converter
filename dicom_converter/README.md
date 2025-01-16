## dicom_converter

- Description: `Node.js server that can convert .dcm files into images and .hl7 file formats`.

- Author: Nick Jang
- Created: 20250115

### Instructions

- Run dicom_converter server

```
  npm install
  npm start
```

### Project Structure
dicom_converter/                            # DICOM converter source code
│       ├── src/                                    # Source code of the main converter
│       │   ├── constant/                           # Constant values
│       │   |   ├── code.js/                        # Server error codes
│       │   ├── controller/                         # Controller API endpoints
│       │   |   ├── dicom.controller.js/            # Main DICOM converter endpoints
│       │   |   └── dicom.controller.test.js/       # Main DICOM converter endpoint tests
│       │   └── service/                            # Service utility functions
│       │       ├── dicom.service.js/               # Main DICOM converter functions
│       │       └── dicom.service.test.js/          # Main DICOM converter function tests
│       │
├── README.md/                              # DICOM project documentation
├── .env/                                   # Project environment variables
├── package.json/                           # NPM packages and libraries
├── openapi.js/                             # OpenAPI Configuration for swagger documentation
└── server.js                               # Main server
