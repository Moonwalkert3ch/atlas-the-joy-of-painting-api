const { parseData } = require('./parseData');
const { insertPaintingData } = require('./insertColors');

const main = async () => {
    try {
        const { episodes } = await parseData();
        for (const [episode_id, data] of Object.entries(episodes)) {
            await insertPaintingData(data);
        }

        console.log('Data insertion complete.');
    } catch (error) {
        console.error('Error:', error);
    }
};

main();
