require('dotenv').config({ path: '.env' });
const { Pool } = require('pg');

// Log environment variables for debugging
console.log('DB_USER:', process.env.DB_USER);
console.log('DB_HOST:', process.env.DB_HOST);
console.log('DB_NAME:', process.env.DB_NAME);
console.log('DB_PASSWORD:', process.env.DB_PASSWORD);
console.log('DB_PORT:', process.env.DB_PORT);

// creating a new pool instance with PostgreSQL connection details
const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
});

pool.connect()
    .then(() => {
        console.log('Connected to PostgreSQL');
        // Run a test query
        return pool.query('SELECT NOW()');
    })
    .then((res) => {
        console.log('Current time from database:', res.rows[0].now);
    })
    .catch(err => {
        console.error('Connection to PostgreSQL error', err.stack);
    })
    .finally(() => {
        pool.end(); // Close the connection
    });

// export
module.exports = pool;
