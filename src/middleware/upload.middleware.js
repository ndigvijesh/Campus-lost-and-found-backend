// middleware/upload.middleware.js
const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Support deployment standalone uploads folder or monorepo client uploads
const localClientUploads = path.resolve(__dirname, "../../../client/public/uploads");
const defaultServerUploads = path.resolve(__dirname, "../../uploads");

const uploadDir = process.env.UPLOAD_DIR || 
  (fs.existsSync(path.resolve(__dirname, "../../../client")) ? localClientUploads : defaultServerUploads);

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, unique + path.extname(file.originalname));
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    const allowed = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (allowed.includes(file.mimetype)) cb(null, true);
    else cb(new Error("Only .jpg, .jpeg, .png, .webp images are accepted"));
  },
});

module.exports = upload;