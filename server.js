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

// affichage de la liste des légumes (sans doublon)
// PAR ORDRE ASCENDANT
app.get('/api/recoltes/vegetables/asc', (req, res) => {
  pool.query('SELECT DISTINCT vegetable FROM recolte ORDER BY vegetable ASC', (err, results) => {
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
// PAR ORDRE DESCENDANT
app.get('/api/recoltes/vegetables/desc', (req, res) => {
  pool.query('SELECT DISTINCT vegetable FROM recolte ORDER BY vegetable DESC', (err, results) => {
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
  pool.query('SELECT DISTINCT DATE_FORMAT(date, "%Y-%m-%d") date FROM recolte', (err, results) => {
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
// PAR ORDRE ASCENDANT
app.get('/api/recoltes/dates/asc', (req, res) => {
  pool.query('SELECT DISTINCT DATE_FORMAT(date, "%Y-%m-%d") date FROM recolte ORDER BY date ASC', (err, results) => {
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
// PAR ORDRE DESCENDANT
app.get('/api/recoltes/dates/desc', (req, res) => {
  pool.query('SELECT DISTINCT DATE_FORMAT(date, "%Y-%m-%d") date FROM recolte ORDER BY date DESC', (err, results) => {
    if (err) {
      res.status(500).json({
        error: err.message,
      });
    } else {
      res.json(results);
    }
  });
});

// route de recherche filtrée
app.get('/api/recoltes/search', (req, res) => {
  // initialisation des différents filtres
  let sql = 'SELECT * FROM recolte WHERE 1=1';
  const sqlValues = [];
  // contient une chaîne de caractères
  if (req.query.contains) {
    const researchForContains = `%${req.query.contains}%`;
    sql += ' AND vegetable LIKE ?';
    sqlValues.push(researchForContains);
  }
  // commence par une chaîne de caractères
  if (req.query.startswith) {
    const researchForStartswith = `${req.query.startswith}%`;
    sql += ' AND vegetable LIKE ?';
    sqlValues.push(researchForStartswith);
  }
  // filtre par date supérieure
  if (req.query.recoltedafter) {
    sql += ' AND date > ?';
    sqlValues.push(req.query.recoltedafter);
  }
  // lancement de la requête
  pool.query(sql, sqlValues, (err, results) => {
    if (err) {
      res.status(500).json({
        error: err.message,
      });
    } else if (results.length === 0) {
      res.status(404).send('Recolt not found');
    } else if (results.length === 1) {
      res.status(200).json(results[0]);
    } else {
      res.status(200).json(results);
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
