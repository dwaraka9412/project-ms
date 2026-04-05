const express = require("express");
const router = express.Router();
const multer = require("multer");
const fs = require("fs");
const path = require("path");

/* ---------- Multer Storage Setup ---------- */

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },

  filename: function (req, file, cb) {
    const uniqueName = Date.now() + path.extname(file.originalname);
    cb(null, uniqueName);
  }
});

const upload = multer({ 
  storage: storage,
  fileFilter: (req, file, cb) => {

    const allowed = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "application/pdf"
    ];

    if(allowed.includes(file.mimetype)){
      cb(null, true);
    } else {
      cb(new Error("Only images and PDF allowed"));
    }

  }
});

/* ---------- Database Helpers ---------- */

function readDB() {
  return JSON.parse(fs.readFileSync("database.json"));
}

function writeDB(data) {
  fs.writeFileSync("database.json", JSON.stringify(data, null, 2));
}

/* ---------- Upload File ---------- */

router.post("/upload", upload.single("file"), (req, res) => {

  const db = readDB();

  const fileData = {
    id: Date.now(),
    filename: req.file.filename,
    originalname: req.file.originalname,
    uploader: req.body.email,
    password: req.body.password
  };

  db.files.push(fileData);

  writeDB(db);

  res.json({ message: "File uploaded successfully" });

});

/* ---------- List Files ---------- */

router.get("/list", (req, res) => {

  const db = readDB();

  res.json(db.files);

});

/* ---------- Open File ---------- */

router.post("/open", (req, res) => {

  const db = readDB();

  const { id, password } = req.body;

  const file = db.files.find(f => f.id == id);

  if (!file) {
    return res.status(404).json({ message: "File not found" });
  }

  if (file.password !== password) {
    return res.status(401).json({ message: "Wrong password" });
  }

  const filePath = `uploads/${file.filename}`;

  res.download(filePath, file.originalname);

});

/* ---------- Delete File ---------- */

router.delete("/delete/:id", (req, res) => {

  const db = readDB();

  const file = db.files.find(f => f.id == req.params.id);

  if (!file) {
    return res.status(404).json({ message: "File not found" });
  }

  if (file.uploader !== req.body.email) {
    return res.status(403).json({ message: "Only uploader can delete this file" });
  }

  fs.unlinkSync(`uploads/${file.filename}`);

  db.files = db.files.filter(f => f.id != req.params.id);

  writeDB(db);

  res.json({ message: "File deleted successfully" });

});
router.get("/preview/:id", (req, res) => {

  const db = readDB();

  const file = db.files.find(f => f.id == req.params.id);

  if (!file) {
    return res.status(404).json({ message: "File not found" });
  }

  const filePath = `uploads/${file.filename}`;

  res.sendFile(path.resolve(filePath));

});

module.exports = router;