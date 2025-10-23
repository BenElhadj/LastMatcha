const db = require('../config/database')

const getAllTags = async () => {
    const query = `SELECT value FROM tags`
    const result = await db.query(query)
    return result.rows
}

const getTags = async () => {
    const query = `SELECT value FROM tags`;
    try {
        const result = await db.query(query);
        return result.rows;
    } catch (err) {
        console.error('[tagsModel.getTags] SQL error:', err);
        throw err;
    }
}

const insertTags = async (tag) => {
    const query = `INSERT INTO tags (value) VALUES ($1) ON CONFLICT DO NOTHING`
    const result = await db.query(query, [tag])
    return result.rowCount > 0
}

module.exports = {
    getTags,
    getAllTags,
    insertTags
}