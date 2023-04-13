require("dotenv").config();

const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require("cors");

const express = require("express");
const app = express();

app.use(cors());
app.use(express.static("public"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

mongoose.connect(process.env.MONGODB_URI);
mongoose.connection.on("connected", () => {
  console.log("Connected to database!");
});

const exerciseTracker = require("./schema/exerciseSchema");
const userTracker = require("./schema/userSchema");

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/views/index.html");
});

app.post("/api/users", async (req, res) => {
  const data = await userTracker.create({ username: req.body.username });

  res.json({ username: data.username, _id: data._id });
});

app.get("/api/users", async (req, res) => {
  const getAllData = await userTracker.find();

  res.json(getAllData);
});

app.post("/api/users/:_id/exercises", async (req, res) => {
  const userId = req.params._id;
  const { description } = req.body;

  const duration = parseInt(req.body.duration);
  const dateString = req.body.date;

  const getUser = await userTracker.findById(userId);
  if (!getUser) return res.json({ error: "No user found with that id!" });

  let date;
  if (!dateString) {
    date = new Date();
  } else if (isNaN(dateString)) {
    date = new Date(dateString);
  } else {
    date = new Date(parseInt(dateString));
  }

  if (isNaN(date.getTime())) {
    return res.json({ error: "Invalid date" });
  } else {
    const createData = await exerciseTracker.create({
      userId,
      date: date.toDateString(),
      duration,
      description,
    });

    return res.json({
      _id: getUser._id,
      username: getUser.username,
      date: date.toDateString(),
      duration,
      description,
    });
  }
});

app.get("/api/users/:_id/exercises", (req, res) => {
  res.redirect(`/api/users/${req.params._id}/logs`);
});

app.get("/api/users/:_id/logs", async (req, res) => {
  const userId = req.params._id;

  const from = req.query.from;
  const to = req.query.to;
  const limit = parseInt(req.query.limit) || 9999;

  const query = { userId };

  if (from && to) {
    query.date = { $gte: new Date(from), $lte: new Date(to) };
  } else if (from) {
    query.date = { $gte: new Date(from) };
  } else if (to) {
    query.date = { $lte: new Date(to) };
  }

  const getUser = await userTracker.findById(userId);
  if (!getUser) return res.json({ error: "No user found!" });

  let log = await exerciseTracker.find(query).limit(limit);
  if (!log) return res.json({ error: "No data found!" });

  res.json({
    _id: getUser._id,
    username: getUser.username,
    log: log.map((item) => {
      return {
        description: item.description,
        duration: item.duration,
        date: new Date(item.date).toDateString(),
      };
    }),
    count: log.length,
  });
});

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log("Your app is listening on port " + listener.address().port);
});
