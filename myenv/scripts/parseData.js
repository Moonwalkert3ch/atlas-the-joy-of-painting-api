const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');

const parseData = async () => {
    const episodes = [];
    const colors = [];
    const subjects = [];

    const filePath = {
        episodes: path.join(__dirname, '../data/Episode_Dates.txt'),
        colors: path.join(__dirname, '../data/Colors_Used.csv'),
        subjects: path.join(__dirname, '../data/Subject_Matter.csv')
    };

    // Parse episodes
    await new Promise((resolve, reject) => {
        fs.createReadStream(filePath.episodes, 'utf8')
            .on('data', (chunk) => {
                chunk.split('\n').forEach(line => {
                    if (line.trim()) { // Skip empty lines
                        const title = line.split(' (')[0].replace(/"/g, '').trim();
                        const date = line.split(' (')[1]?.split(' Special guest')[0].replace(/\)/g, '').trim();
                        if (title && date) {
                            episodes.push({ title, date });
                        }
                    }
                });
            })
            .on('end', () => {
                console.log('Episodes text file successfully processed.');
                console.log('Episodes Data:', episodes); // Print episodes data
                resolve();
            })
            .on('error', (err) => reject(err));
    });

    // Parse colors
    await new Promise((resolve, reject) => {
        fs.createReadStream(filePath.colors)
            .pipe(csv({ headers: true }))
            .on('data', (data) => colors.push(data))
            .on('end', () => {
                console.log('Colors file successfully processed.');
                console.log('Colors Data:', colors); // Print raw data
                resolve();
            })
            .on('error', (err) => reject(err));
    });


    // Parse subjects
    await new Promise((resolve, reject) => {
        fs.createReadStream(filePath.subjects)
            .pipe(csv({ headers: true }))
            .on('data', (data) => subjects.push(data))
            .on('end', () => {
                console.log('Subjects file successfully processed.');
                console.log('Subjects Data:', subjects); // Print raw data
                resolve();
            })
            .on('error', (err) => reject(err));
    });

    return { episodes, colors, subjects };
};

module.exports = { parseData };
