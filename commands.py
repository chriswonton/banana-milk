import discord
from discord.ui import button, view
from discord.ext import commands

import requests_cache
from urllib.parse import unquote
import codecs

import time
from IPython.display import clear_output
import os
import requests
import json

class commands():

  # Constructor instantializes FM_KEY and USER_AGENT
  def __init__(self):
    self.FM_KEY = os.environ['FM_KEY']
    self.USER_AGENT = 'Mozilla/5.0'


  # API request
  def lastfm_get(self, payload, username):
    # define headers and URL
    headers = {'user-agent': self.USER_AGENT}
    url = 'https://ws.audioscrobbler.com/2.0/'
  
    # add API key and format to the payload
    payload['user'] = username
    payload['api_key'] = self.FM_KEY
    payload['format'] = 'json'
  
    response = requests.get(url, headers=headers, params=payload)
    return response
  

  # API request with time period
  def lastfm_get_time(self, payload, username, period):
    # define headers and URL
    headers = {'user-agent': self.USER_AGENT}
    url = 'https://ws.audioscrobbler.com/2.0/'
  
    # add API key and format to the payload
    payload['user'] = username
    payload['api_key'] = self.FM_KEY
    payload['period'] = period
    payload['format'] = 'json'
  
    response = requests.get(url, headers=headers, params=payload)
    return response
  
  
  # Creates a formatted string of the python JSON object
  def jprint(self, obj):
    text = json.dumps(obj, sort_keys=True, indent=4)
    return text
  

  # Returns a list of commands to the user
  def help(self):
    help = """
    **setup:**
    <:banana_milk:1045928025654575194> `;setfm <last.fm username>` - connect to last.fm

    **recent scrobbles (@user optional):**
    <:banana_milk:1045928025654575194> `;np` - most recently played song
    <:banana_milk:1045928025654575194> `;recent` - 10 last played songs

    **top records (@user and time period optional):**
    <:banana_milk:1045928025654575194> `;toptracks  <week | month | year>` - top 10 tracks
    <:banana_milk:1045928025654575194> `;topartists <week | month | year>` - top 10 artists
    <:banana_milk:1045928025654575194> `;topalbums  <week | month | year>` - top 10 albums
    """
    embed = discord.Embed(title='⚒️ commands', description=help, color=0x0096FF)
    return embed
    
  # Returns most recently played song
  def nowplaying(self, username):
    r = self.lastfm_get({'method': 'user.getrecenttracks'}, username)
    # print(r.status_code)
    track_url = self.jprint(r.json()['recenttracks']['track'][0]['url'])[1:-1]
    track = self.jprint(r.json()['recenttracks']['track'][0]['name'])[1:-1]
    artist = self.jprint(r.json()['recenttracks']['track'][0]['artist']['#text'])[1:-1]
    album = self.jprint(r.json()['recenttracks']['track'][0]['album']['#text'])[1:-1]
    image = self.jprint(r.json()['recenttracks']['track'][0]['image'][3]['#text'])[1:-1]
  
    track = codecs.decode(track, 'unicode_escape')
    # print(track)
    artist = codecs.decode(artist, 'unicode_escape')
    # print(artist)
    album = codecs.decode(album, 'unicode_escape')
    # print(album)
    
    artistResponse = self.lastfm_get({'method': 'artist.getinfo', 'artist': artist}, username)
    artistScrobbles = int(artistResponse.json()['artist']['stats']['userplaycount'])
    
    tracksResponse = self.lastfm_get({'method':'track.getinfo', 'artist': artist, 'track': track}, username)
    # print(jprint(tracksResponse.json()))
    trackScrobbles = tracksResponse.json()['track']['userplaycount']
    
    embed = discord.Embed(
      title=username + ' - now playing:',
      url=track_url,
      # description=desc,
      color=0x2ecc71).set_thumbnail(url=image)
    embed.add_field(name='Track',
                    value=track,
                    inline=True)
    embed.add_field(name='Artist',
                    value=artist,
                    inline=True)
    embed.add_field(name='Album',
                    value=album,
                    inline=False)
    embed.set_footer(text='Track Scrobbles: {} | Artist Scrobbles: {}'.format(trackScrobbles, artistScrobbles))
    return embed
  
  
  # Returns list of recent tracks by track name and artist
  
  def recent(self, username, avatar):
    r = self.lastfm_get({'method': 'user.getrecenttracks'}, username)
    # print(r.status_code)
  
    text = ''
    # jprint(r.json()['recenttracks']['track'][0])
    for i in range(10):
      url = self.jprint(r.json()['recenttracks']['track'][i]['url'])[1:-1]
      track = self.jprint(r.json()['recenttracks']['track'][i]['name'])[1:-1]
      artist = self.jprint(r.json()['recenttracks']['track'][i]['artist']['#text'])[1:-1]
      text += '<:banana_milk:1045928025654575194> **{}. [{}]({})** by **{}**\n'.format(
        str(i + 1), track, url, artist)
  
    desc = codecs.decode(text, 'unicode_escape')
    # https://www.last.fm/user/
    user_url = 'https://www.last.fm/user/{}'.format(username)
    embed = discord.Embed(
      title=(username + ' - recent'),
      url=user_url,
      description=desc,
      color=0x2ecc71
    ).set_thumbnail(
      url=avatar
    )
    return embed
  
  # Returns list of a user's top tracks
  
  def topTracks(self, username, avatar, period):
    r = self.lastfm_get_time({'method': 'user.gettoptracks'}, username, period)
    # print(r.status_code)
    #print(jprint(r.json()['toptracks']['track'][0]))
  
    text = ''
    for i in range(10):
      url = self.jprint(r.json()['toptracks']['track'][i]['url'])[1:-1]
      track = self.jprint(r.json()['toptracks']['track'][i]['name'])[1:-1]
      artist = self.jprint(r.json()['toptracks']['track'][i]['artist']['name'])[1:-1]
      playcount = self.jprint(r.json()['toptracks']['track'][i]['playcount'])[1:-1]
      text += '<:banana_milk:1045928025654575194> **{}. [{}]({})** by **{}** (**{}** scrobbles)\n'.format(
        str(i + 1), track, url, artist, playcount)
  
  
    desc = codecs.decode(text, 'unicode_escape')
    # https://www.last.fm/user/
    user_url = 'https://www.last.fm/user/{}'.format(username)
    embed = discord.Embed(
      title=(username + ' - top tracks'),
      url=user_url,
      description=desc,
      color=0x2ecc71
    ).set_thumbnail(
      url=avatar
    )
    return embed
  
  
  # Returns list of a user's top artists
  
  def topArtists(self, username, avatar, period):
    r = self.lastfm_get_time({'method': 'user.gettopartists'}, username, period)
    # print(r.status_code)
    # print(jprint(r.json()['topalbums']['album'][0]))
  
    text = ''
    for i in range(10):
      url = self.jprint(r.json()['topartists']['artist'][i]['url'])[1:-1]
      artist = self.jprint(r.json()['topartists']['artist'][i]['name'])[1:-1]
      playcount = self.jprint(r.json()['topartists']['artist'][i]['playcount'])[1:-1]
      text += '<:banana_milk:1045928025654575194> **{}. [{}]({})** (**{}** scrobbles)\n'.format(
        str(i + 1), artist, url, playcount)
  
    desc = codecs.decode(text, 'unicode_escape')
    # https://www.last.fm/user/
    user_url = 'https://www.last.fm/user/{}'.format(username)
    embed = discord.Embed(
      title=(username + ' - top artists'),
      url=user_url,
      description=desc,
      color=0x2ecc71
    ).set_thumbnail(
      url=avatar
    )
    return embed
  
  
  # Returns list of a user's top albums
  
  def topAlbums(self, username, avatar, period):
    r = self.lastfm_get_time({'method': 'user.gettopalbums'}, username, period)
    # print(r.status_code)
    # print(jprint(r.json()['topalbums']['album'][0]))
  
    text = ''
    for i in range(10):
      url = self.jprint(r.json()['topalbums']['album'][i]['url'])[1:-1]
      album = self.jprint(r.json()['topalbums']['album'][i]['name'])[1:-1]
      artist = self.jprint(r.json()['topalbums']['album'][i]['artist']['name'])[1:-1]
      playcount = self.jprint(r.json()['topalbums']['album'][i]['playcount'])[1:-1]
      text += '<:banana_milk:1045928025654575194> **{}. [{}]({})** by **{}** (**{}** scrobbles)\n'.format(
        str(i + 1), album, url, artist, playcount)
  
    desc = codecs.decode(text, 'unicode_escape')
  
    user_url = 'https://www.last.fm/user/{}'.format(username)
    embed = discord.Embed(
      title=(username + ' - top albums'),
      url=user_url,
      description=desc,
      color=0x2ecc71
    ).set_thumbnail(
      url=avatar
    )
    return embed


  # ---------- TODO -----------
    
  # Returns all users within server with track scrobbles
  def whoKnowsTracks(self, serverID):
    print('wkt')

  # Returns all users within server with artist scrobbles
  def whoKnowsArtist(self, serverID):
    print('wk')

  # Returns all users within server with album scrobbles
  def whoKnowsAlbum(self, serverID):
    print('wka')

  # Creates a playlist and adds to the playlist DB
  def createPlaylist(self, serverID):
    print('playlist createed')

  # Adds to an existing playlist
  def addSong(self, song, serverID):
    print('added to playlist')

  # Removes from existing playlist
  def removeSong(self, song, serverID):
    print('removed from playlist')