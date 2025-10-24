const db = require('../config/database')

const insertNotifVis = async (user_id, id) => {
    const query = `INSERT INTO notifications (type, id_from, id_to) VALUES ('visit', $1, $2)`
    await db.query(query, [user_id, id])
}

const insertNotif = async (type, user_id, id) => {
    const query = `INSERT INTO notifications (type, id_from, id_to) VALUES ($1, $2, $3)`
    await db.query(query, [type, user_id, id])
}

const delNotif = async (id, user_id) => {
    const query = `DELETE FROM notifications WHERE (id_from = $1 AND id_to = $2) OR (id_from = $2 AND id_to = $1)`
    await db.query(query, [id, user_id])
}

const insertNotifConv = async (type, id_from, id_to, id_conversation) => {
    const query = `INSERT INTO notifications (type, id_from, id_to, id_conversation) VALUES ($1, $2, $3, $4)`
    await db.query(query, [type, id_from, id_to, id_conversation])
}

const getNotif = async (id) => {
    const query = `SELECT notifications.id, notifications.id_from as id_from, notifications.created_at as date, notifications.is_read as is_read, notifications.type as type, users.username as username, images.name as profile_image, images.profile as profile, images.cover as cover FROM notifications INNER JOIN users ON notifications.id_from = users.id LEFT JOIN images ON notifications.id_from = images.user_id WHERE notifications.id_to = $1 AND users.id NOT IN (SELECT blocker FROM blocked WHERE blocked = $1 UNION SELECT blocked FROM blocked WHERE blocker = $1)`
    const result = await db.query(query, [id])
    return result.rows
}

const seenOneNotif = async (id_from, id_to) => {
    const query = `UPDATE notifications SET is_read = TRUE WHERE id_to = $1 AND id_from = $2`
    await db.query(query, [id_to, id_from])
}

const seenNotif = async (id) => {
    const query = `UPDATE notifications SET is_read = TRUE WHERE type != 'chat' AND id_to = $1`
    await db.query(query, [id])
}

const seenMsgNotif = async (conv_id, id_from) => {
    const query = `UPDATE notifications SET is_read = TRUE WHERE type = 'chat' AND id_conversation = $1 AND id_from != $2`
    await db.query(query, [conv_id, id_from])
}

module.exports = {
    insertNotifVis,
    insertNotif,
    delNotif,
    insertNotifConv,
    getNotif,
    seenOneNotif,
    seenNotif,
    seenMsgNotif
}
