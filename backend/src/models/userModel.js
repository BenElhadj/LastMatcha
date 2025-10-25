const db = require('../config/database')

// add user
const addUser = async (user) => {
    const query = `INSERT INTO users (first_name, last_name, username, email, password, vkey) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`;
    const values = [user.first_name, user.last_name, user.username, user.email, user.password, user.vkey];
    const result = await db.query(query, values);
    return result.rows[0];
}

// Get user by Username / email 
const getUser = async (user) => {
    const query = `SELECT email, username FROM users WHERE username = $1 OR email = $2`;
    const values = [user.username, user.email];
    const result = await db.query(query, values);
    return result.rows;
}

const getUserByemail = async (email) => {
    const query = `SELECT email, username FROM users WHERE email = $1`;
    const result = await db.query(query, [email]);
    return result.rows;
}

// GET USERS FOR Browsing
const getUserBrow = async () => {
    const query = `SELECT users.*, images.*, get_rating(users.id) AS rating FROM users JOIN images ON users.id = images.user_id WHERE images.profile = TRUE ORDER BY rating DESC`;
    const result = await db.query(query);
    return result.rows;
}

// GET User by id (browsing)
const getUserbyIdBrow = async (id, user_id) => {
    const query = `SELECT users.*, get_rating(users.id) AS rating FROM users WHERE id = $1 AND id NOT IN (SELECT blocked FROM blocked WHERE blocker = $2) AND $2 NOT IN (SELECT blocked FROM blocked WHERE blocker = $1)`;
    const result = await db.query(query, [id, user_id]);
    return result.rows;
}

// Check Verif key 
const getVkey = async (vkey) => {
    const query = `SELECT verified, id FROM users WHERE vkey = $1`;
    const result = await db.query(query, [vkey]);
    return result.rows;
}

// Add Reset password key [rkey] ---- Using Email
const addRkey = async (user) => {
    const query = `UPDATE users SET rkey = $1 WHERE email = $2`;
    const result = await db.query(query, [user.rkey, user.email]);
    return result.rowCount > 0;
}

// Check Reset password key [rkey]
const getRkey = async (rkey) => {
    const query = `SELECT id FROM users WHERE rkey = $1`;
    const result = await db.query(query, [rkey]);
    return result.rows;
}

// Update password [After forgotten Email]
const changeFrogottenPassword = async (user) => {
    const query = `UPDATE users SET password = $1, rkey = '' WHERE id = $2 AND rkey = $3`;
    const result = await db.query(query, [user.password, user.id, user.rkey]);
    return result.rowCount;
}

// Destroy password key [rkey] ---- Using Email
const destroyRkey = async (id) => {
    const query = `UPDATE users SET rkey = '' WHERE id = $1`;
    const result = await db.query(query, [id]);
    return result.rowCount;
}

// Validate an Email
const validateEmail = async (vkey) => {
    const query = `UPDATE users SET verified = TRUE, vkey = '' WHERE vkey = $1 AND verified = FALSE`;
    await db.query(query, [vkey]);
}

// Get user data by ID
const getUserById = async (id) => {
    const query = `SELECT * FROM users WHERE id = $1`;
    const result = await db.query(query, [id]);
    return result.rows;
}

const getUserByIdD = async (id) => {
    const query = `SELECT * FROM users WHERE id = $1`;
    const result = await db.query(query, [id]);
    return result.rows;
}

// Get user data by Username 
const getUserByUsername = async (username) => {
    const query = `SELECT * FROM users WHERE username = $1`;
    const result = await db.query(query, [username]);
    return result.rows;
}

// Get user by Username / email 
const getUserByIdentifier = async (identifier) => {
    const query = `SELECT * FROM users WHERE username = $1 OR email = $1`;
    const result = await db.query(query, [identifier]);
    return result.rows;
}

// Filling information for the 1st time 
const updateProfile = async (user) => {
    const query = `UPDATE users SET first_name = $1, last_name = $2, username = $3, email = $4, gender = $5, looking = $6, birthdate = $7, biography = $8, tags = $9, address = $10, city = $11, country = $12, postal_code = $13, phone = $14 WHERE id = $15`;
    const values = [user.first_name, user.last_name, user.username, user.email, user.gender, user.looking, user.birthdate, user.biography, user.tags, user.address, user.city, user.country, user.postal_code, user.phone, user.id];
    const result = await db.query(query, values);
    return result.rowCount;
}

// Update user Email 
const changeEmail = async (user) => {
    const query = `UPDATE users SET email = $1 WHERE id = $2`;
    const result = await db.query(query, [user.email, user.id]);
    return result.rowCount;
}

// Update Password 
const changePassword = async (user) => {
    const query = `UPDATE users SET password = $1 WHERE id = $2`;
    const result = await db.query(query, [user.password, user.id]);
    return result.rowCount;
}

// Get images
const getImages = async (id) => {
    const query = `SELECT * FROM images WHERE user_id = $1 AND cover = 0`;
    const result = await db.query(query, [id]);
    return result.rows;
}

