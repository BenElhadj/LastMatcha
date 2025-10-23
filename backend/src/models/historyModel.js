const db = require('../config/database')


// INSERT Into history [visits]

const insertHistory = async (user_id, id) => {
    const query = `INSERT INTO history (visitor, visited) VALUES ($1, $2)`;
    await db.query(query, [user_id, id]);
}

/// Get Visitore History 

const getVisitors = async (user_id) => {
	const query = `SELECT
			history.visitor as visitor_id,
			history.created_at as visit_date,
			users.username as username,
			images.name as profile_image
		FROM history
			INNER JOIN users 
			ON 
				history.visitor = users.id
			INNER JOIN images
			ON 
				history.visitor = images.user_id
			WHERE 
				history.visited = $1
			AND
				images.profile = TRUE`;
    const result = await db.query(query, [user_id]);
    return result.rows;
}

// Get visited History 

const getVisited = async (user_id) => {
	const query = `SELECT
			history.visited as visited_id,
			history.created_at as visit_date,
			users.username as username,
			images.name as profile_image
		FROM history
			INNER JOIN users 
			ON 
				history.visited = users.id
			INNER JOIN images
			ON 
				history.visited = images.user_id
			WHERE 
				history.visitor = $1
			AND 
				images.profile = TRUE`;
    const result = await db.query(query, [user_id]);
    return result.rows;
}

module.exports = {
    insertHistory,
    getVisitors,
    getVisited
}