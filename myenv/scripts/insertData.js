const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
require('dotenv').config();

// PostgreSQL connection setup
const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
});

// Function to clean the array string for PostgreSQL
const cleanArrayString = (str) => {
    // Remove unwanted characters and replace single quotes with nothing
    let cleaned = str.replace(/[\r\n]+/g, '').replace(/'/g, '');

    // Replace brackets with curly braces for PostgreSQL
    cleaned = cleaned.replace(/^\[|\]$/g, '{').replace(/,(\s*)\}/g, '}');

    // Ensure items are separated by commas and no extra brackets
    if (!cleaned.endsWith('}')) {
        cleaned += '}';
    }

    return cleaned;
};

// Function to clean and parse data
const parseAndCleanData = (data) => {
    data.colors = cleanArrayString(data.colors);
    data.color_hex = cleanArrayString(data.color_hex);
    return data;
};

// Function to insert data into PostgreSQL
const insertPaintingData = async (paintingData) => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        const insertPaintingText = `
        INSERT INTO paintings (painting_index, img_src, painting_title, season, episode, num_colors, youtube_src, colors, color_hex) 
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8::text[], $9::text[])
        ON CONFLICT (painting_index) 
        DO UPDATE SET
            img_src = EXCLUDED.img_src,
            painting_title = EXCLUDED.painting_title,
            season = EXCLUDED.season,
            episode = EXCLUDED.episode,
            num_colors = EXCLUDED.num_colors,
            youtube_src = EXCLUDED.youtube_src,
            colors = EXCLUDED.colors,
            color_hex = EXCLUDED.color_hex`;

        await client.query(insertPaintingText, [
            paintingData.painting_index,
            paintingData.img_src,
            paintingData.painting_title,
            paintingData.season,
            paintingData.episode,
            paintingData.num_colors,
            paintingData.youtube_src,
            paintingData.colors,
            paintingData.color_hex
        ]);

        await client.query('COMMIT');
    } catch (err) {
        await client.query('ROLLBACK');
        console.error('Error during transaction:', err);
        throw err;
    } finally {
        client.release();
    }
};

// Function to process CSV data
const processCSV = async () => {
    const filePath = path.join(__dirname, '../data/Colors_Used.csv');
    const results = [];

    return new Promise((resolve, reject) => {
        fs.createReadStream(filePath)
            .pipe(csv())
            .on('data', (data) => {
                const cleanedData = parseAndCleanData(data);
                results.push(cleanedData);
            })
            .on('end', async () => {
                try {
                    const concurrencyLimit = 10; // Adjust this based on your needs
                    for (let i = 0; i < results.length; i += concurrencyLimit) {
                        const chunk = results.slice(i, i + concurrencyLimit);
                        await Promise.all(chunk.map(data => insertPaintingData(data)));
                    }
                    console.log('All data processed successfully.');
                } catch (err) {
                    console.error('Error processing data:', err);
                } finally {
                    await pool.end(); // Close the pool when done
                    resolve(); // Resolve the promise
                }
            })
            .on('error', (err) => {
                reject(err);
            });
    });
};

// Run the CSV processing
processCSV().catch(err => {
    console.error('Error running processCSV:', err);
});
