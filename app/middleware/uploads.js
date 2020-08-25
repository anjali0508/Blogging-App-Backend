const multer = require("multer");
const path = require("path");

const storage = multer.diskStorage({
  destination: function(req, file, callback) {
    callback(null, "public/images/");
  },
  filename: function(req, file, callback) {
    let filename =
      file.fieldname + "-" + Date.now() + path.extname(file.originalname);
    let image_path = "http://10.0.2.0:3000/static/images/" + filename;
    req.image_path = image_path;
    callback(null, filename);
  }
});

const upload = multer({ storage: storage });

module.exports = upload;
