const express = require('express')
const path = require('path')
const cors = require('cors')
const multer = require('multer');
const PORT = process.env.PORT || 5000
const cloudinary = require('cloudinary')
const formidable = require('formidable'),
    http = require('http'),
    util = require('util');

cloudinary.config({ 
  cloud_name: 'hm408jhub', 
  api_key: '742975669727563', 
  api_secret: 'TFmxuP7UegKQ6yyF80qgIgoq6vg' 
});


let storage = multer.diskStorage({
  destination: function(req, file, cb) {
      cb(null, 'public/uploads');
   },
  filename: function (req, file, cb) {
      cb(null , file.originalname);
  }
});

const upload = multer({ storage: storage })

const { Pool } = require('pg');
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

const app = express();


app.use(cors()) 
app.use(express.static(path.join(__dirname, 'public')))
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'ejs')
app.get('/', (req, res) => res.render('pages/index'))
/*app.post('/upload',  async (req, res) => {
  
      console.log(res.json(req.file));
      console.log(req.body.data);
      console.log(req.files);
      cloudinary.uploader.upload(req.file.filename, function(result) { console.log(result) });
      const client = await pool.connect();
      const result = await client.query(`INSERT INTO images (image_title,image_size,image_path) VALUES (${req.body.title},${req.body.size},${req.file.path})`);
      client.release();
     
      console.error(err);

      
  
  
});*/

app.post("/upload", (req, res) => {
  try {
    const form = formidable({ multiples: true });
    form.parse(req, async (_, fields, files) => {
      console.log(fields);
      if (files) {
        console.log(files);
        const image = await cloudinary.uploader.upload(files.photo.path, {
          public_id: fields.title
        }, function(error,result) { console.log(result, error) });
        const client = await pool.connect();
        console.log(client);
        const result = await client.query(`INSERT INTO images (image_title,image_size,image_path) VALUES ("hello","goodbye","hotmail.com")`);
        client.release();
        console.log("img uploaded", image.secure_url);
        return res.json({ image: image.secure_url });
      }
    });
  } catch (err) {
    return res.json(err);
  }
});

app.listen(PORT, () => console.log(`Listening on ${ PORT }`))



//testing....



