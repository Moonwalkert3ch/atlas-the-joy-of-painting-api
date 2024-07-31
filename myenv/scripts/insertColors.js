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
const insertPaintingData = async (episode_id, paintingData) => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        const insertPaintingText = `
        INSERT INTO episode_colors (episode_id, color_id) 
        VALUES ($1, $2)`

        console.log('Inserting data:', paintingData);

        let values = [];
        const res = [];

        if (episode_id > 0) {
            paintingData[rowColors].map(async color_id => {
                values = [
                    episode_id,
                    color_id,
                ];

                res = await client.query(insertPaintingText, values);

            })
        };

        console.log('Insert query:', insertPaintingText);
        console.log('Values:', values);



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
