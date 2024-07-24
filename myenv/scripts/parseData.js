const fs = require('fs');
const csv = require('csv-parser');
const moment = require('moment');

// Parsing colors used csv file
const parseColorsUsed = () => {
    const results = [];
    fs.createReadStream('data/Colors_Used.csv')
        .pipe(csv())
        .on('data', (data) => results.push(data))
        .on('end', () => {
            console.log('Colors Used CSV data:', results);
        });
};

// Parsing Subject MAtters
const parseSubjectMatter = () => {
    const results = [];
    fs.createReadStream('data/Subject_Matter.csv')
        .pipe(csv())
        .on('data', (data) => results.push(data))
        .on('end', () => {
            console.log('Subject Matter CSV data:', results);
        });
}

// Parsing Episodes Dates
const parseEpisodeDates = () => {
    const results = [];
    fs.readFile('data/Episode_Dates.txt', 'utf8', (err, data) => {
        if (err) throw err;
        const lines = data.split('\n');
        lines.forEach(line => {
            const [title, date] = line.split(' (');
            if (title && date) {
                results.push({
                    title: title.replace(/"/g, '').trim(),
                    date: moment(date.replace(')', '').trim(), 'MMMM D, YYYY').format('YYYY-MM-DD')
                });
            }
        });
        console.log('Episode Dates data:', results);
    });
};

parseColorsUsed();
parseSubjectMatter();
parseEpisodeDates();
