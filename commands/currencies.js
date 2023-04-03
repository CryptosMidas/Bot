const { EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder } = require('discord.js');
require('dotenv').config();
const path = require('path');
const fs = require('fs');
const filePath = path.join(__dirname, '..', 'cache.json');
const datas = fs.readFileSync(filePath);
const cache = JSON.parse(datas);

module.exports = {
  name: 'currencies',
  description: 'Affiche les cryptos que support le bot',
  permission: 'Aucune',
  dm: true,
  category: 'Autre',

  async run(bot, interaction) {
    try {

 
      const tokensInfo = cache.tokensinfo;
  
      tokensInfo.sort((a, b) => a.rank - b.rank);
      
      let theembed = new EmbedBuilder()
        .setTitle('Liste des cryptomonnaies')
        .setColor(bot.color);
  

        const fields = tokensInfo.map(token => {
          return `<:${token.symbol}:${token.emoji}> **${token.name}** (${token.symbol})`;
        });
        const FF1 = fields.slice(0, 15).join('\n')
        const FF2 = fields.slice(15, 30).join('\n')
        const FF3 = fields.slice(30, 45).join('\n')
        const FF4 = fields.slice(45, 60).join('\n')
        const FF5 = fields.slice(60, 75).join('\n')
        const FF6 = fields.slice(75, 90).join('\n')
        const FF7 = fields.slice(90, 105).join('\n')
        //const FF8 = fields.slice(105, 120).join('\n')
  
        theembed.addFields(
          { name: " ", value: FF1, inline: true  },
          { name: " ", value: FF2, inline: true },
          { name: " ", value: FF3, inline: true },
          { name: " ", value: FF4, inline: true },
          { name: " ", value: FF5, inline: true },
          { name: " ", value: FF6, inline: true },
          { name: " ", value: FF7, inline: true }
          );

      
    const menu = new ActionRowBuilder().addComponents(
      new StringSelectMenuBuilder()
        .setCustomId("testmenu")
        .setPlaceholder("Choisissez le reseau")
        .addOptions(
          {
            label: "Toutes les Cryptos",
            value: "All"
          },
          {
            label: "Polygon",
            value: "Polygon"
          },
          {
            label: "Binance Smart Chain",
            value: "BSC"
          },
          {
            label: "Ethereum",
            value: "ETH"
          }
        )
    );
    
    const msg = await interaction.reply({ embeds: [theembed], components: [menu] });
    
    const filter = i => (i.customId === 'testmenu') && i.user.id === interaction.user.id;
    const collector = msg.createMessageComponentCollector({ filter, time: 60000 });
    
    collector.on('collect', async i => {
      if (i.values[0] === 'All') {

        await i.deferUpdate();

        theembed = new EmbedBuilder()
        .setTitle('Liste des cryptomonnaies')
        .setColor(bot.color);
  

        const fields = tokensInfo.map(token => {
          return `<:${token.symbol}:${token.emoji}> **${token.name}** (${token.symbol})`;
        });
        const FF1 = fields.slice(0, 15).join('\n')
        const FF2 = fields.slice(15, 30).join('\n')
        const FF3 = fields.slice(30, 45).join('\n')
        const FF4 = fields.slice(45, 60).join('\n')
        const FF5 = fields.slice(60, 75).join('\n')
        const FF6 = fields.slice(75, 90).join('\n')
        const FF7 = fields.slice(90, 105).join('\n')
        //const FF8 = fields.slice(105, 120).join('\n')
  
        theembed.addFields(
          { name: " ", value: FF1, inline: true  },
          { name: " ", value: FF2, inline: true },
          { name: " ", value: FF3, inline: true },
          { name: " ", value: FF4, inline: true },
          { name: " ", value: FF5, inline: true },
          { name: " ", value: FF6, inline: true },
          { name: " ", value: FF7, inline: true }
          );

        await i.editReply({ embeds: [theembed], components: [menu] });


      }else if (i.values[0] === 'Polygon') {


        await i.deferUpdate();

        const tokensInfoavant = cache.tokensinfo;
        const tokensInfo = tokensInfoavant.filter(token => token.reseau.Polygon === true);
        tokensInfo.forEach((a, b) => a.rank - b.rank);
        
        theembed = new EmbedBuilder()
          .setTitle('Liste des cryptomonnaies sur Polygon')
          .setColor(bot.color);
    
  
          const fields = tokensInfo.map(token => {
            return `<:${token.symbol}:${token.emoji}> **${token.name}** (${token.symbol})`;
          });
          const FF1 = fields.slice(0, 15).join('\n')
        const FF2 = fields.slice(15, 30).join('\n')
        const FF3 = fields.slice(30, 45).join('\n')
        const FF4 = fields.slice(45, 60).join('\n')
        /*const FF5 = fields.slice(60, 75).join('\n')
        const FF6 = fields.slice(75, 90).join('\n')*/
  
        theembed.addFields(
          { name: " ", value: FF1, inline: true  },
          { name: " ", value: FF2, inline: true },
          { name: " ", value: FF3, inline: true },
          { name: " ", value: FF4, inline: true },
          /*{ name: " ", value: FF5, inline: true },
          { name: " ", value: FF6, inline: true }*/
          );

    await i.editReply({ embeds: [theembed], components: [menu] });


      } else if (i.values[0] === 'BSC') {


        
        await i.deferUpdate();

        const tokensInfoavant = cache.tokensinfo;
        const tokensInfo = tokensInfoavant.filter(token => token.reseau.BSC === true);
  
        tokensInfo.forEach((a, b) => a.rank - b.rank);
        
        theembed = new EmbedBuilder()
          .setTitle('Liste des cryptomonnaies sur Binance Smart Chain')
          .setColor(bot.color);
    
  
          const fields = tokensInfo.map(token => {
            return `<:${token.symbol}:${token.emoji}> **${token.name}** (${token.symbol})`;
          });
          const FF1 = fields.slice(0, 15).join('\n')
        const FF2 = fields.slice(15, 30).join('\n')
        const FF3 = fields.slice(30, 45).join('\n')
        /*const FF4 = fields.slice(45, 60).join('\n')
        const FF5 = fields.slice(60, 75).join('\n')
        const FF6 = fields.slice(75, 90).join('\n')*/
  
        theembed.addFields(
          { name: " ", value: FF1, inline: true  },
          { name: " ", value: FF2, inline: true },
          { name: " ", value: FF3, inline: true },
          /*{ name: " ", value: FF4, inline: true },
          { name: " ", value: FF5, inline: true },
          { name: " ", value: FF6, inline: true }*/
          );

    await i.editReply({ embeds: [theembed], components: [menu] });





      }else if (i.values[0] === 'ETH') {


        await i.deferUpdate();

        const tokensInfoavant = cache.tokensinfo;
        const tokensInfo = tokensInfoavant.filter(token => token.reseau.ETH === true);
        tokensInfo.forEach((a, b) => a.rank - b.rank);
        
        theembed = new EmbedBuilder()
          .setTitle('Liste des cryptomonnaies sur Ethereum')
          .setColor(bot.color);
    
  
          const fields = tokensInfo.map(token => {
            return `<:${token.symbol}:${token.emoji}> **${token.name}** (${token.symbol})`;
          });
          const FF1 = fields.slice(0, 15).join('\n')
        const FF2 = fields.slice(15, 30).join('\n')
        const FF3 = fields.slice(30, 45).join('\n')
        /*const FF4 = fields.slice(45, 60).join('\n')
        const FF5 = fields.slice(60, 75).join('\n')
        const FF6 = fields.slice(75, 90).join('\n')*/
  
        theembed.addFields(
          { name: " ", value: FF1, inline: true  },
          { name: " ", value: FF2, inline: true },
          { name: " ", value: FF3, inline: true },
          /*{ name: " ", value: FF4, inline: true },
          { name: " ", value: FF5, inline: true },
          { name: " ", value: FF6, inline: true }*/
          );

    await i.editReply({ embeds: [theembed], components: [menu] });


      }


    });

    
collector.on('end', async () => 
{
  await interaction.editReply({ embeds: [theembed], components: [] });
}
);






    } catch (error) {
      console.error(error);
      const embed = new EmbedBuilder()
        .setTitle('Erreur')
        .setDescription('Il y a eu une erreur lors de la récupération de votre balance.')
        .setColor('#FF0000');
      await interaction.reply({ embeds: [embed] });
    }
  }
  
};
