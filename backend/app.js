
require('dotenv').config()
let bodyParser = require('body-parser')
const mysql = require('mysql')
const express = require('express')
const http = require('http')
const app = express()
const socketIo = require('socket.io')
const port = process.env.PORT || 3000
const passport = require('passport')
const path = require('path')
const pool = require('./src/utility/database')
const cors = require('cors')

const server = http.createServer(app)

app.use(cors())

app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }))
app.use(bodyParser.json({ limit: '50mb', extended: true }))

app.set('views', path.join(__dirname, '/src/views'));
app.set('view engine', 'ejs')

app.use(express.static('public'));
app.use('/uploads', express.static('uploads'));

// routes 

app.use(express.static(`${path.dirname(path.dirname(__dirname))}/client/dist`))
app.use('/api/users/', require('./src/routes/userRoutes'))
app.use('/api/auth/', require('./src/routes/authRoutes'))
app.use('/api/browse/', require('./src/routes/browsingRoutes'))
app.use('/api/chat/', require('./src/routes/chatRoutes'))
app.use('/api/notif/', require('./src/routes/notifRoutes'))
app.use('/api/matching/', require('./src/routes/matchingRoutes'))
app.get('/verified', (req, res) => {
    res.render('verified');
});
app.get('/get_last_user_id', (req, res) => {
    const connection = mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASS,
        database: process.env.DB_NAME
    });

    connection.connect();

    connection.query('SELECT user_id FROM images ORDER BY user_id DESC LIMIT 1;', (error, results) => {
        if (error) throw error;
        if (results.length === 0) {
          res.send(0);
        } else {
          res.send(results[0].user_id.toString());
        }
    });
    
    connection.end();
});

app.get('/allTags', (req, res) => {
    if (req.headers['x-requested-with'] !== 'XMLHttpRequest') {
        return res.status(403).send('Forbidden');
    }
    const connection = mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASS,
        database: process.env.DB_NAME
    });

    connection.connect();

    connection.query('SELECT value FROM tags', (err, results) => {
      if (err) {
        console.error(err);
        res.status(500).send('Error retrieving data from database');
        return;
      }
      res.json(results.map(row => row.value));
    });
});


app.get('/api/', (req, res) => res.sendFile(path.resolve(__dirname, 'index.html')))


// app.use((req, res, next) => {
//     res.status(404).sendFile(path.resolve(__dirname, '404.html'));
// });


const io = socketIo(server, {
	cors: {
	  origin: process.env.APP_URL,
	  methods: ["GET", "POST"],
	  credentials: true
	}
  });

let users = {}

io.on('connection', socket => {
    socket.on('chat', data => {
        try {
            const id = users[data.id_to]
            if (id) io.sockets.connected[id].emit('chat', data)
        } catch (err) {
            console.error('app.js chat error ===> ', err)
        }
    })
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
    socket.on('auth', id => {
        try {
            users[id] = socket.id
            io.emit('online', Object.keys(users))
        } catch (err) {
            console.error('app.js auth error ===> ', err)
        }
    })
    socket.on('logout', id => {
        try {
            const sql = `UPDATE users SET status = NOW() WHERE id = ?`
            pool.query(sql, [id])
            delete users[id]
        } catch (err) {
            console.error('app.js logout error ===> ', err)
        }
    })
    socket.on('disconnect', () => {
        for (let key of Object.keys(users)) {
            if (users[key] === socket.id) {
                try {
                    const sql = `UPDATE users SET status = NOW() WHERE id = ?`
                    pool.query(sql, [key])
                    delete users[key]
                    io.emit('online', Object.keys(users))
                    socket.disconnect()
                } catch (err) {
                    console.error('app.js disconnect error ===> ', err)
                }
            }
        }
    })
})

server.listen(port, () => {
	console.log(`\n\nServer Backend Matcha:`);
	console.log(`\n-----> Operating locally at the port ${port}\n`);
	console.log(`- Local:   \x1b[32mhttp://localhost:${port}\x1b[0m`);
});