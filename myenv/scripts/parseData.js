const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');

const parseData = async (client) => { // Added `client` parameter for database connection
    const episodes = {};
    const subjects = [];
    const colors = [];

    const filePath = {
        episodes: path.join(__dirname, '../data/Episode_Dates.txt'),
        colors: path.join(__dirname, '../data/Colors_Used.csv'),
        subjects: path.join(__dirname, '../data/Subject_Matter.csv')
    };

    const insertEpisode = async (episodeData) => {
        const { title, date, painting_index, season, episode } = episodeData;

        const query = `
            INSERT INTO episodes (date, title, painting_index, season, episode) 
            VALUES ($1, $2, $3, $4, $5)
            ON CONFLICT (painting_index) 
            DO UPDATE SET
                date = EXCLUDED.date,
                title = EXCLUDED.title,
                season = EXCLUDED.season,
                episode = EXCLUDED.episode
        `;

        const values = [
            date || null,
            title || null,
            painting_index || null,
            season || null,
            episode || null
        ];

        try {
            const result = await client.query(query, values);
            console.log('Insert result:', result);
        } catch (err) {
            console.error('Error inserting data:', err);
        }
    };

    // Parse episodes
    await new Promise((resolve, reject) => {
        fs.createReadStream(filePath.episodes, 'utf8')
            .on('data', (chunk) => {
                let id = 1;
                chunk.split('\n').forEach(line => {
                    if (line.trim()) {
                        const title = line.split(' (')[0].replace(/"/g, '').trim();
                        const date = line.split(' (')[1]?.split(' Special guest')[0].replace(/\)/g, '').trim();
                        if (title && date) {
                            episodes[id] = { title, date };
                        }
                    }
                    id++;
                });
            })
            .on('end', async () => {
                // console.log('Episodes text file successfully processed.');
                // console.log('Episodes Data:', episodes);
                // Insert episodes into the database
                // for (const episode of episodes) {
                //     await insertEpisode(episode);
                // }
                resolve();
            })

            .on('error', (err) => reject(err));
    });

    // Parse colors
    await new Promise((resolve, reject) => {
        fs.createReadStream(filePath.colors)
            .pipe(csv({ headers: true, relax: true }))
            .on('data', (data) => {
                colors.push(data)
            })
            .on('end', () => {
                let ep_id = 0;
                console.log('log of color data:', colors[2]['_'+3]);
              
                while (ep_id < 403) {
                    var rowColors = [];
                    let index = 10; 
                    // console.log(colors[ep_id]);
                   
                    while (index < 28) {
                        // console.log(rowObject['_'+index]);
                        if (colors[ep_id]['_'+index] == '1') {
                            rowColors.push(index-9);
                        }
                        index++;
                    }
                   
                    episodes[ep_id] = {...episodes[ep_id],rowColors, 'season': colors[ep_id]['_'+4], 'painting_index': colors[ep_id]['_'+1], 'episode': colors[ep_id]['_'+5]};
                    ep_id++;
                }

                console.log('Colors file successfully processed.');
                // console.log('Colors Data:', episodes); // Print raw data
                console.log(typeof colors);
                resolve();

            })
            .on('error', (err) => reject(err));
    })


// Parse subjects
await new Promise((resolve, reject) => {
    fs.createReadStream(filePath.subjects)
        .pipe(csv({ headers: true }))
        .on('data', (data) => subjects.push(data))
        .on('end', () => {
            let ep_id = 0;
            console.log('log of subjects data:', subjects[2]['_'+3]);
          
            while (ep_id < 403) {
                var rowSubjects = [];
                let index = 2; 
                // console.log(colors[ep_id]);
               
                while (index < 68) {
                    // console.log(rowObject['_'+index]);
                    if (subjects[ep_id]['_'+index] == '1') {
                        rowSubjects.push(index-1);
                    }
                    index++;
                }
               
                episodes[ep_id] = {...episodes[ep_id],rowSubjects};
                ep_id++;
            }
            resolve();
            // console.log(episodes);
        })
        .on('error', (err) => reject(err));
    });

return { episodes };
};


module.exports = { parseData };
