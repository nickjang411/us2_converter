const express = require("express");
const app = express();
const fs = require("fs");
const path = require("path");
const cors = require("cors");
const bodyParser = require("body-parser");
const dicomController = require("./src/controller/dicom.controller");
const multer = require("multer");
const upload = multer({ storage: multer.memoryStorage() });

require("dotenv").config();

app.use(bodyParser.raw({ type: "application/octet-stream", limit: "10mb" }));
app.use(express.json());

app.post("/iopc/dicom", upload.single("file"), dicomController.iopcDicom);

process.on("unhandledRejection", (reason, p) => {
  console.log("Unhandled Rejection at:", p, "reason:", reason);
});

const PORT = 3001;
const server = app.listen(PORT, (err) => {
  if (err) {
    return console.error(err);
  }
  console.log(`Server running on: http://localhost:${PORT}`);
});
