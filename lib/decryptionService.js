const crypto = require('crypto');

class DecryptionService {
  constructor() {
    this.key = Buffer.from(process.env.AES_KEY || '638udh3829162018', 'utf8');
    this.iv = Buffer.from(process.env.AES_IV || 'fedcba9876543210', 'utf8');
    this.algorithm = 'aes-128-cbc';
  }

  decrypt(encryptedText) {
    if (!encryptedText) throw new Error('No encrypted text provided');
    const encryptedBuffer = Buffer.from(encryptedText, 'base64');
    const decipher = crypto.createDecipheriv(this.algorithm, this.key, this.iv);
    let decrypted = decipher.update(encryptedBuffer);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    return decrypted.toString('utf8');
  }

  decryptPdfLink(item) {
    if (!item || !item.file_link) return null;
    if (item.file_link.startsWith('http')) return item.file_link;
    return this.decrypt(item.file_link);
  }

  isValidUrl(url) {
    try {
      const u = new URL(url);
      return u.protocol === 'http:' || u.protocol === 'https:';
    } catch { return false; }
  }
}

module.exports = new DecryptionService();
