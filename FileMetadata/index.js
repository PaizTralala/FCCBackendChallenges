require("dotenv").config();

const express = require("express");
const multer = require("multer");
const cors = require("cors");
const fs = require("fs");

const app = express();
const upload = multer({ dest: "uploads/" });

app.use(cors());
app.use("/public", express.static(process.cwd() + "/public"));

app.get("/", (req, res) => {
  res.sendFile(process.cwd() + "/views/index.html");
});

app.post("/api/fileanalyse", upload.single("upfile"), (req, res) => {
  const filePath = req.file.path;
  const stats = fs.statSync(filePath);

  const fileSizeInBytes = stats.size;
  const fileType = req.file.mimetype;
  const fileName = req.file.originalname;

  res.json({
    name: fileName,
    type: fileType,
    size: fileSizeInBytes,
  });
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log("Your app is listening on port " + port);
});
