
const request = require('request-promise-native');
const xml = require('xml2js');

async function getPage(page_title) {
    const data = JSON.parse(await request(`https://simple.wikipedia.org/w/api.php?action=parse&page=${page_title}&format=json`));
    return data.parse.text["*"];
}

async function runFetcher() {
    const args = process.argv.slice(2);
    for(val of args) {
        console.log(val);
        console.log(await getPage(val));
    }
    
}

runFetcher();

/* https://simple.wikipedia.org/w/api.php?action=query&prop=revisions&rvlimit=1&rvprop=content&format=xml&titles=Food_web&rvslots=main */