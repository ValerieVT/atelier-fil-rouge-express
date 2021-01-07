const express = require('express');
const dotenv = require('dotenv');

dotenv.config();

const pool = require('./pool');

const app = express();
const port = process.env.PORT || 4000;

app.get('/api/recoltes/', (req, res) => {
  pool.query('SELECT * FROM recolte', (err, results) => {
    if (err) {
      res.status(500).json({
        error: err.message,
      });
    } else {
      res.json(results);
    }
  });
});

app.listen(port, (err, res) => {
  if (err) {
    res.status(500).json({
      error: err.message,
    });
  } else {
    res.status(200).send(`Server is listening on port ${process.env.PORT}`);
  }
});
