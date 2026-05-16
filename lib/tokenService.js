const jwt = require('jsonwebtoken');

class TokenService {
  constructor() {
    this.secret = process.env.JWT_SECRET || 'your-super-secret-jwt-key';
    this.pdfTokenExpiry = parseInt(process.env.PDF_TOKEN_EXPIRY) || 10;
  }

  generatePdfToken(pdfId, userId = 'anonymous') {
    return jwt.sign(
      { pdfId, userId, type: 'pdf_access' },
      this.secret,
      { expiresIn: `${this.pdfTokenExpiry}m` }
    );
  }

  verifyPdfToken(token) {
    const decoded = jwt.verify(token, this.secret);
    if (decoded.type !== 'pdf_access') throw new Error('Invalid token type');
    return decoded;
  }

  generateApiToken(userId, role = 'user') {
    return jwt.sign(
      { userId, role, type: 'api_access' },
      this.secret,
      { expiresIn: '24h' }
    );
  }

  verifyApiToken(token) {
    const decoded = jwt.verify(token, this.secret);
    if (decoded.type !== 'api_access') throw new Error('Invalid token type');
    return decoded;
  }
}

module.exports = new TokenService();
