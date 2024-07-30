const { parseData } = require('./parseData');
const { insertPaintingData } = require('./insertData');

const insertParsedData = async () => {
    try {
        const { episodes, colors, subjects } = await parseData();

        // Insert episodes
        for (const episode of episodes) {
            const cleanedData = cleanData(episode);
            await insertPaintingData(cleanedData);
        }

        console.log('All data inserted successfully.');
    } catch (err) {
        console.error('Error inserting data:', err);
    }
};

insertParsedData();
