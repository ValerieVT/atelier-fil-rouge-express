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

// affichage de la liste des légumes (sans doublon)
app.get('/api/recoltes/vegetables', (req, res) => {
  pool.query('SELECT DISTINCT vegetable FROM recolte', (err, results) => {
    if (err) {
      res.status(500).json({
        error: err.message,
      });
    } else {
      res.json(results);
    }
  });
});

// affichage de la liste des dates de récolte (sans doublon)
app.get('/api/recoltes/dates', (req, res) => {
  pool.query('SELECT DISTINCT DATE_FORMAT(date, "%d-%m-%Y") date FROM recolte', (err, results) => {
    if (err) {
      res.status(500).json({
        error: err.message,
      });
    } else {
      res.json(results);
    }
  });
});

// affichage des légumes dont le nom contient les paramètres de la requête
app.get('/api/recoltes/vegetables/:vegetable', (req, res) => {
  const researchForVegetable = `%${req.params.vegetable}%`;
  pool.query('SELECT * FROM recolte WHERE vegetable LIKE ?', researchForVegetable, (err, results) => {
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
    console.log(`Server is listening on port ${process.env.PORT}`);
  }
});
