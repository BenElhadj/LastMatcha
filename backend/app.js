require('dotenv').config()
let bodyParser = require('body-parser')
const express = require('express')
const http = require('http')
const app = express()
const socketIo = require('socket.io')
const port = process.env.PORT || 3000
const path = require('path')
const { pool } = require('./src/config/database')
const cors = require('cors')

// Configuration CORS pour la production
app.use(cors({
  origin: [
    'https://benelhadj.github.io',
    'https://benelhadj.github.io/Matcha',
    'http://localhost:5173',
    'https://matcha-backend-t6dr.onrender.com/'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'x-auth-token']
}))

app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }))
app.use(bodyParser.json({ limit: '50mb', extended: true }))

app.set('views', path.join(__dirname, '/src/views'));
app.set('view engine', 'ejs')

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});
app.use(express.static('public'));
app.use('/uploads', express.static('uploads'));

app.use(express.static(`${path.dirname(path.dirname(__dirname))}/client/dist`))

// Routes API
app.use('/api/users/', require('./src/routes/userRoutes'))
app.use('/api/auth/', require('./src/routes/authRoutes'))
app.use('/api/browse/', require('./src/routes/browsingRoutes'))
app.use('/api/chat/', require('./src/routes/chatRoutes'))
app.use('/api/notif/', require('./src/routes/notifRoutes'))
app.use('/api', require('./src/routes/matchingRoutes'))





// Route de test de connexion BDD
app.get('/api/test-db', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW() as current_time, version() as postgres_version');
    res.json({ 
      success: true, 
      message: '✅ Database connection successful',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Database test error:', error);
    res.status(500).json({ 
      success: false, 
      message: '❌ Database connection failed',
      error: error.message 
    });
  }
});

