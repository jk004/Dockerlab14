const express = require('express');
const mustacheExpress = require('mustache-express');
const os = require('os');
const fs = require('fs');
const { Pool } = require('pg');

const app = express();
app.use(express.static('public'));
app.set('view engine', 'html');
app.engine('html', mustacheExpress());
app.set('views', __dirname);

const port = parseInt(process.env.PORT || '3000', 10);
const dbhost = process.env.DB_HOST || 'localhost';
const dbuser = process.env.DB_USER || 'dockeruser';
const dbname = process.env.DB_NAME || 'pets';
const dbport = parseInt(process.env.DB_PORT || '5432', 10);

// Read DB password: prefer FILE (secret), fallback to plain env var
let dbPassword = process.env.DB_PASSWORD || '';
if (process.env.DB_PASSWORD_FILE) {
    try {
        dbPassword = fs.readFileSync(process.env.DB_PASSWORD_FILE, 'utf8').trim();
    } catch (err) {
        console.error('Failed to read DB password file:', err.message);
    }
}

console.log(`DB_HOST: ${dbhost}`);
console.log(`DB_USER: ${dbuser}`);
console.log(`DB_NAME: ${dbname}`);

const pool = new Pool({
    host: dbhost,
    user: dbuser,
    password: dbPassword,
    database: dbname,
    port: dbport,
    max: 5,
    idleTimeoutMillis: 30000,
});

app.get('/', (req, res) => {
    res.status(200).send('Wild Animals of Massai Mara National Park');
});

app.get('/images', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM images');
        res.status(200).json({ info: result.rows });
    } catch (err) {
        console.error('DB query /images error:', err);
        res.status(500).json({ error: 'Database error' });
    }
});

app.get('/animal', async (req, res) => {
    try {
        const imageId = getRandomInt(12) + 1;
        const result = await pool.query('SELECT * FROM images WHERE imageid=$1', [imageId]);
        if (!result.rows.length) {
            return res.status(404).send('Image not found');
        }
        const url = result.rows[0].url;
        res.render('index', {
            url: url,
            hostname: os.hostname(),
        });
    } catch (err) {
        console.error('DB query /animal error:', err);
        res.status(500).send('Database error');
    }
});

function getRandomInt(max) {
    return Math.floor(Math.random() * Math.floor(max));
}

app.listen(port, '0.0.0.0', () => {
    console.log(`Application listening on port ${port}`);
});
