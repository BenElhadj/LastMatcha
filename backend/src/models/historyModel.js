const db = require('../utility/database')


// INSERT Into history [visits]

const insertHistory = (user_id, id) => {
	let request = `INSERT INTO history (visitor, visited) VALUES (?, ?)`
	return db.query(request, [user_id, id])
}

/// Get Visitore History 

const getVisitors = (user_id) => {
	let request = `SELECT
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
				history.visited = ?
			AND
				images.profile = 1`
	return db.query(request, [user_id])
}

// Get visited History 

const getVisited = (user_id) => {
	let request = `SELECT
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
				history.visitor = ?
			AND 
				images.profile = 1`
	return db.query(request, [user_id])
}

const getAllHistory = async (id) => {
	// Créez un tableau pour stocker les résultats de chaque sous-requête
	const results = [];
	// Requête pour les notifications
	let queryNotifications = `
	  SELECT
		id_from AS id_from,
		id_to AS id_to,
		CASE
			WHEN type = 'visit' AND id_to = ${id} THEN 'he_visit'
			WHEN type = 'visit' AND id_from = ${id} THEN 'you_visit'
			WHEN type = 'like' AND id_to = ${id} THEN 'he_like'
			WHEN type = 'like' AND id_from = ${id} THEN 'you_like'
			WHEN type = 'like_back' AND id_to = ${id} THEN 'he_like_back'
			WHEN type = 'like_back' AND id_from = ${id} THEN 'you_like_back'
			WHEN type = 'unlike' AND id_to = ${id} THEN 'he_unlike'
			WHEN type = 'unlike' AND id_from = ${id} THEN 'you_unlike'
			ELSE type
		END AS type,
		0 AS profile,
		0 AS cover,
		created_at AS created_at,
		(SELECT name FROM images WHERE user_id != ${id} AND (user_id = id_from OR user_id = id_to) AND profile = 1 LIMIT 1) AS avatar,
		(SELECT u.username FROM users u WHERE u.id = CASE WHEN id_from = ${id} THEN id_to ELSE id_from END) AS username,
		(SELECT u.first_name FROM users u WHERE u.id = CASE WHEN id_from = ${id} THEN id_to ELSE id_from END) AS first_name,
		(SELECT u.last_name FROM users u WHERE u.id = CASE WHEN id_from = ${id} THEN id_to ELSE id_from END) AS last_name
	  FROM notifications
	  WHERE id_from = ${id} OR id_to = ${id}
	`;
	let notifications = await db.query(queryNotifications);
	results.push(notifications);
	// Requête pour les conversations
	queryConversations = `
	  SELECT
		CASE
			WHEN id_user1 = ${id} THEN id_user2
			ELSE id_user1
		END AS user_id,
		'talk' AS type,
		0 AS profile,
		0 AS cover,
		last_update AS created_at,
		(SELECT name FROM images WHERE user_id != ${id} AND ((user_id = id_user1 AND user_id != id_user2) OR (user_id = id_user2 AND user_id != id_user1)) AND profile = 1 LIMIT 1) AS avatar,
		(SELECT u.username FROM users u WHERE u.id = CASE WHEN id_user1 = ${id} THEN id_user2 ELSE id_user1 END) AS username,
		(SELECT u.first_name FROM users u WHERE u.id = CASE WHEN id_user1 = ${id} THEN id_user2 ELSE id_user1 END) AS first_name,
		(SELECT u.last_name FROM users u WHERE u.id = CASE WHEN id_user1 = ${id} THEN id_user2 ELSE id_user1 END) AS last_name
	  FROM conversations
	  WHERE id_user1 = ${id} OR id_user2 = ${id}
	`;
	let conversations = await db.query(queryConversations);
	results.push(conversations);
	// Requête pour les éléments bloqués
	queryBlocked = `
	  SELECT
		CASE
			WHEN blocker = ${id} THEN blocked
			ELSE blocker
		END AS user_id,
		CASE
			WHEN blocker = ${id} THEN 'you_block'
			ELSE 'he_block'
		END AS type,
		0 AS profile,
		0 AS cover,
		created_at AS created_at,
		(SELECT name FROM images WHERE user_id != ${id} AND (user_id = blocker OR user_id = blocked) AND profile = 1 LIMIT 1) AS avatar,
		(SELECT u.username FROM users u WHERE u.id = CASE WHEN blocker = ${id} THEN blocked ELSE blocker END) AS username,
		(SELECT u.first_name FROM users u WHERE u.id = CASE WHEN blocker = ${id} THEN blocked ELSE blocker END) AS first_name,
		(SELECT u.last_name FROM users u WHERE u.id = CASE WHEN blocker = ${id} THEN blocked ELSE blocker END) AS last_name
	  FROM blocked
	  WHERE blocker = ${id} OR blocked = ${id}
	`;
	let blocked = await db.query(queryBlocked);
	results.push(blocked);
	// Requête pour les images
	queryImages = `
	  SELECT
		user_id AS id_from,
		user_id AS id_to,
		'image' AS type,
		profile AS profile,
		cover AS cover,
		created_at AS created_at,
		(SELECT name FROM images WHERE user_id = user_id AND profile = 1 LIMIT 1) AS avatar,
		(SELECT u.username FROM users u WHERE u.id = user_id) AS username,
		(SELECT u.first_name FROM users u WHERE u.id = user_id) AS first_name,
		(SELECT u.last_name FROM users u WHERE u.id = user_id) AS last_name
	  FROM images
	  WHERE user_id = ${id}
	`;
	let images = await db.query(queryImages);
	results.push(images);
	// Concaténez tous les résultats en un seul tableau
	const allResults = results.reduce((acc, result) => acc.concat(result), []);
	// Triez le tableau résultant par la date de création (created_at)
	allResults.sort((a, b) => b.created_at - a.created_at);
	return allResults;
};
  

module.exports = {
	insertHistory,
	getVisitors,
	getVisited,
	getAllHistory
}