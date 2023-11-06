const mysql = require('mysql')
const conf = require('../config/db')
const { promisify } = require('util')

const pool = mysql.createPool(conf)

pool.getConnection((err, connection) => {
	if (err) {
		switch (err.code) {
			case 'PROTOCOL_CONNECTION_LOST':
				console.log('Database connection was closed.')
				break
			case 'ER_CON_COUNT_ERROR':
				console.log('Database has too many connections.')
				break
			case 'ECONNREFUSED':
				console.log('Database connection was refused.')
				break
		}
	}
	if (connection) connection.release()
		{console.log('DB is connected')
		return}


})

pool.query = promisify(pool.query)

const createUserTable = async () => {
	try {
	  const createTableQuery = `
      CREATE TABLE IF NOT EXISTS users (
        id int(11) AUTO_INCREMENT PRIMARY KEY,
        first_name varchar(255) CHARACTER SET utf8 DEFAULT NULL,
        last_name varchar(255) CHARACTER SET utf8 DEFAULT NULL,
        username varchar(25) CHARACTER SET utf8 UNIQUE,
        email varchar(255) CHARACTER SET utf8 UNIQUE,
        password varchar(255) NOT NULL DEFAULT '',
        created_at datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
        gender varchar(20) DEFAULT NULL,
        looking varchar(20) DEFAULT NULL,
        birthdate date DEFAULT NULL,
        biography varchar(510) CHARACTER SET utf8 DEFAULT NULL,
        tags varchar(550) CHARACTER SET utf8 DEFAULT NULL,
        address varchar(255) CHARACTER SET utf8 DEFAULT NULL,
        city varchar(255) CHARACTER SET utf8 DEFAULT NULL,
        country varchar(255) CHARACTER SET utf8 DEFAULT NULL,
        postal_code varchar(50) DEFAULT NULL,
        phone varchar(255) DEFAULT NULL,
        status datetime DEFAULT CURRENT_TIMESTAMP,
        lat varchar(30) NOT NULL DEFAULT '0',
        lng varchar(30) NOT NULL DEFAULT '0',
        vkey varchar(255) NOT NULL DEFAULT '',
        rkey varchar(255) DEFAULT NULL,
        verified tinyint(1) NOT NULL DEFAULT '0',
        google_id varchar(50) DEFAULT NULL,
        reports int(11) DEFAULT '0'
      ) ENGINE=InnoDB DEFAULT CHARSET=latin1;
	  `;
    const insertTableQuery = `
      INSERT INTO users (id, first_name, last_name, username, email, password, created_at, gender, looking, birthdate, biography, tags, address, city, country, postal_code, phone, status, lat, lng, vkey, rkey, verified, google_id, reports) VALUES
    `;
	  await pool.query(createTableQuery);
	  console.log('User table created successfully!');
    const countQuery = 'SELECT COUNT(*) AS count FROM users';
    const countResult = await pool.query(countQuery);
    const rowCount = countResult[0].count;

    if (rowCount === 0) {
      await pool.query(insertTableQuery);
    } else {
      console.log('Users table already contains data.');
    }
	} catch (error) {
	  console.error('Error creating user table:', error);
	}
};

const createBlockedTable = async () => {
	try {
	  const createTableQuery = `
      CREATE TABLE IF NOT EXISTS blocked(
        id int(11) AUTO_INCREMENT PRIMARY KEY,
        blocker int(11) NOT NULL,
        blocked int(11) NOT NULL,
        created_at datetime NOT NULL DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=latin1;
	  `;
	  await pool.query(createTableQuery);
	  console.log('Blocked table created successfully!');
	} catch (error) {
	  console.error('Error creating blocked table:', error);
	}
};

const createChatTable = async () => {
	try {
	  const createTableQuery = `
      CREATE TABLE IF NOT EXISTS chat (
        id int(11) AUTO_INCREMENT PRIMARY KEY,
        id_conversation int(11) NOT NULL,
        id_from int(11) NOT NULL,
        message varchar(2048) NOT NULL,
        created_at datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
        is_read tinyint(1) NOT NULL DEFAULT '0'
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8;
	  `;
	  await pool.query(createTableQuery);
	  console.log('Chat table created successfully!');
	} catch (error) {
	  console.error('Error creating chat table:', error);
	}
};

const createConversationsTable = async () => {
	try {
	  const createTableQuery = `
      CREATE TABLE IF NOT EXISTS conversations (
        id_conversation int(11) AUTO_INCREMENT PRIMARY KEY,
        id_user1 int(11) NOT NULL,
        id_user2 int(11) NOT NULL,
        last_update datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
        allowed tinyint(1) NOT NULL DEFAULT '1',
        last_msg int(11) DEFAULT NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=latin1;
	  `;
	  await pool.query(createTableQuery);
	  console.log('Conversation table created successfully!');
	} catch (error) {
	  console.error('Error creating conversations table:', error);
	}
};

const createHisotryTable = async () => {
	try {
	  const createTableQuery = `
      CREATE TABLE IF NOT EXISTS history (
        id int(11) AUTO_INCREMENT PRIMARY KEY,
        visitor int(11) NOT NULL,
        visited int(11) NOT NULL,
        created_at datetime NOT NULL DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=latin1;
	  `;
	  await pool.query(createTableQuery);
	  console.log('History table created successfully!');
	} catch (error) {
	  console.error('Error creating history table:', error);
	}
};

