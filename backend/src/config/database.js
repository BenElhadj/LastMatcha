// Utilise le pool et les fonctions de startbdd.js au lieu de créer une nouvelle connexion
const { pool, query } = require('../utility/startbdd');

module.exports = {
  query,
  getClient: () => pool.connect(),
  pool
};