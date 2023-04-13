require("dotenv").config();
const express = require("express");
const cors = require("cors");
const app = express();

const bodyParser = require("body-parser");
const mongoose = require("mongoose");

mongoose.connect(process.env.MONGODB_URI);
mongoose.connection.on("connected", () => {
  console.log("Connected to the database!");
});

const port = process.env.PORT || 3000;

const shortUrl = require("./schema/shortUrlSchema");

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cors());

app.use("/public", express.static(`${process.cwd()}/public`));

app.get("/", (req, res) => {
  res.sendFile(process.cwd() + "/views/index.html");
});

app.post("/api/shorturl", async (req, res) => {
  const URL = req.body.url;
  const checkURL =
    /^(http|https):\/\/[a-z0-9]+([\-\.]{1}[a-z0-9]+)*\.[a-z]{2,5}(:[0-9]{1,5})?(\/.*)?$/;

  if (checkURL.test(URL)) {
    const createShortURL = await shortUrl.create({ fullUrl: req.body.url });

    res.json({ original_url: req.body.url, short_url: createShortURL.shortUrl });
  } else {
    res.json({ error: "Invalid URL" });
  }
});

app.get("/api/shorturl/:id", async (req, res) => {
  const id = req.params.id;

  const found = await shortUrl.findOne({ shortUrl: id });
  res.redirect(found.fullUrl);
});

app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});
