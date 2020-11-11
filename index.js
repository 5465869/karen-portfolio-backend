const express = require('express')
const path = require('path')
const cors = require('cors')
const multer = require('multer');
const PORT = process.env.PORT || 5000


let storage = multer.diskStorage({
  destination: function(req, file, cb) {
      cb(null, '/uploads/images');
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
app.post('/upload', upload.single('photo'), async (req, res) => {
  if(req.file) {
      res.json(req.file);
      console.log(req.body.email);
      try {
        const client = await pool.connect();
        const result = await client.query(`INSERT INTO images (image_title,image_size,image_path) VALUES (${req.body.title},${req.body.size},${req.file.path})`);
        client.release();
      } catch (err) {
        console.error(err);
        res.send("Error " + err);
      }
      
  }
  else throw 'error';
});
app.listen(PORT, () => console.log(`Listening on ${ PORT }`))


app.get('/db', async (req, res) => {
  try {
    const client = await pool.connect();
    const result = await client.query('SELECT * FROM test_table');
    res.send(result);
    client.release();
  } catch (err) {
    console.error(err);
    res.send("Error " + err);
  }
})




