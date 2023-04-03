const {EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle} = require('discord.js');
const mysql = require('mysql2/promise');
const Web3 = require('web3');
const web3p = new Web3('https://polygon-rpc.com/');
const web3b = new Web3(new Web3.providers.HttpProvider('https://bscrpc.com/'));
const web3e = new Web3(new Web3.providers.HttpProvider('https://eth.llamarpc.com'));
const axios = require("axios");
const fs = require('fs');
require('dotenv').config();
const { abi } = require('../config.js');
const path = require('path');

module.exports = {
  name: "deposit",
  description : "deposit",
  permission: "Aucune",
  dm: true,
  category : "Economie",
  options: [
    {
      type: "string",
      name: "crypto",
      description: "The crypto you want to deposit",
      required: true,
      autocomplete: true,

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
      const reseau = [];
      const valembed = [];


      tokensInfo.forEach(token => {
        if (token.symbol === crypto) {
          if (token.reseau.Polygon) reseau.push("Polygon");
          if (token.reseau.BSC) reseau.push("BSC") ;
          if (token.reseau.ETH) reseau.push("ETH") ;
        }
      });

      if (reseau.length === 0) {
        const embed0 = new EmbedBuilder()
        .setTitle('Erreur')
        .setDescription(`La crypto-monnaie ${crypto} n'est pas supportée par le bot.`)
        .setColor(bot.colorr);
        return interaction.reply({ embeds: [embed0], components: [] });
      }

      const account = wallets[0].address;
      let web3 = ""
      let price = 0
      let simu = ""

      for (let i = 0; i < reseau.length; i++) {
        const network = reseau[i];

        if(network == "Polygon") {
          web3 = web3p
          price = tokensInfo.find((token) => token.symbol === "MATIC").price
          simu = "0x0000000000000000000000000000000000001010"
        };
        if(network == "BSC") {
          web3 = web3b
          price = tokensInfo.find((token) => token.symbol === "BNB").price
          simu = "0x0000000000000000000000000000000000001004"
        };
        if(network == "ETH") {
          web3 = web3e
          price = tokensInfo.find((token) => token.symbol === "ETH").price
          simu = "0x00000000219ab540356cBB839Cbe05303d7705Fa"
        };
          
        if(crypto == "BNB"){
          const gasPrice = await web3.eth.getGasPrice();
          const gasCost = ((gasPrice * 21000)/Math.pow(10, 18))*2
          valembed.push(`BSC: **<:${crypto}:${tokensInfo.find((token) => token.symbol === crypto).emoji}> ${gasCost} ${crypto}** ($${(gasCost*price).toFixed(4)})`)
        }else if(crypto == "ETH" && network == "ETH"){
          const gasPrice = await web3.eth.getGasPrice();
          const gasCost = ((gasPrice * 21000)/Math.pow(10, 18)).toFixed(5).replace(/\.?0+$/, "")*2
          valembed.push(`ETH: **<:${crypto}:${tokensInfo.find((token) => token.symbol === crypto).emoji}> ${gasCost} ${crypto}** ($${(gasCost*price).toFixed(4)})`)
        }else{
          
        const address = tokensInfo.find((token) => token.symbol === crypto).address[network]
        const cryptoprice = tokensInfo.find((token) => token.symbol === crypto).price
        const contract = new web3.eth.Contract(abi, address);
        const decimals = await contract.methods.decimals().call();

        const balance = await contract.methods.balanceOf(simu).call();
        const value = (balance / Math.pow(10, decimals))
        


        const gasPrice = await web3.eth.getGasPrice();
        const gasLimit = await contract.methods.transfer(address, balance.toString()).estimateGas({from: simu});
        console.log(gasLimit)


        let i = 2
        if(cryptoprice > 0.1) i = 3;
        if(cryptoprice > 10) i = 4;
        if(cryptoprice > 100) i = 5;
        if(cryptoprice > 10000) i = 7;
        
      
        const gasCost = ((gasPrice * gasLimit)/Math.pow(10, 18))*price*2
        const firstbal = (gasCost/cryptoprice)
        console.log(firstbal)
        const balanceFormatted = parseFloat(firstbal).toFixed(i).replace(/\.?0+$/, "");

        if(network == "Polygon") {
          valembed.push(`Polygon: **<:${crypto}:${tokensInfo.find((token) => token.symbol === crypto).emoji}> ${balanceFormatted} ${crypto}** ($${gasCost.toFixed(4)})`)
        };
        if(network == "BSC") {
          valembed.push(`BSC: **<:${crypto}:${tokensInfo.find((token) => token.symbol === crypto).emoji}> ${balanceFormatted} ${crypto}** ($${gasCost.toFixed(4)})`)
        };
        if(network == "ETH") {
          valembed.push(`ETH: **<:${crypto}:${tokensInfo.find((token) => token.symbol === crypto).emoji}> ${balanceFormatted} ${crypto}** ($${gasCost.toFixed(4)})`)
        };
        }
      }

// Générer un QR code pour l'adresse de portefeuille de l'utilisateur
const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${account}`;

// Construire l'embed de réponse
const embed = new EmbedBuilder()
  .setTitle(`Dépôt de ${crypto}`)
  .setDescription(`Merci d'envoyer vos **<:${crypto}:${tokensInfo.find((token) => token.symbol === crypto).emoji}>${crypto}** à l'adresse ci-dessous :`)
  .setThumbnail(qrCodeUrl)
  .setColor(bot.color)
  .addFields(
    { name: 'Adresse de portefeuille', value: `\`\`\`${account}\`\`\``},
    { name: 'Informations', value: `Pour permettre le transfere de vos fond vers **CryptoGift.cc**, des frais seront déduits de votre dépôt (estimation ci-dessous). Les dépôts inférieurs à cela ne seront pas comptabilisés.\n**CryptoGift.cc** supporte **<:${crypto}:${tokensInfo.find((token) => token.symbol === crypto).emoji}>${crypto}** sur **${reseau.join(', ')}**. Le transfere de ce token sur un reseau autre qu'énoncé entrainera la perte de vos fonds`},
    { name: 'Frais de transaction estimés', value: valembed.join('\n')}
    )

// Répondre à l'utilisateur avec l'embed
await interaction.reply({ embeds: [embed], components: [] });
await interaction.user.send(`${account}`)
      
    
    
    
    
    }catch (error) {
        console.error(error);
        const embed = new EmbedBuilder()
          .setTitle('Erreur')
          .setDescription('Il y a eu une erreur.')
          .setColor(bot.colorr);
        await interaction.reply({ embeds: [embed] });
      }
    }
    
  };