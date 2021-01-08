const express = require('express');
const dotenv = require('dotenv');

dotenv.config();

const pool = require('./pool');

const app = express();
const port = process.env.PORT || 4000;

app.use(express.json());

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

// entrée d'une nouvelle récolte
app.post('/api/recoltes', (req, res) => {
  pool.query('INSERT INTO recolte (vegetable, date, overage, weight_in_gramms) VALUES (?, ?, ?, ?)', [req.body.vegetable, req.body.date, req.body.overage, req.body.weight_in_gramms], (err, results) => {
    if (err) {
      res.status(500).json({
        error: err.message,
      })
    } else {
      return pool.query('SELECT * FROM recolte WHERE id = ?', results.insertId, (err2, records) => {
        if (err2) {
          return res.status(500).json({
            error: err2.message,
            sql: err2.sql,
          });
        }
        const insertedRecolt = records[0];
        const host = req.get('host');
        const location = `http://${host}${req.url}/${insertedRecolt.id}`;
        return res
          .status(201)
          .set('Location', location)
          .json(insertedRecolt);
      });
    }
  });
});

// modification d'une récolte en BDD
app.put('/api/recoltes/:id', (req, res) => {
  pool.query(`
  UPDATE recolte SET ?
  WHERE id=?
  `, [req.body, req.params.id], (err, results) => {
    if (err) {
      res.status(500).json({
        error: err.message
      })
    } else if (results.length === 0) {
      res.status(401).send('Cet id n’est pas en base de données.');
    } else {
      return pool.query('SELECT * FROM recolte WHERE id = ?', req.params.id, (err2, results2) => {
        if (err2) {
          return res.status(500).json({
            error: err2.message,
            sql: err2.sql,
          });
        }
        const modifiedRecolt = results2[0];
        const host = req.get('host');
        const location = `http://${host}${req.url}/${modifiedRecolt.id}`;
        return res
          .status(201)
          .set('Location', location)
          .json(modifiedRecolt);
      });
    }
  });
});

// toggle du booléen d'une récolte déjà en en BDD
app.put('/api/recoltes/overages/:id', (req, res) => {
  pool.query('SELECT * FROM recolte WHERE id = ?', [req.params.id], (err, results) => {
    if (err) {
      res.status(500).json({
        error: err.message,
      });
    } else {
      const modifiedRecolt = results[0];
      let toggleOverage = modifiedRecolt.overage;
      if (toggleOverage === 1) {
        toggleOverage = 0;
      } else {
        toggleOverage = 1;
      }
      pool.query('UPDATE recolte SET overage=? WHERE id = ?', [toggleOverage, req.params.id], (err2) => {
        if (err2) {
          return res.status(500).json({
            error: err2.message,
            sql: err2.sql,
          });
        }
        return res.status(201).json(modifiedRecolt);
      });
    }
  });
});

// suppression d'une récolte en BDD
app.delete('/api/recoltes/:id', (req, res) => {
  pool.query('DELETE FROM recolte WHERE id=?', Number(req.params.id), (err) => {
    if (err) {
      res.status(500).json({
        error: err.message,
      });
    } else {
      res.status(200).send('Recolt is deleted.');
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
