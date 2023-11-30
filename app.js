const bodyParser = require('body-parser');
const cors = require('cors');
const express = require('express');
const mariaDB = require('mariadb');
const bcrypt = require('bcrypt');
const jwt = require("jsonwebtoken");
const { verifyToken } = require('./middleware/verifyToken');

const app = express();
app.set('port', 1300);
app.use(cors())
app.use(bodyParser.json());

const pool = mariaDB.createPool({
    host: 'localhost',
    port: '3306',
    database: 'Kappa_web',
    user: 'root',
    password: '1234',
    connectionLimit: 5
});

let conn

async function getConnection() {
    conn = await pool.getConnection();
    console.log('CONEXION ESTABLECIDA')
}

getConnection()

app.get('/users', async (req, res) => {
    try {
        const users = await conn.query("SELECT id, username FROM users");
        res.json(users)
    } catch (error) {
        console.log(error);
        res.status(500).json(error);
    }
});


app.post('/register', async (req, res) => {
    try {
        const { username, password } = req.body;

        const hashedPass = await bcrypt.hash(password, 10);

        const result = await conn.query(
            `INSERT INTO users (username, password) VALUES ('${username}','${hashedPass}')`
        );

        if (result.affectedRows > 0) {
            res.json('Usuario registrado correctamente.')
        } else {
            res.json('Error al registrarse')
        }
    } catch (error) {
        console.log(error);
        res.status(500).json(error);
    }

});


app.post('/login', async (req, res) => {

    try {
        const { username, password } = req.body;

        const user = await conn.query(
            `SELECT * FROM users WHERE username = '${username}'`
        );

        if (user.length > 0) {
            const passwordMatch = await bcrypt.compare(
                password,
                user[0].password
            );

            if (passwordMatch) {
                const token = jwt.sign({ username }, 'claveSecreta', { expiresIn: '2h' })

                res.json(token);
            } else {
                res.status(401).json('Contraseña incorrecta.')
            }

        } else {
            res.status(404).json('Usuario no encontrado.')
        }
    } catch (error) {
        console.log(error);
        res.status(500).json(error);
    }
});

app.get('/gifs', async (req, res) => {
    const gifs = await conn.query(
        `SELECT * FROM posts`
    );

    res.json(gifs);
})

app.post('/gifs', verifyToken, async (req, res) => {
    const { name, url, decoded } = req.body
    const post = await conn.query(`INSERT INTO posts (name, url, owner) VALUES ('${name}', '${url}', '${decoded.username}')`);

    if (post.affectedRows > 0) {
        res.json('Imagen subida')
    } else {
        res.json('Error al subir imagen')
    }
})

app.listen(app.get('port'), () => {
    console.log('Listening on port', app.get('port'));
});