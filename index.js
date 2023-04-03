const { Client, IntentsBitField, Collection} = require('discord.js');
const intents = new IntentsBitField(3276799)
const bot = new Client({intents});
const loadCommands = require('./Loader/loadCommands');
const loadEvents = require('./Loader/loadEvents');
const ready = require('./Events/ready');
const config = require('./config.js');

bot.commands = new Collection()
bot.color = "#0062DA"
bot.colorv = "#2BDA00"
bot.colorr = "#DA0000"
bot.coloro = "#DA8E00"

bot.login(config.token)
loadCommands(bot)
loadEvents(bot)