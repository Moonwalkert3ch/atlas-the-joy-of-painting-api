const express = require('express');
const { Pool } = require('pg');
require('dotenv').config({ path: '../scripts/.env' });

const app = express();
const port = process.env.PORT || 4000;

// PostgreSQL connection setup
const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
});

app.use(express.json());

const getFilteredEpisodes = async (filter) => {
    let query = `
        SELECT e.id, e.date, e.title, e.painting_index, e.season, e.episode,
               ARRAY_AGG(DISTINCT s.subject_matter) AS subjects,
               ARRAY_AGG(DISTINCT c.name) AS colors
        FROM episodes e
        LEFT JOIN episode_colors ec ON e.id = ec.episodes_id
        LEFT JOIN colors c ON ec.colors_id = c.id
        LEFT JOIN episode_subject es ON e.id = es.episodes_id
        LEFT JOIN subjects s ON es.subjects_id = s.id
        WHERE 1=1
    `;

    const queryParams = [];

    if (filter.month) {
        query += ` AND EXTRACT(MONTH FROM e.date) = $${queryParams.length + 1}`;
        queryParams.push(filter.month);
    }

    if (filter.subjects && filter.subjects.length > 0) {
        query += ` AND s.subject_matter IN (${filter.subjects.map((_, i) => `$${i + queryParams.length + 1}`).join(', ')})`;
        queryParams.push(...filter.subjects);
    }

    if (filter.colors && filter.colors.length > 0) {
        query += ` AND c.name IN (${filter.colors.map((_, i) => `$${i + queryParams.length + 1}`).join(', ')})`;
        queryParams.push(...filter.colors);
    }

    if (filter.matchType === 'intersection') {
        query += ` GROUP BY e.id HAVING COUNT(DISTINCT s.id) = ${filter.subjects.length} AND COUNT(DISTINCT c.id) = ${filter.colors.length}`;
    }

    try {
        const result = await pool.query(query, queryParams);
        return result.rows;
    } catch (err) {
        console.error('Error executing query', err);
        throw err;
    }
};

const getEpisodes = async (req, res) => {
    try {
        const { rows } = await pool.query(`
            SELECT e.id, e.date, e.title, e.painting_index, e.season, e.episode,
                   ARRAY_AGG(DISTINCT s.subject_matter) AS subjects,
                   ARRAY_AGG(DISTINCT c.name) AS colors
            FROM episodes e
            LEFT JOIN episode_subject es ON e.id = es.episodes_id
            LEFT JOIN subjects s ON es.subjects_id = s.id
            LEFT JOIN episode_colors ec ON e.id = ec.episodes_id
            LEFT JOIN colors c ON ec.colors_id = c.id
            GROUP BY e.id;
        `);

        console.log('Query Results:', rows); // Debugging line
        res.json(rows);
    } catch (err) {
        console.error('Error getting episodes:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

// API endpoint for filtering episodes
app.get('/episodes', async (req, res) => {
    try {
        const filter = {
            month: req.query.month,
            subjects: req.query.subjects ? req.query.subjects.split(',') : [],
            colors: req.query.colors ? req.query.colors.split(',') : [],
            matchType: req.query.matchType || 'intersection' // 'intersection' or 'union'
        };

        const episodes = await getFilteredEpisodes(filter);
        res.json(episodes);
    } catch (err) {
        console.error('Error getting episodes:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Start the server
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
