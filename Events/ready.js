const Discord = require('discord.js');
const loadSlashCommand = require('../Loader/loadSlashCom');

module.exports = async bot => {

    await loadSlashCommand(bot)
    console.log(`${bot.user.tag} is now online!`);

}
