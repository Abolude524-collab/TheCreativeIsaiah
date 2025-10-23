const multer = require('multer');
const path = require('path');

// ensure uploads directory exists
const uploadsDir = path.join(__dirname, '../uploads');
if (!require('fs').existsSync(uploadsDir)) {
  require('fs').mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    // sanitize filename to avoid problematic characters
    const safeName = file.originalname.replace(/[^a-z0-9.\-\_]/gi, '_');
    cb(null, Date.now() + '-' + safeName);
  }
});

const upload = multer({ storage });

module.exports = upload;
