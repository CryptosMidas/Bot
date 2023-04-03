const {EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle} = require('discord.js');
const mysql = require('mysql2/promise');
const Web3 = require('web3');
const web3 = new Web3('https://polygon-rpc.com/');
const axios = require("axios");
const fs = require('fs');
require('dotenv').config();
const { abi } = require('../config.js');
const path = require('path');

module.exports = {
  name: "withdraw",
  description : "Withdraw",
  permission: "Aucune",
  dm: true,
  category : "Economie",
  options: [
    {
      type: "string",
      name: "crypto",
      description: "The crypto you want to withdraw",
      required: true,
      autocomplete: true,

    },
    {
      type: "number",
      name: "amount",
      description: "The amount",
      required: true,
      autocomplete: true
    },
    {
      type: "string",
      name: "address",
      description: "The address",
      required: true,
      autocomplete: true

    }
  ],

  async run(bot, interaction) {
    try {



 
      const db = await mysql.createConnection({ 
        host: process.env.DB_HOST, 
        user: process.env.DB_USER, 
        password: process.env.DB_PASSWORD, 
        database: process.env.DB_DATABASE 
      });


      // Vérifier si l'utilisateur a une clé privée et publique enregistrée
      const [wallets] = await db.execute(`SELECT * FROM wallets WHERE id = '${interaction.user.id}'`);

      // Vérifier que les arguments nécessaires ont été fournis
      const filePath = path.join(__dirname, '..', 'cache.json');
      const datas = fs.readFileSync(filePath);
      const cache = JSON.parse(datas);
      const tokensInfo = cache.tokensinfo;

      const crypto = interaction.options.getString('crypto');
      const amount = interaction.options.getNumber('amount');
      const address = interaction.options.getString('address');
      if (!crypto || !amount || !address) {
        const embed = new EmbedBuilder()
          .setTitle('Erreur')
          .setDescription('Vous devez spécifier la crypto-monnaie, la somme et l\'adresse de dépôt.')
          .setColor(bot.colorr);
        await interaction.reply({ embeds: [embed], ephemeral: true });
        await db.end();
        return;
      }

      // Récupérer la clé privée de l'utilisateur
      const privateKey = wallets[0].privateKey;

      // Effectuer la transaction
      let cryptoaddress = tokensInfo.find((balance) => balance.symbol === crypto)?.address || 0;
      
      const contract = new web3.eth.Contract(abi, cryptoaddress);
      const decimals = await contract.methods.decimals().call();
      const value = web3.utils.toBN(amount * Math.pow(10, decimals));
      const gasPrice = await web3.eth.getGasPrice();
      //const gasLimit = crypto === "MATIC" ? 21000 : 100000;
      const gasLimit = await contract.methods.transfer(address, value.toString()).estimateGas({from: wallets[0].address});
      const gasCost = (gasPrice * gasLimit)/Math.pow(10, 18)
      
      const transactionMain = {
        to: address,
        value: value.toString(),
        gasLimit: gasLimit,
        gasPrice: gasPrice,
    
        };

      const transactionSecond = {
      from: wallets[0].address, // Adresse de l'expéditeur
      to: cryptoaddress, // Adresse du contrat USDT
      gasPrice: gasPrice,
      gasLimit: gasLimit, // Limite de gaz estimée
      data: contract.methods.transfer(address, value.toString()).encodeABI() // Encodage de la fonction transfer() avec les arguments nécessaires
    };


let transaction = transactionSecond
if(crypto === "MATIC"){
  console.log("MMAATIICC")
  transaction = transactionMain

}
// Demander à l'utilisateur de confirmer la transaction

const embed0 = new EmbedBuilder()
.setTitle('Veuillez vérifier les informations de la transaction')
.setDescription(`\nMontant: ${amount} ${crypto}\nAdresse: ${address} \nEstimation frais de transaction: ${gasCost} MATIC`)
.setColor(bot.coloro);

const rowa = new ActionRowBuilder()
  .addComponents(
    new ButtonBuilder()
      .setCustomId('accept')
      .setLabel('Valider')
      .setStyle(ButtonStyle.Success)
      .setEmoji("✔️")
  );

  const rowr = new ActionRowBuilder()
  .addComponents(
    new ButtonBuilder()
      .setCustomId('annul')
      .setLabel('Annuler')
      .setStyle(ButtonStyle.Danger)
      .setEmoji("❌")
  );

const msg = await interaction.reply({ embeds: [embed0], components: [rowa, rowr] });

const filter = i => (i.customId === 'accept' || i.customId === 'annul') && i.user.id === interaction.user.id;
const collector = msg.createMessageComponentCollector({ filter, time: 10000 });


collector.on('collect', async i => {

if (i.customId === 'accept') {
  await i.deferUpdate();

  const embed1 = new EmbedBuilder()
.setTitle('Retrait en cours...')
.setDescription(`Votre transaction de \`${amount}\` \`${crypto}\` est en cours vers l'adresse \`${address}\`.`)
.setColor(bot.coloro);

await i.editReply({ embeds: [embed1], components: [] });

const signedTransaction = await web3.eth.accounts.signTransaction(transaction, privateKey);
const tt = await web3.eth.sendSignedTransaction(signedTransaction.rawTransaction);
console.log(transaction)
console.log("======================")
console.log(signedTransaction)
console.log("======================")
console.log(tt)
const embed = new EmbedBuilder()
  .setTitle('Retrait effectué')
  .setDescription(`Votre retrait de \`${amount}\` \`${crypto}\` a bien été effectué à l'adresse \`${address}\`.`)
  .setColor(bot.colorv);

await i.editReply({ embeds: [embed], components: [] });

}else if (i.customId === 'annul') {
  await i.deferUpdate();

  const embed2 = new EmbedBuilder()
.setTitle('Transaction annulé')
.setColor(bot.coloro);

  
  await i.editReply({ embeds: [embed2], components: [] });
}
});

collector.on('end', async collected => 
{
if(collected.size === 0){
  const embedtest3 = new EmbedBuilder()
  .setTitle('Temps écoulé')
  .setDescription('Vous avez mit trop de temps à repondre')
  .setColor(bot.coloro);

  
  await interaction.editReply({ embeds: [embedtest3], components: [] });
}
}
);





      await db.end();
    } catch (error) {
      const embed = new EmbedBuilder()
          .setTitle('Erreur')
          .setDescription('Vous devez spécifier la crypto-monnaie, la somme et l\'adresse de dépôt.')
          .setColor(bot.colorr);
          await interaction.reply({ embeds: [embed], components: [] });
      console.error(error);
    }
  }
}