"use strict";

const express = require("express");
const morgan = require("morgan");
const path = require("path");
const cors = require("cors");
const app = express();

app.use(cors());

app.use(
  morgan(
    ':remote-addr - :remote-user [:date[clf]] ":method :url HTTP/:http-version" :status :res[content-length] :response-time ms'
  )
);
app.use(express.static(path.resolve(__dirname, "..", "dist")));

app.get("*", (req, res) => {
  res.sendFile(path.resolve(__dirname, "..", "dist", "index.html"));
});

const PORT = process.env.PORT || 5174;

app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}!`);
});
