const { parseData } = require('./parseData');
const { insertPaintingData } = require('./insertData');

// run clean and inserted data 
async function run() {
    try {
        const parsedData = await parseData();

        for (const painting of parsedData) {
            await insertPaintingData(painting);
        }

        console.log('Data inserted successfully');
    } catch (error) {
        console.error('Error inserting data:', error);
    }
}

run();
