const { Pool } = require('pg');
require('dotenv').config({ path: '../scripts/.env' });

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

const insertEpisode = async (episode) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    
    const queryText = `
      INSERT INTO episodes (date, title, painting_index, season, episode)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id;
    `;
    const values = [episode.date, episode.title, episode.painting_index, episode.season, episode.episode];

    const res = await client.query(queryText, values);
    await client.query('COMMIT');
    console.log('Insert result:', res);
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Error during transaction:', err);
  } finally {
    client.release();
  }
};

const main = async () => {
  const episodes = [
    {
      date: '1983-03-08',
      title: 'Mountain Lake',
      painting_index: 1,
      season: 1,
      episode: 1
    },
    {
      date: '1983-10-05',
      title: 'Black River',
      painting_index: 2,
      season: 2,
      episode: 5
    },
    {
      date: '1983-10-12',
      title: 'Brown Mountain',
      painting_index: 3,
      season: 2,
      episode: 6
    }
  ];

  for (const episode of episodes) {
    await insertEpisode(episode);
  }

  // Query the episodes table to verify insertion
  const client = await pool.connect();
  try {
    const res = await client.query('SELECT * FROM episodes;');
    console.log('Episodes table:', res.rows);
  } finally {
    client.release();
  }
};

main().catch(console.error);
