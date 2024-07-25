const fs = require('fs');
const csv = require('csv-parser');
const moment = require('moment');

// Parsing colors used csv file
const parseColorsUsed = () => {
    return new Promise((resolve, reject) => {
        const results = [];
        fs.createReadStream('/home/moonwalker/Atlas-T4_Projects/atlas-the-joy-of-painting-api/myenv/data/Colors_Used.csv')
            .pipe(csv())
            .on('data', (data) => results.push(data))
            .on('end', () => {
                console.log('Colors Used CSV data:', results);
                resolve(results);
            })
            .on('error', (error) => reject(error));
    });
};

// Parsing Subject Matters
const parseSubjectMatter = () => {
    return new Promise((resolve, reject) => {
        const results = [];
        fs.createReadStream('/home/moonwalker/Atlas-T4_Projects/atlas-the-joy-of-painting-api/myenv/data/Subject_Matter.csv')
            .pipe(csv())
            .on('data', (data) => results.push(data))
            .on('end', () => {
                console.log('Subject Matters CSV data:', results);
                resolve(results);
            })
            .on('error', (error) => reject(error));
    });
};

// Parsing Episodes Dates
const parseEpisodeDates = () => {
    return new Promise((resolve, reject) => {
        const results = [];
        fs.readFile('/home/moonwalker/Atlas-T4_Projects/atlas-the-joy-of-painting-api/myenv/data/Episode_Dates.txt', 'utf8', (err, data) => {
            if (err) return reject(err);
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
            resolve(results);
        });
    });
};

const parseData = async () => {
    const colorsUsed = await parseColorsUsed();
    const subjectmatter = await parseSubjectMatter();
    const episodeDates = await parseEpisodeDates();

    const combinedData = colorsUsed.map(color => {
        const episodeDate = episodeDates.find(episode => episode.title === color['painting_title']);
        const subject = subjectmatter.find(subject => subject.title === color['painting_title']);
        return {
            ...color,
            date: episodeDate ? episodeDate.date : null,
            subject: subject ? subject : {}
        };
    });

    return combinedData;
};

// export functions
module.exports = { parseData };
