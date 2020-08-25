const express = require("express");
// const cors = require("cors");
const bodyParser = require("body-parser");

const userRoutes = require("./app/routes/users.routes");
const collectionRoutes = require("./app/routes/collections.routes");
const articleRoutes = require("./app/routes/articles.routes");
const followerRoutes = require("./app/routes/followers.routes");
const loginRoutes = require("./app/routes/login.routes");
const searchRoutes = require("./app/routes/search.routes");
const opinionRoutes = require("./app/routes/opinion.routes");

const upload = require("./app/middleware/uploads");
const auth = require("./app/middleware/auth");
const app = express();
// app.use(cors);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use("/static", express.static("public"));

app.get("/", (req, res) => {
  res.json({ message: "Welcome" });
});

app.route("/haha").get((req, res) => {
  res.send("you at haha");
});

app.route("/trial").post(auth, upload.single("test"), (req, res) => {
  // console.log(req.file.filename);
  console.log(req.body.lala);
  if (req.image_path) {
    console.log(req.image_path);
    // send image_url with update query.
    // if !req.image_url, use the data sent
  }

  res.send("ok");
});

loginRoutes(app);
userRoutes(app);
collectionRoutes(app);
articleRoutes(app);
followerRoutes(app);
searchRoutes(app);
opinionRoutes(app);


app.listen(3000, () => {
  console.log("Server is running on port 3000.");
});