// Get image By Id
const getImagesById = async (id, user_id) => {
    const query = `SELECT * FROM images WHERE id = $1 AND user_id = $2`;
    const result = await db.query(query, [id, user_id]);
    return result.rows;
}

// Get image by userid
const getImagesByUid = async (user_id) => {
    const query = `SELECT * FROM images WHERE user_id = $1`;
    const result = await db.query(query, [user_id]);
    return result.rows;
}

// Add images 
const insertImages = async (user) => {
    // Par défaut, image de galerie (profile=0, cover=0)
    const query = `INSERT INTO images (user_id, name, profile, cover) VALUES ($1, $2, 0, 0) RETURNING *`;
    const result = await db.query(query, [user.id, user.imgName]);
    return result.rows[0];
}

// Update profile pic to 0
const updateProfilePic = async (id) => {
    const query = `UPDATE images SET profile = 0 WHERE user_id = $1`;
    await db.query(query, [id]);
}

// Get cover photo
const getCover = async (id) => {
    const query = `SELECT * FROM images WHERE cover = 1 AND user_id = $1`;
    const result = await db.query(query, [id]);
    return result.rows;
}

// Delete cover photo 
const delCover = async (id, user_id) => {
    const query = `DELETE FROM images WHERE id = $1 AND user_id = $2`;
    await db.query(query, [id, user_id]);
}

// INSERT Cover photo
const insertCover = async (user_id, imgName) => {
    const query = `INSERT INTO images (user_id, name, cover) VALUES ($1, $2, 1) RETURNING *`;
    const result = await db.query(query, [user_id, imgName]);
    return result.rows[0];
}

// DELETE images 
const delImage = async (id, user_id) => {
    const query = `DELETE FROM images WHERE id = $1 AND user_id = $2`;
    const result = await db.query(query, [id, user_id]);
    return result.rowCount;
}

// Set profile pic To 1 and Cover to 0
const setImages = async (user_id) => {
    const query = `UPDATE images SET profile = 1 WHERE user_id = $1 AND cover = 0`;
    await db.query(query, [user_id]);
}

// get Blocked  users 
const getBlocked = async (id) => {
    const query = `SELECT blocked.blocked AS blocked_id, users.username AS username, users.first_name AS first_name, users.last_name AS last_name, users.gender AS gender, users.birthdate AS birthdate, images.name AS avatar, blocked.created_at AS blocked_at FROM blocked JOIN users ON blocked.blocked = users.id LEFT JOIN images ON users.id = images.user_id AND images.profile = TRUE WHERE blocked.blocker = $1`;
    const result = await db.query(query, [id]);
    return result.rows;
}

// Check if a specific user is already blocked by the current user
const isBlocked = async (blocker, blocked) => {
    const query = `SELECT 1 FROM blocked WHERE blocker = $1 AND blocked = $2`;
    const result = await db.query(query, [blocker, blocked]);
    return result.rowCount > 0;
}

//  Block user 
const blockUser = async (user_id, id) => {
    const query = `INSERT INTO blocked (blocker, blocked) VALUES ($1, $2)`;
    await db.query(query, [user_id, id]);
}

// Unblock user 
const unblockUser = async (user_id, id) => {
    const query = `DELETE FROM blocked WHERE blocker = $1 AND blocked = $2`;
    await db.query(query, [user_id, id]);
}

// Report User 
const reportUser = async (id) => {
    const query = `UPDATE users SET reports = reports + 1 WHERE id = $1`;
    await db.query(query, [id]);
}

// User update location 
const updateLocation = async (lat, long, id) => {
    const query = `UPDATE users SET lat = $1, lng = $2 WHERE id = $3`;
    await db.query(query, [lat, long, id]);
    return await db.query(query, [lat, long, id]);
}

const blacklist = async (ids) => {
    const query = `SELECT id, username, first_name, last_name FROM users WHERE id = ANY($1)`;
    const result = await db.query(query, [ids]);
    return result.rows;
}

const updateStatus = async (id, status) => {
    const query = `UPDATE users SET status = $2 WHERE id = $1`;
    await db.query(query, [id, status]);
}

module.exports = {
    addUser,
    getUser,
    getVkey,
    validateEmail,
    getUserByIdentifier,
    getUserById,
    getUserByUsername,
    getUserByemail,
    getRkey,
    addRkey,
    destroyRkey,
    changeFrogottenPassword,
    updateProfile,
    changeEmail,
    getUserByIdD,
    changePassword,
    insertImages,
    getImages,
    updateProfilePic,
    getCover,
    delCover,
    insertCover,
    getImagesById,
    delImage,
    setImages,
    getImagesByUid,
    getUserBrow,
    getUserbyIdBrow,
    getBlocked,
    isBlocked,
    blockUser,
    unblockUser,
    reportUser,
    updateLocation,
    updateStatus,
    blacklist
}
