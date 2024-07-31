const { pool } = require('./db');

// Function to clean data
const cleanData = (data) => {
    return data.map(item => ({
        date: item.date ? item.date.trim() : null,
        title: item.title ? item.title.trim() : null,
        painting_index: item.painting_index ? item.painting_index.trim() : null,
        season: item.season ? item.season.trim() : null,
        episode: item.episode ? item.episode.trim() : null
    }));
};

// Function to insert painting data into PostgreSQL
const insertPaintingData = async (paintingData) => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        const insertPaintingText = `
        INSERT INTO episodes (date, title, painting_index, season, episode) 
        VALUES ($1, $2, $3, $4, $5)
        ON CONFLICT (painting_index) 
        DO UPDATE SET
            date = EXCLUDED.date,
            title = EXCLUDED.title,
            season = EXCLUDED.season,
            episode = EXCLUDED.episode`;

        console.log('Inserting data:', paintingData);

        const values = [
            paintingData.date,
            paintingData.title,
            paintingData.painting_index,
            paintingData.season,
            paintingData.episode
        ];

        console.log('Insert query:', insertPaintingText);
        console.log('Values:', values);

        const res = await client.query(insertPaintingText, values);

        console.log('Insert result:', res);

        await client.query('COMMIT');
    } catch (err) {
        await client.query('ROLLBACK');
        console.error('Error during transaction. Data:', paintingData, 'Error:', err);
        throw err;
    } finally {
        client.release();
    }
};

module.exports = { insertPaintingData };