const createImagesTable = async () => {
	try {
	  const createTableQuery = `
      CREATE TABLE IF NOT EXISTS images (
        id int(11) AUTO_INCREMENT PRIMARY KEY,
        user_id int(11) NOT NULL,
        name varchar(255) NOT NULL,
        profile tinyint(1) NOT NULL DEFAULT '0',
        cover tinyint(1) NOT NULL DEFAULT '0',
        created_at datetime NOT NULL DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=latin1;
	  `;
    const insertTableQuery = `
      INSERT INTO images (id, user_id, name, profile, cover, created_at) VALUES
    `
	  await pool.query(createTableQuery);
	  console.log('Images table created successfully!');
    const countQuery = 'SELECT COUNT(*) AS count FROM images';
    const countResult = await pool.query(countQuery);
    const rowCount = countResult[0].count;

    if (rowCount === 0) {
      await pool.query(insertTableQuery);
    } else {
      console.log('Image table already contains data.');
    }
	} catch (error) {
	  console.error('Error creating Images table:', error);
	}
};

const createMatchesTable = async () => {
	try {
	  const createTableQuery = `
      CREATE TABLE IF NOT EXISTS matches (
        id int(11) AUTO_INCREMENT PRIMARY KEY,
        matcher int(11) NOT NULL,
        matched int(11) NOT NULL,
        created_at datetime NOT NULL DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=latin1;
	  `;
	  await pool.query(createTableQuery);
	  console.log('Matches table created successfully!');
	} catch (error) {
	  console.error('Error creating Images table:', error);
	}
};

const createNotificationsTable = async () => {
	try {
	  const createTableQuery = `
      CREATE TABLE IF NOT EXISTS notifications (
        id int(11) AUTO_INCREMENT PRIMARY KEY,
        type varchar(20) NOT NULL,
        id_from int(11) NOT NULL,
        id_to int(11) NOT NULL,
        created_at datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
        is_read tinyint(1) NOT NULL DEFAULT '0',
        id_conversation int(11) NOT NULL DEFAULT '-1'
      ) ENGINE=InnoDB DEFAULT CHARSET=latin1;
	  `;
	  await pool.query(createTableQuery);
	  console.log('Notifications table created successfully!');
	} catch (error) {
	  console.error('Error creating Notifications table:', error);
	}
};

const createTagsTable = async () => {
	try {
	  const createTableQuery = `
      CREATE TABLE IF NOT EXISTS tags (
        id INT AUTO_INCREMENT PRIMARY KEY,
        value varchar(100) UNIQUE
      ) ENGINE=InnoDB DEFAULT CHARSET=latin1;
	  `;
    const insertTableQuery = `
      INSERT INTO tags (value) VALUES
      ('125'),
      ('42'),
      ('Back-end'),
      ('Cinema'),
      ('Football'),
      ('Gaming'),
      ('Tae-kwon-do'),
      ('Front-end'),
      ('Geek'),
      ('Music'),
      ('RNCP-5'),
      ('RNCP-7'),
      ('Sports'),
      ('Tattoos'),
      ('Vegan'),
      ('Web'),
      ('Web-Design'),
      ('Web-Development'),
      ('Web-Integration'),
      ('Web-UI-UX'),
      ('Webmaster');
    `;
	  await pool.query(createTableQuery);
    console.log('Tags table created successfully!');
    const countQuery = 'SELECT COUNT(*) AS count FROM tags';
    const countResult = await pool.query(countQuery);
    const rowCount = countResult[0].count;
    if (rowCount === 0) {
      await pool.query(insertTableQuery);
    } else {
      console.log('Tags table already contains data.');
    }
	} catch (error) {
	  console.error('Error creating tags table:', error);
	}
};

const procedures = async () => {
  try {
    const createProcedureQuery1 = `
    DROP PROCEDURE IF EXISTS matcha.CALC_RATING;
    `;
    const createProcedureQuery2 = `
    CREATE PROCEDURE matcha.CALC_RATING(
      OUT visites INT, 
      OUT likesCount INT, 
      OUT reported INT, 
      IN id_user INT
    )
    SQL SECURITY INVOKER
    COMMENT 'Calculate the user''s rating'
    BEGIN
        SELECT COUNT(*)
        INTO likesCount
        FROM matcha.matches
        WHERE matched = id_user;
        SELECT COUNT(*)
        INTO visites
        FROM matcha.history
        WHERE visited = id_user;
        SELECT reports
        INTO reported
        FROM matcha.users
        WHERE id = id_user;
    END;
    `;
    const createProcedureQuery3 = `
    DROP FUNCTION IF EXISTS matcha.GET_RATING;
    `;
    const createProcedureQuery4 = `
    CREATE FUNCTION matcha.GET_RATING(id_user INT)
    RETURNS DOUBLE
    DETERMINISTIC
    BEGIN
      DECLARE visit INT;
      DECLARE likes INT;
      DECLARE reports INT;
      CALL CALC_RATING(visit, likes, reports, id_user);
      RETURN (likes / 20 + visit / 100 - reports / 250);
    END;
    `;

    await pool.query(createProcedureQuery1);
    await pool.query(createProcedureQuery2);
    await pool.query(createProcedureQuery3);
    await pool.query(createProcedureQuery4);

    console.log('Procedures created successfully!');
  } catch (error) {
    console.error('Error creating procedures:', error);
  }
}




createUserTable();
createImagesTable();
createBlockedTable();
createConversationsTable();
createChatTable();
createHisotryTable();
createMatchesTable();
createNotificationsTable();
createTagsTable();
procedures();

pool.on('error', (err) => {
console.error('MySQL pool error:', err);
});

module.exports = pool
