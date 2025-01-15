const fs = require('fs');
const dicomService = require('../service/dicom.service');
const code = require('../constant/code');
const { iopcDicom } = require('./dicom.controller');

jest
  .spyOn(fs, 'writeFile')
  .mockImplementation((url, data, callback) => callback(null));

jest.mock('../service/dicom.service', () => ({
  getDicomData: jest.fn(),
  saveDicomFrames: jest.fn(),
  getFirstFrame: jest.fn(),
}));

const mockResponse = () => {
  const res = {};
  res.writeHead = jest.fn().mockReturnValue(res);
  res.end = jest.fn().mockReturnValue(res);
  return res;
};

const mockRequest = (fileBuffer, fileName) => ({
  file: { buffer: fileBuffer },
  query: { file_name: fileName },
});

describe('iopcDicom', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should process a valid DICOM file and return the first frame as a JPEG image', async () => {
    const mockDicomFile = Buffer.from('mock-dicom-file');
    const mockDicomData = {
      string: jest.fn((tag) => `mock-${tag}`),
    };
    const mockPixelData = { vr: 'OW', fragments: ['fragment1'] };
    const mockMetaData = {};

    dicomService.getDicomData.mockResolvedValue({
      dicomData: mockDicomData,
      dicomPixelData: mockPixelData,
      metaData: mockMetaData,
    });

    dicomService.saveDicomFrames.mockResolvedValue();
    dicomService.getFirstFrame.mockResolvedValue('mock-first-frame-image');

    const req = mockRequest(mockDicomFile, 'test');
    const res = mockResponse();

    await iopcDicom(req, res);

    expect(dicomService.getDicomData).toHaveBeenCalledWith(mockDicomFile);
    expect(dicomService.saveDicomFrames).toHaveBeenCalledWith(
      mockDicomData,
      mockPixelData,
      mockMetaData,
      'test'
    );
    expect(dicomService.getFirstFrame).toHaveBeenCalledWith(
      mockDicomData,
      mockPixelData
    );
    expect(res.writeHead).toHaveBeenCalledWith(200, {
      'Content-Type': 'image/jpeg',
    });
    expect(res.end).toHaveBeenCalledWith('mock-first-frame-image', 'binary');
  });

  it('should return an error if no DICOM file is provided', async () => {
    const req = mockRequest(null, 'test');
    const res = mockResponse();

    await expect(iopcDicom(req, res)).rejects.toEqual({
      code: code.ERROR_INVALID_REQUEST.code,
      message: 'Invalid DICOM File',
    });
  });

  it('should return an error if DICOM pixel data is unsupported', async () => {
    const mockDicomFile = Buffer.from('mock-dicom-file');
    const mockDicomData = {};
    const mockPixelData = { vr: 'UNSUPPORTED' };

    dicomService.getDicomData.mockResolvedValue({
      dicomData: mockDicomData,
      dicomPixelData: mockPixelData,
      metaData: {},
    });

    const req = mockRequest(mockDicomFile, 'test');
    const res = mockResponse();

    await expect(iopcDicom(req, res)).rejects.toEqual({
      code: code.ERROR_INTERNAL_SERVER.code,
      message: { message: code.ERROR_INTERNAL_SERVER.message },
    });
  });
});
