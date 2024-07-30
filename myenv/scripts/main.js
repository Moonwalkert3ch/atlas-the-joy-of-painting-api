const { parseData } = require('./parseData');
const { insertPaintingData } = require('./insertData');

const main = async () => {
    try {
        const { episodes } = await parseData();
        
        // Assuming episodes data is in the expected format
        for (const episode of episodes) {
            await insertPaintingData(episode);
        }

        console.log('Data insertion complete.');
    } catch (error) {
        console.error('Error:', error);
    }
};

main();
