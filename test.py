import discord
from discord.ui import button, view
from discord.ext import commands

import pylast
import pandas as pd

import requests_cache

import time
from IPython.display import clear_output
import os
import requests
import json

API_KEY = os.environ['API_KEY']
# USER_AGENT = 'Dataquest'
USER_AGENT = 'Mozilla/5.0'
USERNAME = 'chriswonton'

intent = discord.Intents.default()
intent.members = True
intent.message_content = True

# client = discord.Client(intents = discord.Intents.default())
client = discord.Client(intents=intent)


@client.event
async def on_ready():
  await client.change_presence(activity=discord.Game('wit they worm'))
  print('logged in as {0.user}'.format(client))


@client.event
async def on_message(message):
  if message.author == client.user:
    return
  # print('before if test')
  if message.content.startswith(';hello'):
    # print('sending message hello probably')
    await message.channel.send('hello :3')

  if message.content.startswith(';pleek'):
    # print('sending message hello probably')
    await message.channel.send('atron')

  if message.content.startswith(';act like a'):
    # print('sending message hello probably')
    await message.channel.send('they/them')

  if message.content.startswith(';look like a'):
    # print('sending message hello probably')
    await message.channel.send('she/her')

  if message.content.startswith(';smoke like a'):
    # print('sending message hello probably')
    await message.channel.send('he/him')

  if message.content.startswith('a'):
    # print('sending message hello probably')
    await message.channel.send('xe/xir')

  if message.content.startswith(';julian casablancas'):
    await message.channel.send('He seemed impressed by the way you came in')


def lastfm_get(payload):
  # define headers and URL
  headers = {'user-agent': USER_AGENT}
  url = 'https://ws.audioscrobbler.com/2.0/'

  # add API key and format to the payload
  payload['user'] = USERNAME
  payload['api_key'] = API_KEY
  payload['format'] = 'json'

  response = requests.get(url, headers=headers, params=payload)
  return response


def jprint(obj):
  # create a formatted string of the python JSON object
  text = json.dumps(obj, sort_keys=True, indent=4)
  print(text)

def code_check():
  r = lastfm_get({'method': 'user.getrecenttracks'})
  print(r.status_code)
  jprint(r.json())
  # jprint(r.json())
  # jprint(r.json()['artists']['@attr'])

def create_cache():
  requests_cache.install_cache()
  responses = []
  page = 1
  total_pages = 10
  while page <= total_pages:
    payload = {
        'method': 'user.getrecenttracks',
        'limit': 500,
        'page': page,
    }
    print("Requesting page {}/{}".format(page, total_pages))
    clear_output(wait = True)
    response = lastfm_get(payload)
    if response.status_code != 200:
      print(response.text)
      break
    page = int(response.json()['recenttracks']['@attr']['page'])
    total_pages = int(response.json()['recenttracks']['@attr']['totalPages'])
    responses.append(response)
    if not getattr(response, 'from_cache', False):
            time.sleep(0.5)
    page += 1

  r0 = responses[1]
  r0_json = r0.json()
  r0_track = r0_json['recenttracks']['track']
  r0_df = pd.DataFrame(r0_track)
  r0_df.head()

code_check()
create_cache()


client.run(os.environ['TOKEN'])
# client.run(os.getenv("TOKEN"))
