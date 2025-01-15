const dicomParser = require('dicom-parser');
const fs = require('fs');
const path = require('path');

const code = require('../constant/code');

const getDicomData = async (dicomFile) => {
  try {
    let dicomData;
    try {
      dicomData = dicomParser.parseDicom(dicomFile);
    } catch (e) {
      throw {
        code: code.ERROR_INTERNAL_SERVER.code,
        message: { message: code.ERROR_INTERNAL_SERVER.message },
      };
    }
    const metaInfo = dicomData.elements.x00020000;
    const metaData = {
      studyDate: dicomData.string('x00080020'),
      studyTime: dicomData.string('x00080030'),
      patientName: dicomData.string('x00100010'),
      patientID: dicomData.string('x00100020'),
      modality: dicomData.string('x00080060'),
      manufacturer: dicomData.string('x00080070'),
      metaInfo,
    };

    return {
      dicomData: dicomData,
      dicomPixelData: dicomData.elements.x7fe00010,
      metaData: metaData,
    };
  } catch (e) {
    throw {
      code: code.ERROR_INTERNAL_SERVER.code,
      message: { message: code.ERROR_INTERNAL_SERVER.message },
    };
  }
};

const getFirstFrame = async (dicomData, dicomPixelData) => {
  try {
    return dicomParser.readEncapsulatedPixelDataFromFragments(
      dicomData,
      dicomPixelData,
      0,
      dicomPixelData.fragments.length
    );
  } catch (e) {
    throw {
      code: code.ERROR_INTERNAL_SERVER.code,
      message: { message: code.ERROR_INTERNAL_SERVER.message },
    };
  }
};

const saveDicomFrames = async (
  dicomData,
  dicomPixelData,
  metaData,
  file_name
) => {
  try {
    if (!dicomPixelData || !dicomPixelData.encapsulatedPixelData) {
      throw {
        code: code.ERROR_NOT_FOUND.code,
        message: { message: code.ERROR_NOT_FOUND.message },
      };
    }
    const directoryPath = `../converted_files/${file_name}`;
    fs.mkdirSync(directoryPath, { recursive: true });
    dicomPixelData.fragments.map((fragment, index) => {
      const filePath = path.join(directoryPath, `/image_${index}.jpg`);
      fs.writeFileSync(
        filePath,
        dicomParser.readEncapsulatedPixelDataFromFragments(
          dicomData,
          dicomPixelData,
          index,
          dicomPixelData.fragments.length - index - 1
        )
      );
    });
  } catch (e) {
    throw {
      code: code.ERROR_INTERNAL_SERVER.code,
      message: { message: code.ERROR_INTERNAL_SERVER.message },
    };
  }
};

module.exports = {
  getDicomData,
  getFirstFrame,
  saveDicomFrames,
};
