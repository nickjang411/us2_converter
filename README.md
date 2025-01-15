# us2_converter

- Description: `Project repo for retrieving .dcm files from use.ai server and converting into images and .hl7 files`.
- Author: Nick Jang
- Created: 20250115

## dicom_converter

- Description: `Node.js server that can convert .dcm files into images and .hl7 file formats`.

## us2

- Description: `Python3 socket for retrieving and uploading .dcm file between us2.ai server`.

### Instructions

- Run dicom_converter server

```
  npm install
  npm start
```

- Python config

```
  pyenv global 3.8
  eval "\$(pyenv init --path)"
```

- Run in one terminal (leave it running):

```
  python3 ./receive.py
```

- Run in another terminal (while echoloader is running):

```
  python3 -m echoloader --config-file config.json
```

### DICOM Instructions

- Run dicom_converter server

```
  npm install
  npm start
```

- Run request with Postman

1. URL: POST http://localhost:3001/iopc/dicom?file_name=test1
2. Body --> form-data --> Key: file --> Type File --> + New file from local machine --> Upload .dcm file
3. Params --> Key: file_name --> Value: <example_file_name>
4. Click "Send"
5. Check that the the file example_file_name_0.jpg, example_file_name.dcm and example_file_name.hl7 is saved in converted_files directory

### Results

- The converted files with be stored in `converted_files` folder, with original .dcm file, converted images and .hl7 files.

### Tests
1. Go to /dicom_converter
```
npm install
npm run test
```

### Project Structure

```
us2_converter/
│
├── converted_files/                                # All the converted files
│   ├── test/                                       # The result of one conversion will be collected in this directory
│   │   ├── test_image_0.jpg/                       # Ultra sound image converted from DICOM file in JPG
│   │   ├── test.dcm/                               # Original DICOM file
│   │   ├── test.hl7/                               # Patient info HL7 file extracted from DICOM file
│   │
│   ├── dicom_converter/                            # DICOM converter source code
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
│       ├── README.md/                              # DICOM project documentation
│       └── server.js                               # Main server
│
├── us2/                                            # Project folder synched with https://us2.ai/
│   ├── past/                                       # History files folder
│   ├── upload/                                     # Uploaded files folder
│   └── receive.py/                                 # Main bi-directional server for handling files with external API
│
└── README.md               # Project documentation
```
