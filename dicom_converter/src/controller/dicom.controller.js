const hl7 = require("hl7-builder");

const fs = require("fs");

const code = require("../constant/code");
const dicomService = require("../service/dicom.service");

/**
 * Receive DICOM file and generate base64 images of each frames and save it in folders.
 * Saves all frame images into <PROJECT>/dicom folder.
 * Saves the converted DCM file into <PROJECT>/dicom folder.
 * Convert DICOM data into HL& format and save the HL7 file into <PROJECT>/dicom folder.
 * Returns first frame as JPG image.
 * @rawbody {binary} - {DICOM}
 * @return {binary} - {JPG}
 * @reference {DICOM Parser} - https://www.imaios.com/en/imaios-dicom-viewer
 * @reference {HL7 Parser} - https://freeonlineformatter.com/hl7-parser/run
 */
const iopcDicom = async (req, res) => {
  const { file_name } = req.query;
  console.log("file_name:", file_name);

  const dicomFile = req.file.buffer;
  if (!dicomFile) {
    throw {
      code: code.ERROR_INVALID_REQUEST.code,
      message: `Invalid DICOM File`,
    };
  }

  try {
    let {
      dicomData,
      dicomPixelData,
      metaData,
    } = await dicomService.getDicomData(dicomFile);

    if (
      !dicomPixelData ||
      (dicomPixelData.vr !== "OW" && dicomPixelData.vr !== "OB")
    ) {
      throw {
        code: code.ERROR_INTERNAL_SERVER.code,
        message: { message: "Conversion not supported" },
      };
    }
    try {
      await dicomService.saveDicomFrames(
        dicomData,
        dicomPixelData,
        metaData,
        file_name
      );
    } catch (e) {
      throw {
        code: code.ERROR_INTERNAL_SERVER.code,
        message: { message: e },
      };
    }
    try {
      saveFile(`../converted_files/${file_name}/${file_name}.dcm`, dicomFile);
      const hl7Message = await buildHL7Message(dicomData);
      saveFile(`../converted_files/${file_name}/${file_name}.hl7`, hl7Message);
    } catch (e) {
      throw {
        code: code.ERROR_INTERNAL_SERVER.code,
        message: { message: code.ERROR_INTERNAL_SERVER.message },
      };
    }
    try {
      const firstFrameImage = await dicomService.getFirstFrame(
        dicomData,
        dicomPixelData
      );
      res.writeHead(200, { "Content-Type": "image/jpeg" });
      res.end(firstFrameImage, "binary");
    } catch (e) {
      throw {
        code: code.ERROR_INTERNAL_SERVER.code,
        message: { message: e },
      };
    }
  } catch (e) {
    throw {
      code: code.ERROR_INTERNAL_SERVER.code,
      message: { message: code.ERROR_INTERNAL_SERVER.message },
    };
  }
};

/**
 * Save the file context data into the provided path.
 * @param {url} - {file path url}
 * @param {data} - {file context text}
 */
function saveFile(url, data) {
  fs.writeFile(url, data, (err) => {
    if (err) {
      console.error(err);
    } else {
      console.log(`${url} saved successfully`);
    }
  });
}

/**
 * Build HL7 Message from DICOM data converted via dicom-parser.
 * Build HL7 Message segments manually via hl7-builder.
 * @param {dicomData} - {DICOM}
 * @return {hl7Message} - {String}
 */
async function buildHL7Message(dicomData) {
  if (!dicomData) return "";
  try {
    const patientName = dicomData.string("x00100010");
    const patientId = dicomData.string("x00100020");
    const patientBirthDate = dicomData.string("x00100030");
    const patientSex = dicomData.string("x00100040");
    const patientAddress = dicomData.string("x00101040");
    const patientPhone = dicomData.string("x00102154");
    const referringPhysicianName = dicomData.string("x00800902");
    const referringPhysicianPhone = dicomData.string("x00800904");
    const studyDate = dicomData.string("x00080020");
    const studyDescription = dicomData.string("x00081030");
    const studyInstanceUid = dicomData.string("x0020000d");
    const seriesInstanceUid = dicomData.string("x0020000e");
    const sopInstanceUid = dicomData.string("x00080018");
    const nextOfKinName = dicomData.string("x00101010");
    const delimiters = {
      segment: "\n",
      field: "|",
      component: "^",
      subcomponent: "&",
      repetition: "~",
      escape: "\\",
    };

    const msg = new hl7.Message({
      delimiters,
      sendingApplication: "myapp",
      sendingFacility: "myfacility",
      receivingApplication: "destination",
      receivingFacility: "destination",
      messageType: "ORM^O01",
      messageEvent: "ORM^O01",
      processingId: "P",
      version: "2.5",
    });

    const pid = new hl7.Segment("PID");
    pid.set(2, patientId);
    pid.set(3, "");
    pid.set(5, patientName);
    pid.set(7, patientBirthDate);
    pid.set(8, patientSex);
    pid.set(11, patientAddress);
    pid.set(13, patientPhone);

    const pvi = new hl7.Segment("PVI");
    pvi.set(3, "dept");
    pvi.set(19, studyInstanceUid);
    pvi.set(44, seriesInstanceUid);

    const orc = new hl7.Segment("ORC");
    orc.set(1, "NW");
    orc.set(2, "1234");
    orc.set(3, studyInstanceUid);

    const obr = new hl7.Segment("OBR");
    obr.set(1, "1");
    obr.set(2, studyInstanceUid);
    obr.set(3, sopInstanceUid);
    obr.set(7, studyDate);
    obr.set(4, "");
    obr.set(5, studyDescription);

    const nk1 = new hl7.Segment("NK1");
    nk1.set(2, nextOfKinName);

    const rfp = new hl7.Segment("RFP");
    rfp.set(2, referringPhysicianName);
    rfp.set(4, referringPhysicianPhone);

    msg.add(pid);
    msg.add(pvi);
    msg.add(orc);
    msg.add(obr);
    msg.add(nk1);
    msg.add(rfp);
    return msg.toString();
  } catch (error) {
    throw {
      code: code.ERROR_INTERNAL_SERVER.code,
      message: { message: error },
    };
  }
}

module.exports = {
  iopcDicom,
};