// Route pour voir toutes les tables
app.get('/api/tables', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `);
    res.json({ 
      success: true, 
      tables: result.rows.map(row => row.table_name)
    });
  } catch (error) {
    console.error('Tables query error:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Route pour voir les utilisateurs
app.get('/api/users-list', async (req, res) => {
  try {
    const result = await pool.query('SELECT id, email, username FROM users LIMIT 5');
    res.json({ 
      success: true, 
      users: result.rows
    });
  } catch (error) {
    console.error('Users query error:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});
// --- Admin helper endpoints (protected by x-admin-token header matching process.env.SECRET)
const adminAuth = (req, res, next) => {
  const token = req.headers['x-admin-token'] || req.headers['x_admin_token'] || req.query.admin_token;
  if (!token || token !== process.env.SECRET) {
    return res.status(403).json({ success: false, msg: 'Forbidden' });
  }
  next();
};

// Count users
app.get('/api/admin/count/users', adminAuth, async (req, res) => {
  try {
    const result = await pool.query('SELECT COUNT(*)::int AS count FROM users');
    res.json({ success: true, count: result.rows[0].count });
  } catch (err) {
    console.error('admin count users error', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Count photos
app.get('/api/admin/count/photos', adminAuth, async (req, res) => {
  try {
    const result = await pool.query('SELECT COUNT(*)::int AS count FROM images');
    res.json({ success: true, count: result.rows[0].count });
  } catch (err) {
    console.error('admin count photos error', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Get user by username
app.get('/api/admin/user/username/:username', adminAuth, async (req, res) => {
  try {
    const { username } = req.params;
    const result = await pool.query('SELECT * FROM users WHERE username = $1 LIMIT 1', [username]);
    if (!result.rows.length) return res.status(404).json({ success: false, msg: 'User not found' });
    const user = result.rows[0];
    delete user.password; delete user.vkey; delete user.rkey;
    res.json({ success: true, user });
  } catch (err) {
    console.error('admin get user by username error', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Get user by login (username or email)
app.get('/api/admin/user/login/:identifier', adminAuth, async (req, res) => {
  try {
    const { identifier } = req.params;
    const result = await pool.query('SELECT * FROM users WHERE username = $1 OR email = $1 LIMIT 1', [identifier]);
    if (!result.rows.length) return res.status(404).json({ success: false, msg: 'User not found' });
    const user = result.rows[0];
    delete user.password; delete user.vkey; delete user.rkey;
    res.json({ success: true, user });
  } catch (err) {
    console.error('admin get user by login error', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Get user by id
app.get('/api/admin/user/id/:id', adminAuth, async (req, res) => {
  try {
    const { id } = req.params;
    if (isNaN(id)) return res.status(400).json({ success: false, msg: 'Invalid id' });
    const result = await pool.query('SELECT * FROM users WHERE id = $1 LIMIT 1', [id]);
    if (!result.rows.length) return res.status(404).json({ success: false, msg: 'User not found' });
    const user = result.rows[0];
    delete user.password; delete user.vkey; delete user.rkey;
    res.json({ success: true, user });
  } catch (err) {
    console.error('admin get user by id error', err);
    res.status(500).json({ success: false, error: err.message });
  }
});
// 🔼 FIN DES ROUTES DE TEST 🔼





// Routes de vue
app.get('/verified', (req, res) => {
    res.render('verified');
});

// Route pour la santé de l'application (nécessaire pour Render)
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    service: 'Matcha Backend'
  });
});

// Route pour obtenir le dernier user_id
app.get('/get_last_user_id', async (req, res) => {
  try {
    const result = await pool.query('SELECT user_id FROM images ORDER BY user_id DESC LIMIT 1');
    if (result.rows.length === 0) {
      res.send('0');
    } else {
      res.send(result.rows[0].user_id.toString());
    }
  } catch (error) {
    console.error('Error in /get_last_user_id:', error);
    res.status(500).send('Error retrieving data from database');
  }
});

// Route pour obtenir tous les tags
app.get('/allTags', async (req, res) => {
  if (req.headers['x-requested-with'] !== 'XMLHttpRequest') {
    return res.status(403).send('Forbidden');
  }
  
  try {
    const result = await pool.query('SELECT value FROM tags');
    res.json(result.rows.map(row => row.value));
  } catch (err) {
    console.error('Error in /allTags:', err);
    res.status(500).send('Error retrieving data from database');
  }
});

// Route racine
app.get('/', (req, res) => res.sendFile(path.resolve(__dirname, 'index.html')));

// Configuration Socket.io
const { connectedUsers } = require('./src/controllers/auth');
const server = http.createServer(app)

const io = socketIo(server, {
  cors: {
    origin: [
      'https://benelhadj.github.io',
      'https://benelhadj.github.io/Matcha/',
      'http://localhost:5173',
      'https://matcha-backend-t6dr.onrender.com/'
    ],
    methods: ["GET", "POST"],
    credentials: true
  }
});

let users = {}
io.setMaxListeners(5000)

io.on('connection', socket => {
  console.log('✅ New socket connection');

  socket.on('chat', async (data) => {
    try {
      const id = users[data.id_to]
      if (id) {
        io.sockets.connected[id].emit('chat', data);
        
        // Sauvegarder le message en base de données
        const { convo_id, id_from, id_to, message } = data;
        await pool.query(
          'INSERT INTO chat (convo_id, id_from, id_to, message) VALUES ($1, $2, $3, $4)',
          [convo_id, id_from, id_to, message]
        );
      }
    } catch (err) {
      console.error('app.js chat error ===> ', err);
    }
  });

  socket.on('typing', data => {
    try {
      const id = users[data.id_to]
      if (id) io.sockets.connected[id].emit('typing', data)
    } catch (err) {
      console.error('app.js typing error ===> ', err)
    }
  })

  socket.on('seenConvo', data => {
    try {
      const id = users[data.user]
      if (id) io.sockets.connected[id].emit('seenConvo', data.convo)
    } catch (err) {
      console.error('app.js seenConvo error ===> ', err)
    }
  })

  socket.on('match', data => {
    try {
      const id = users[data.id_to]
      if (id) io.sockets.connected[id].emit('match', data)
    } catch (err) {
      console.error('app.js match error ===> ', err)
    }
  })

  socket.on('visit', data => {
    try {
      const id = users[data.id_to]
      if (id) io.sockets.connected[id].emit('visit', data)
    } catch (err) {
      console.error('app.js visit error ===> ', err)
    }
  })

  socket.on('block', data => {
    try {
      const id = users[data.id_to]
      if (id) io.sockets.connected[id].emit('block', data.id_from)
    } catch (err) {
      console.error('app.js block error ===> ', err)
    }
  })

  socket.on('auth', async (id) => {
    try {
      users[id] = socket.id
      connectedUsers.add(id)
      
      // Mettre à jour le statut de l'utilisateur
      await pool.query('UPDATE users SET status = NOW() WHERE id = $1', [id]);
      
      io.emit('online', Object.keys(users))
    } catch (err) {
      console.error('app.js auth error ===> ', err)
    }
  })

  socket.on('logout', async (id) => {
    try {
      await pool.query('UPDATE users SET status = NOW() WHERE id = $1', [id]);
      delete users[id]
      connectedUsers.delete(id)
      io.emit('online', Object.keys(users))
    } catch (err) {
      console.error('app.js logout error ===> ', err)
    }
  })

  socket.on('disconnect', async () => {
    for (let key of Object.keys(users)) {
      if (users[key] === socket.id) {
        try {
          await pool.query('UPDATE users SET status = NOW() WHERE id = $1', [key]);
          delete users[key]
          io.emit('online', Object.keys(users))
            io.emit('user-status-changed', { userId: key, status: 'offline' })
          socket.disconnect()
        } catch (err) {
          console.error('app.js disconnect error ===> ', err)
        }
      }
    }
  })
})

// Route pour obtenir les utilisateurs connectés
app.get('/connectedUsers', (req, res) => {
  if (req.headers['x-requested-with'] !== 'XMLHttpRequest') {
    return res.status(403).send('Forbidden')
  }
  const onlineUserList = Array.from(connectedUsers)
  res.json(onlineUserList)
})

// Gestion des erreurs globales
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Promise Rejection:', err);
});
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
});

// Démarrage du serveur
server.listen(port, () => {
  console.log(`\n\n🚀 Server Backend Matcha:`);
  console.log(`\n-----> Operating on port ${port}\n`);
  console.log(`- Local:   \x1b[32mhttp://localhost:${port}\x1b[0m`);
  console.log(`- Health:  \x1b[32mhttp://localhost:${port}/health\x1b[0m`);
  console.log(`- Environment: \x1b[33m${process.env.NODE_ENV || 'development'}\x1b[0m\n`);
});

module.exports = app;