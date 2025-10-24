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
    // Requête UNION pour récupérer toutes les conversations où user1 est id_user1 ou id_user2
    const query = `
        SELECT
            u.id as user_id,
            c.id_conversation,
            c.last_update,
            u.username,
            u.first_name,
            u.last_name,
            u.status,
            i.name as profile_image,
            ch.message,
            ch.id_from as message_from,
            i.profile
        FROM conversations c
        INNER JOIN users u ON c.id_user2 = u.id
        LEFT JOIN images i ON c.id_user2 = i.user_id AND i.profile = TRUE::boolean
        LEFT JOIN chat ch ON c.last_msg = ch.id
        WHERE c.id_user1 = $1 AND c.allowed = TRUE
        UNION
        SELECT
            u.id as user_id,
            c.id_conversation,
            c.last_update,
            u.username,
            u.first_name,
            u.last_name,
            u.status,
            i.name as profile_image,
            ch.message,
            ch.id_from as message_from,
            i.profile
        FROM conversations c
        INNER JOIN users u ON c.id_user1 = u.id
        LEFT JOIN images i ON c.id_user1 = i.user_id AND i.profile = TRUE::boolean
        LEFT JOIN chat ch ON c.last_msg = ch.id
        WHERE c.id_user2 = $1 AND c.allowed = TRUE
    `;
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