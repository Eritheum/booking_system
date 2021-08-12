const express = require("express");
const app = express();

app.use(express.json());

app.get("/", (req, res, next) => {
  res.send("Hello World");
});

app.listen(8000);
console.log("grapql listenting on port: 8000");
