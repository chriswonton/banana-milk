import discord
from discord.ui import button, view
from discord.ext import commands
import os
import requests
import json

API_KEY = os.environ['API_KEY']
USER_AGENT = 'Dataquest'

headers = {
  'user-agent': USER_AGENT
}

payload = {
  'api_key': API_KEY,
  'method': 'chart.gettopartists',
  'format': 'json'
}

intent = discord.Intents.default()
intent.members = True
intent.message_content = True

# client = discord.Client(intents = discord.Intents.default())
client = discord.Client(intents=intent)

@client.event
async def on_ready():
  await client.change_presence(activity = discord.Game('wit they worm'))
  print('logged in as {0.user}'.format(client))

@client.event
async def on_message(message):
  if message.author == client.user:
    return
  # print('before if test')
  if message.content.startswith('$hello'):
    # print('sending message hello probably')
    await message.channel.send('hello :3')

def lastfm_get(payload):
  # define headers and URL
  headers = {'user-agent': USER_AGENT}
  url = 'https://ws.audioscrobbler.com/2.0/'

  # add API key and format to the payload
  payload['api_key'] = API_KEY
  payload['format'] = 'json'

  response = requests.get(url, headers=headers, params=payload)
  return response

def jprint(obj):
  # create a formatted string of the python JSON object
  text = json.dumps(obj, sort_keys = True, indent = 4)
  print(text)

def last_fm_test():
  r = lastfm_get({
    'method': 'chart.gettopartists'
  })
  # print(r.status_code)
  jprint(r.json()['artists']['@attr'])

last_fm_test()

client.run(os.environ['TOKEN'])
# client.run(os.getenv("TOKEN"))