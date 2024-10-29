
const fs = require('fs/promises')
const fsSync = require('fs')
const path = require('path')
const readline = require('node:readline')
const stream = require("stream")
const { pipeline } = require('node:stream/promises');

async function begin() {

    let editionsJSON = await fetch('https://cdn.jsdelivr.net/gh/fawazahmed0/quran-api@1/editions.min.json').then(res => res.json())
    for (let editionVal of Object.values(editionsJSON)) {
        let text = await fetch(editionVal.linkmin).then(res => res.json())
        await saveNDJSON('./quran-dataset.jsonl', text.quran.map(e => ({ ...e, ...editionVal })), true)
    }
}
begin()

// the json should be in records format i.e [{column1:value,column2:value},{column1:value,column2:value},...]
async function saveNDJSON(pathToSave, json, append = false) {
    await pipeline(
        stream.Readable.from(json.map(e => JSON.stringify(e) + '\n')),
        fsSync.createWriteStream(pathToSave, { flags: append ? 'a' : 'w' }),
    )
}

async function getNDJSON(pathToNDJSON) {
    let arr = []
    const rl = readline.createInterface({
        input: fsSync.createReadStream(pathToNDJSON),
        crlfDelay: Infinity,
    })
    for await (const line of rl)
        arr.push(JSON.parse(line))
    return arr
}