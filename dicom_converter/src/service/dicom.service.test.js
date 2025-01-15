const fs = require('fs');
const path = require('path');
const dicomParser = require('dicom-parser');

jest.mock('fs');
jest.mock('dicom-parser', () => ({
  parseDicom: jest.fn(),
  readEncapsulatedPixelDataFromFragments: jest.fn(),
}));

const code = require('../constant/code');
const {
  getDicomData,
  getFirstFrame,
  saveDicomFrames,
} = require('./dicom.service');

describe('DICOM Utils', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getDicomData', () => {
    it('should parse DICOM file and return metadata', async () => {
      const mockDicomFile = Buffer.from('mock-dicom-file');
      const mockDicomData = {
        string: jest.fn((tag) => {
          const tags = {
            x00080020: '20250101',
            x00080030: '123456',
            x00100010: 'John Doe',
            x00100020: '12345',
            x00080060: 'US',
            x00080070: 'Manufacturer',
          };
          return tags[tag];
        }),
        elements: {
          x00020000: { metaInfo: 'meta-info' },
          x7fe00010: { fragments: ['fragment1'] },
        },
      };

      dicomParser.parseDicom.mockReturnValue(mockDicomData);

      const result = await getDicomData(mockDicomFile);

      expect(dicomParser.parseDicom).toHaveBeenCalledWith(mockDicomFile);
      expect(result.metaData).toEqual({
        studyDate: '20250101',
        studyTime: '123456',
        patientName: 'John Doe',
        patientID: '12345',
        modality: 'US',
        manufacturer: 'Manufacturer',
        metaInfo: { metaInfo: 'meta-info' },
      });
    });

    it('should throw an error if DICOM parsing fails', async () => {
      dicomParser.parseDicom.mockImplementation(() => {
        throw new Error('Parsing error');
      });

      await expect(
        getDicomData(Buffer.from('mock-dicom-file'))
      ).rejects.toEqual({
        code: code.ERROR_INTERNAL_SERVER.code,
        message: { message: code.ERROR_INTERNAL_SERVER.message },
      });
    });
  });

  describe('getFirstFrame', () => {
    it('should return the first frame of the DICOM pixel data', async () => {
      dicomParser.readEncapsulatedPixelDataFromFragments.mockReturnValue(
        'mock-frame-data'
      );

      const dicomData = {};
      const dicomPixelData = { fragments: ['fragment1', 'fragment2'] };
      const result = await getFirstFrame(dicomData, dicomPixelData);

      expect(
        dicomParser.readEncapsulatedPixelDataFromFragments
      ).toHaveBeenCalledWith(
        dicomData,
        dicomPixelData,
        0,
        dicomPixelData.fragments.length
      );
      expect(result).toBe('mock-frame-data');
    });

    it('should throw an error if frame extraction fails', async () => {
      dicomParser.readEncapsulatedPixelDataFromFragments.mockImplementation(
        () => {
          throw new Error('Frame extraction error');
        }
      );

      await expect(
        getFirstFrame({}, { fragments: ['fragment1', 'fragment2'] })
      ).rejects.toEqual({
        code: code.ERROR_INTERNAL_SERVER.code,
        message: { message: code.ERROR_INTERNAL_SERVER.message },
      });
    });
  });

  describe('saveDicomFrames', () => {
    it('should throw an error if DICOM pixel data is missing', async () => {
      await expect(saveDicomFrames({}, null, {}, 'test')).rejects.toEqual({
        code: code.ERROR_INTERNAL_SERVER.code,
        message: { message: code.ERROR_INTERNAL_SERVER.message },
      });
    });
  });
});
