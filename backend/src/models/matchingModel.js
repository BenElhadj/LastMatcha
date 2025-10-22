const db = require('../config/database')

const getFollowing = async (user_id) => {
    const query = `SELECT matches.matched as matched_id, matches.created_at as match_date, users.username as username, images.name as profile_image, images.profile as profile FROM matches INNER JOIN users ON matches.matched = users.id LEFT JOIN images ON matches.matched = images.user_id WHERE matches.matcher = $1`
    const result = await db.query(query, [user_id])
    return result.rows
}

const getFollowers = async (user_id) => {
    const query = `SELECT matches.matcher as matcher_id, matches.created_at as match_date, users.username as username, images.name as profile_image, images.profile as profile FROM matches INNER JOIN users ON matches.matcher = users.id LEFT JOIN images ON matches.matcher = images.user_id WHERE matches.matched = $1`
    const result = await db.query(query, [user_id])
    return result.rows
}

const insertMatche = async (user1, user2) => {
    const query = `INSERT INTO matches (matcher, matched) VALUES ($1, $2)`
    await db.query(query, [user1, user2])
}

const delMatche = async (user_id, id) => {
    const query = `DELETE FROM matches WHERE (matcher = $1 AND matched = $2) OR (matcher = $2 AND matched = $1)`
    await db.query(query, [user_id, id])
}

const getMatche = async (user_id, id) => {
    const query = `SELECT * FROM matches WHERE matcher = $1 AND matched = $2`
    const result = await db.query(query, [user_id, id])
    return result.rows
}

module.exports = {
    getFollowing,
    getFollowers,
    insertMatche,
    delMatche,
    getMatche
}
