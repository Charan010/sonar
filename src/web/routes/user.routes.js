const express = require("express");
const router = express.Router();

const {
  getUserImages,
  deleteImage,
} = require("../services/user.service");

//TO-DO: hardcoded value needs to be removed.
const USER = "Charan010";

router.get("/images", async (req, res) => {
  try {
    const images = await getUserImages(USER);
    res.json({ images });
  } catch (err) {
    console.error("Fetch images error:", err);
    res.status(500).json({ error: "Failed to fetch images" });
  }
  
});

router.delete("/image/:name", async (req, res) => {
  try {
    await deleteImage(USER, req.params.name);
    res.json({ success: true });
  } catch (err) {
    console.error("Delete error:", err);
    res.status(500).json({ error: "Delete failed" });
  }
});

module.exports = router;