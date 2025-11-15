// QR code generator for check-in tokens
const qrcode = require('qrcode');

const generateQR = async (text) => {
  try {
    return await qrcode.toDataURL(text);
  } catch (err) {
    console.error('QR Generation error:', err);
    throw err;
  }
};

module.exports = { generateQR };