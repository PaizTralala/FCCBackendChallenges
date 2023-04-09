const express = require("express");
const app = express();

let PORT = 5555 || process.env.PORT;

const cors = require("cors");
app.use(cors({ optionsSuccessStatus: 200 })); // some legacy browsers choke on 204

app.use(express.static("public"));

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/views/index.html");
});

// This mean that the user does not input anything
app.get("/api", (req, res) => {
  res.json({ unix: new Date().getTime(), utc: new Date().toUTCString() });
});

app.get("/api/:date", (req, res) => {
  const dateString = req.params.date;
  let date;

  if (isNaN(dateString)) {
    date = new Date(dateString);
  } else {
    date = new Date(parseInt(dateString));
  }

  if (isNaN(date.getTime())) {
    return res.json({ error: "Invalid date" });
  } else {
    res.json({ unix: date.getTime(), utc: date.toUTCString() });
  }
});

const listener = app.listen(PORT, () => {
  console.log("Your app is listening on port " + listener.address().port);
});
