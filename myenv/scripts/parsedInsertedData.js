const { Client } = require('pg');
const { parseData } = require('./parseData');
const { insertPaintingData } = require('./insertEpisodes');
const { cleanData } = require('./cleanData');

const insertParsedData = async () => {
    const client = new Client({
        // Your PostgreSQL database configuration here
    });

    try {
        await client.connect(); // Connect to the database

        // Pass the client to parseData if necessary
        const { episodes, colors, subjects } = await parseData(client);

        // Insert episodes
        for (const episode of episodes) {
            const cleanedData = cleanData(episode);
            await insertPaintingData(client, cleanedData); // Ensure insertPaintingData accepts client
        }

        console.log('All data inserted successfully.');
    } catch (err) {
        console.error('Error inserting data:', err);
    } finally {
        await client.end(); // Ensure the client connection is closed
    }
};

insertParsedData();
