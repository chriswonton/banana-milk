const fetch = require("node-fetch");
const apiKey = '';
const rootURL = 'http://ws.audioscrobbler.com/2.0';
const Fuse = require("fuse.js");

// Handles errors.
async function error(channel, errorTitle, errorDescription) {
    return channel.send({ embeds: [
        {
            title: `❌ error: ${errorTitle}`,
            description: `<:banana_milk:1045928025654575194> ${errorDescription}`,
            color: '0xff0000',
            thumbnail: { url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f6/HAL9000.svg/1024px-HAL9000.svg.png'}
        }
    ]});
}

// Get Last.FM username from DB by Discord user ID.
async function lfmGetUsername(userID, db) {
    let dbEntry = await Promise.resolve(db.db('BananaMilk').collection('users').findOne({ userID: userID }));
    return dbEntry?.lastFMUser;
}

// Gets the User object from Last.FM API.
async function lfmGetUser(lastFMUser) {
    let response = await fetch(`${rootURL}/?method=user.getinfo&user=${lastFMUser}&api_key=${apiKey}&format=json`);
    let data = await response.json();
    return data.user;
}

// Gets most recent plays from Last.FM per user.
async function lfmGetRecent(lastFMUser) {
    let response = await fetch(`${rootURL}/?method=user.getrecenttracks&user=${lastFMUser}&api_key=${apiKey}&format=json`);
    let data = await response.json();
    return data.recenttracks.track;
}

// Gets a user's now playing track.
async function lfmGetNowPlaying(lastFMUser) {
    let recent = await lfmGetRecent(lastFMUser);
    return recent[0];
}

// Gets track info by user.
async function lfmGetTrackInfo(lastFMUser, artist, track) {
    let response = await fetch(`${rootURL}/?method=track.getinfo&api_key=${apiKey}&artist=${artist.replace(`&`, `\%26`)}&track=${track.replace(`&`, `\%26`)}&user=${lastFMUser}&format=json`);
    let data = await response.json();
    return data.track;
}

// Gets artist info by user.
async function lfmGetArtistInfo(lastFMUser, artist) {
    let response = await fetch(`${rootURL}/?method=artist.getinfo&api_key=${apiKey}&artist=${artist}&user=${lastFMUser}&format=json`);
    let data = await response.json();
    return data.artist;
}

// Gets album info by user.
async function lfmGetAlbumInfo(lastFMUser, artist, album) {
    let response = await fetch(`${rootURL}/?method=album.getinfo&api_key=${apiKey}&artist=${artist}&album=${album}&user=${lastFMUser}&format=json`);
    let data = await response.json();
    return data.album;
}

// Gets top tracks per user.
async function lfmGetTop(lastFMUser, period, type) {
    let response = await fetch(`${rootURL}/?method=user.gettop${type}&user=${lastFMUser}&period=${period}&api_key=${apiKey}&format=json`);
    let data = await response.json();
    // console.log(data);
    if (type == 'tracks') return data.toptracks.track;
    if (type == 'artists') return data.topartists.artist;
    if (type == 'albums') return data.topalbums.album;
}

// Gets specified artist info.
async function lfmArtistSearch(artist) {
    let response = await fetch(`${rootURL}/?method=artist.search&artist=${artist}&api_key=${apiKey}&format=json`);
    let data = await response.json();
    const options = {
        includeScore: true,
        keys: ['name']
    }
    const fuse = new Fuse(data.results.artistmatches.artist, options)
    const result = fuse.search(artist);
    return result[0].item;
}

// Gets specified track info.
async function lfmTrackSearch(track, artist) {
    let response = await fetch(`${rootURL}/?method=track.search&track=${track}&artist=${artist}&api_key=${apiKey}&format=json`);
    let data = await response.json();
    const options = {
        includeScore: true,
        keys: ['name']
    }
    const fuse = new Fuse(data.results.trackmatches.track, options)
    const result = fuse.search(track);
    return result[0].item;
}

// Gets specified album info
async function lfmAlbumSearch(album, artist) {
    let response = await fetch(`${rootURL}/?method=album.search&album=${album}&artist=${artist}&api_key=${apiKey}&format=json`);
    let data = await response.json();
    const options = {
        includeScore: true,
        keys: ['name']
    }
    const fuse = new Fuse(data.results.albummatches.album, options)
    const result = fuse.search(album);
    return result[0].item;
}

module.exports = { error, lfmGetUsername, lfmGetUser, lfmGetRecent, lfmGetNowPlaying, lfmGetTrackInfo, lfmGetArtistInfo, lfmGetAlbumInfo, lfmGetTop, lfmArtistSearch, lfmTrackSearch, lfmAlbumSearch }