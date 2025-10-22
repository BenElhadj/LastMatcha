const db = require('../config/database')

// Get conversation 

const getConv = async (user_id , id) => {
    const query = `SELECT * FROM conversations WHERE (id_user1 = $1 AND id_user2 = $2) OR (id_user2 = $1 AND id_user1 = $2)`;
    const result = await db.query(query, [user_id, id]);
    return result.rows;
}

// Insert new conv 

const insertConv = async (user1, user2) => {
    const query = `INSERT INTO conversations (id_user1, id_user2) VALUES ($1, $2) RETURNING *`;
    const result = await db.query(query, [user1, user2]);
    return result.rows[0];
}

// Set Conv Allowed 

const disallowConv = async (user_id, id) => {
    const query = `UPDATE conversations SET allowed = 0 WHERE (id_user1 = $1 AND id_user2 = $2) OR (id_user2 = $1 AND id_user1 = $2)`;
    await db.query(query, [user_id, id]);
}

// Set Conv unallowed 

const allowConv = async (conv_id) => {
    const query = `UPDATE conversations SET allowed = 1 WHERE id_conversation = $1`;
    await db.query(query, [conv_id]);
}


// DELETE conv 

const delConv = async (id1, id2) => {
    const query = `DELETE FROM chat WHERE id_conversation IN (SELECT id_conversation FROM conversations WHERE (id_user1 = $1 AND id_user2 = $2) OR (id_user1 = $2 AND id_user2 = $1))`;
    await db.query(query, [id1, id2]);
}

// get Chat for other users ((ALLLL ))

const getConvAll = async (user1) => {
    // La requête complexe d'origine peut être adaptée selon le schéma Postgres
    // Ici, on propose une version simplifiée
    const query = `SELECT * FROM conversations WHERE id_user1 = $1 AND allowed = 1`;
    const result = await db.query(query, [user1]);
    return result.rows;
}

module.exports = {
	getConv,
	insertConv,
	allowConv,
	disallowConv,
	delConv,
	getConvAll
}