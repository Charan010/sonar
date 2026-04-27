const express = require("express");
const router = express.Router();

const multer = require("multer");
const axios = require("axios");
const FormData = require("form-data");

const { saveImage } = require("../services/user.service");

const upload = multer({ storage: multer.memoryStorage() });

const USER = "Charan010";

// POST /upload
router.post("/", upload.single("image"), async (req, res) => {
  try {
    if (!req.file)
      return res.status(400).json({ error: "No file uploaded" });

    const form = new FormData();
    form.append("image", req.file.buffer, req.file.originalname);

    const response = await axios.post(
      "http://localhost:8000/upload",
      form,
      { headers: form.getHeaders() }
    );

    await saveImage({
      username: USER,
      name: req.file.originalname,
      buffer: req.file.buffer,
      mimeType: req.file.mimetype,

    });

    res.json(response.data);

  } catch (err) {
    console.error("Upload route error:", err.message);
    res.status(500).json({ error: "ML service failed" });
  }
});

module.exports = router;