const db = require('../utility/database')

// GET ALL TAGS

const getAllTags = (callback) => {
	let request = `SELECT value FROM tags`
	db.query(request, (error, results) => {
		if (error) throw error
		callback(results)
	})
}

// GET TAGS

const getTags = (callback) => {
	let request = `SELECT value FROM tags`
	db.query(request, (error, results) => {
		if (error) throw error
		callback(results)
	})
}

// INSERT TAGS 


const insertTags = (tag, callback) => {
	let request = `INSERT IGNORE INTO tags (value) VALUES (?)`
	db.query(request, [tag], (error, results) => {
	  if (error) throw error;
	  if (results.affectedRows > 0) {
		callback(true);
	  } else {
		callback(false);
	  }
	});
  };


module.exports = {
	getTags,
	getAllTags,
	insertTags
}