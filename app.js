const express = require('express');
const { MongoClient, ObjectId } = require('mongodb');

const app = express();
const port = 3000;
const url = 'mongodb://localhost:27017';
const dbName = '\'myCompassDatabase\'';
let db;

app.use(express.urlencoded({ extended: true }));
app.set('view engine', 'ejs');

MongoClient.connect(url, { useNewUrlParser: true, useUnifiedTopology: true }, (err, client) => {
  if (err) return console.log(err);
  db = client.db(dbName);
  app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
  });
});

app.get('/', (req, res) => {
  res.render('form');
});

app.post('/submit-form', (req, res) => {
  db.collection('examples').insertOne(req.body, (err, result) => {
    if (err) {
      res.status(500).send(err);
    } else {
      // Переадресация пользователя на страницу с подробностями документа
      res.redirect(/details/${result.insertedId});
    }
  });
});

app.get('/details/:id', (req, res) => {
  const id = req.params.id;

  db.collection('examples').findOne({ _id: new ObjectId(id) }, (err, document) => {
    if (err) {
      res.status(500).send('Error retrieving data from database');
    } else if (document) {
      res.render('details', { formData: document });
    } else {
      res.status(404).send('Document not found');
    }
  });
});