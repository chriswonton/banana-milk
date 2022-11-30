import discord
# from discord.ui import button, view
# from discord.ext import commands

# import requests_cache
# from urllib.parse import unquote
# import codecs

# import time
# from IPython.display import clear_output
import os
# import requests
# import json

# ---------- API and Database Setup ----------
# FM_KEY = os.environ['FM_KEY']
# USER_AGENT = 'Mozilla/5.0'

intent = discord.Intents.default()
intent.members = True
intent.message_content = True
client = discord.Client(intents=intent)

# Creating DB connection to set user & last fm
from dbManager import dbManager

dbTest = dbManager()
# dbTest.dropTable('UserAccounts')
# dbTest.setupTables()
# dbTest.listRecords('UserAccounts')


# ---------- Discord Bot Implementation ----------
from commands import commands
command = commands()

@client.event
async def on_ready():
  await client.change_presence(activity=discord.Game('wit they worm'))
  print('logged in as {0.user}'.format(client))

# Banana milk bot responds based on message content
@client.event
async def on_message(message):
  msg = message.content.split(' ')

  # try:
  if message.author == client.user:
    return

  if message.content.lower().startswith(';tables'):
    dbTest.listRecords('UserAccounts')

  if message.content.lower().startswith('<@1044862454196355133>'):
    await message.channel.send(embed=discord.Embed(
      title='🍌 welcome to banana milk!',
      description=
      '<:banana_milk:1045928025654575194> get started with `;setfm`\n<:banana_milk:1045928025654575194> for a list of commands, use `;help`',
      color=0xc08c3c).set_thumbnail(
        url='https://cdn.discordapp.com/emojis/856757292074401812.png'))

  if message.content.lower().startswith(';help'):
    await message.channel.send(embed=command.help())

  if message.content.lower().startswith(';setfm'):
    if len(msg) > 1:
      username = msg[1]
      r = command.lastfm_get({'method': 'user.getinfo'}, username)
      # print(jprint(r.json()))
      avatar = r.json()['user']['image'][3]['#text']
      if dbTest.selectFromUserTable(message.author.id) == 0:
        dbTest.insertIntoUserTable(message.author.id, username)
      else:
        dbTest.updateLastFmUser(message.author.id, username)
      await message.channel.send(embed=discord.Embed(
        title='last.fm connection success',
        description='account set to `{}`'.format(username),
        color=0x2ecc71).set_thumbnail(url=avatar))
      # await message.channel.send(message.guild.id)
    else:
      await message.channel.send(embed=discord.Embed(
        title='❌ error: invalid input',
        description=
        '<:banana_milk:1045928025654575194> invalid username or nonexistent user!\n<:banana_milk:1045928025654575194> please connect to last.fm using `;setfm <last.fm username>`',
        color=0xFF0000))

  if message.content.lower().startswith(';np'):
    # print('np')
    username = (dbTest.selectFromUserTable(message.author.id))
    if len(msg) > 1:
      if msg[1].startswith('<'):
        userID = msg[1].replace('<', '').replace('@', '').replace('>', '')
        username = (dbTest.selectFromUserTable(userID))
    npMessage = await message.channel.send(embed=command.nowplaying(username))
    await npMessage.add_reaction('👍')
    await npMessage.add_reaction('👎')

  if message.content.lower().startswith(';recent'):
    # print('recent')
    username = (dbTest.selectFromUserTable(message.author.id))
    avatar = message.author.display_avatar.url
    # TODO: use mentions[0] instead of startswith('<')
    if len(msg) > 1:
      if msg[1].startswith('<'):
        userID = msg[1].replace('<', '').replace('@', '').replace('>', '')
        username = (dbTest.selectFromUserTable(userID))
        avatar = message.mentions[0].display_avatar.url
    await message.channel.send(embed=command.recent(username, avatar))

  if message.content.lower().startswith(';toptracks'):
    # print('top tracks')
    username = (dbTest.selectFromUserTable(message.author.id))
    avatar = message.author.display_avatar.url
    if len(msg) == 2:
      if msg[1].startswith('<'):
        userID = msg[1].replace('<', '').replace('@', '').replace('>', '')
        username = (dbTest.selectFromUserTable(userID))
        avatar = message.mentions[0].display_avatar.url
        await message.channel.send(embed=command.topTracks(username, avatar, 'overall'))
    if len(msg) > 2:
      if msg[2].startswith('<'):
        userID = msg[2].replace('<', '').replace('@', '').replace('>', '')
        username = (dbTest.selectFromUserTable(userID))
        avatar = message.mentions[0].display_avatar.url
    if len(msg) > 1:
      if msg[1] == 'week':
        await message.channel.send(embed=command.topTracks(username, avatar, '7day'))
      if msg[1] == 'month':
        await message.channel.send(embed=command.topTracks(username, avatar, '1month'))
      if msg[1] == '3':
        await message.channel.send(embed=command.topTracks(username, avatar, '3month'))
      if msg[1] == 'year':
        await message.channel.send(embed=command.topTracks(username, avatar, '12month'))
    else:
      await message.channel.send(embed=command.topTracks(username, avatar, 'overall'))

  if message.content.lower().startswith(';topartists'):
    # print('top artists')
    username = (dbTest.selectFromUserTable(message.author.id))
    avatar = message.author.display_avatar.url
    if len(msg) == 2:
      if msg[1].startswith('<'):
        userID = msg[1].replace('<', '').replace('@', '').replace('>', '')
        username = (dbTest.selectFromUserTable(userID))
        avatar = message.mentions[0].display_avatar.url
        await message.channel.send(embed=command.topArtists(username, avatar, 'overall'))
    if len(msg) > 2:
      if msg[2].startswith('<'):
        userID = msg[2].replace('<', '').replace('@', '').replace('>', '')
        username = (dbTest.selectFromUserTable(userID))
        avatar = message.mentions[0].display_avatar.url
    if len(msg) > 1:
      if msg[1] == 'week':
        await message.channel.send(embed=command.topArtists(username, avatar, '7day'))
      if msg[1] == 'month':
        await message.channel.send(embed=command.topArtists(username, avatar, '1month'))
      if msg[1] == '3':
        await message.channel.send(embed=command.topArtists(username, avatar, '3month'))
      if msg[1] == 'year':
        await message.channel.send(embed=command.topArtists(username, avatar, '12month'))
    else:
      await message.channel.send(embed=command.topArtists(username, avatar, 'overall'))

  if message.content.lower().startswith(';topalbums'):
    # print('top albums')
    username = (dbTest.selectFromUserTable(message.author.id))
    avatar = message.author.display_avatar.url
    if len(msg) > 1:
      if len(msg) == 2:
        if msg[1].startswith('<'):
          userID = msg[1].replace('<', '').replace('@', '').replace('>', '')
          username = (dbTest.selectFromUserTable(userID))
          avatar = message.mentions[0].display_avatar.url
          await message.channel.send(embed=command.topAlbums(username, avatar, 'overall'))
      if len(msg) > 2:
        if msg[2].startswith('<'):
          userID = msg[2].replace('<', '').replace('@', '').replace('>', '')
          username = (dbTest.selectFromUserTable(userID))
          avatar = message.mentions[0].display_avatar.url
      if msg[1] == 'week':
        await message.channel.send(embed=command.topAlbums(username, avatar, '7day'))
      if msg[1] == 'month':
        await message.channel.send(embed=command.topAlbums(username, avatar, '1month'))
      if msg[1] == '3':
        await message.channel.send(embed=command.topAlbums(username, avatar, '3month'))
      if msg[1] == 'year':
        await message.channel.send(embed=command.topAlbums(username, avatar, '12month'))
    else:
      await message.channel.send(embed=command.topAlbums(username, avatar, 'overall'))

  # except Exception as e:
  #   await message.channel.send(embed=discord.Embed(
  #     title='❌ error: invalid input',
  #     description=
  #     '<:banana_milk:1045928025654575194> invalid username or nonexistent user!\n<:banana_milk:1045928025654575194> please connect to last.fm using `;setfm <last.fm username>`',
  #     color=0xFF0000))
  #   print(e)

client.run(os.environ['FM_TOKEN'])
