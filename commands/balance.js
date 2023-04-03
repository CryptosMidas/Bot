
const mysql = require('mysql2/promise');
const Web3 = require('web3');
const { EmbedBuilder } = require('discord.js');
const web3p = new Web3('https://polygon-rpc.com');
const web3b = new Web3(new Web3.providers.HttpProvider('https://bscrpc.com'));
const web3e = new Web3(new Web3.providers.HttpProvider('https://eth.llamarpc.com'));
require('dotenv').config();
const { abi, apibsc, apieth } = require('../config.js');
const path = require('path');
const fs = require('fs');
const axios = require("axios");


const filePath = path.join(__dirname, '..', 'cache.json');
const datas = fs.readFileSync(filePath);
const cache = JSON.parse(datas);
const tokensInfo = cache.tokensinfo;

module.exports = {
  name: 'balance',
  description: 'Afficher la balance de l\'utilisateur',
  permission: 'Aucune',
  dm: true,
  category: 'Economie',

  async run(bot, interaction) {
    try {
      // Connecter à la base de données
      const db = await mysql.createConnection({ 
        host: process.env.DB_HOST, 
        user: process.env.DB_USER, 
        password: process.env.DB_PASSWORD, 
        database: process.env.DB_DATABASE 
      });

      const [wallets] = await db.execute(`SELECT * FROM wallets WHERE id = '${interaction.user.id}'`);
      const address = wallets[0].address;

  
      if (wallets[0].balance == null) {
                      await db.execute(`UPDATE wallets SET balance = '{}' WHERE balance IS NULL;`);
                      console.log(`Tableau crée avec succes`);
                    }

      // Récupérer la balance de l'utilisateur en utilisant sa clé publique
      const balancePromises = tokensInfo.map(async (token) => {
        //console.log(token.symbol)
        let Polybalance = 0
        let Bscbalance = 0
        let Ethbalance = 0

          
          if(token.reseau.Polygon == true){
          const contract1 = new web3p.eth.Contract(abi, token.address.Polygon);
          const decimals1 = await contract1.methods.decimals().call();
          const balance = await contract1.methods.balanceOf(address).call();
          const firstbal1 = (balance / Math.pow(10, decimals1)).toFixed(decimals1);
          Polybalance = parseFloat(firstbal1).toFixed(8).replace(/\.?0+$/, "");
          }



          if(token.reseau.BSC == true){
            if(token.address.BSC == "BNB"){
              const apiinfo = await axios.get(`https://api.bscscan.com/api?module=account&action=balance&address=${address}&tag=latest&apikey=${apibsc}`);
              const balancebnb = parseFloat(apiinfo.data.result) / 1e18;
              Bscbalance = parseFloat(balancebnb).toFixed(8).replace(/\.?0+$/, "");
            }else{
                  const contract = new web3b.eth.Contract(abi, token.address.BSC);
                  const balanceToken = await contract.methods.balanceOf(address).call()
                  const decimals = await contract.methods.decimals().call();
                  const firstbal = (balanceToken / Math.pow(10, decimals)).toFixed(decimals);
                  Bscbalance = parseFloat(firstbal).toFixed(8).replace(/\.?0+$/, "");      
            }
          }


          if(token.reseau.ETH == true){
            if(token.address.ETH == "ETH"){

              const apiinfo = await axios.get(`https://api.etherscan.io/api?module=account&action=balance&address=${address}&tag=latest&apikey=${apieth}`)
              Ethbalance = parseFloat(apiinfo.data.result) / 1e18;
              

              }else{
                const contract = new web3e.eth.Contract(abi, token.address.ETH);
                const decimals = await contract.methods.decimals().call();
                const balanceToken = await contract.methods.balanceOf(address).call()
                const firstbal = (balanceToken / Math.pow(10, decimals)).toFixed(decimals);
                Ethbalance = parseFloat(firstbal).toFixed(8).replace(/\.?0+$/, "");
                    }
          }



          const Balfinal = (parseFloat(Polybalance) + parseFloat(Bscbalance)+ parseFloat(Ethbalance)).toFixed(8).replace(/\.?0+$/, "")
          if (Balfinal > 0){
            return { symbol: token.symbol, balance: Balfinal, price: token.price, emoji: token.emoji };
          }

    
      });
      const balances = await Promise.all(balancePromises);
      const filteredBalances = balances.filter((balance) => balance !== undefined);
      filteredBalances.sort((a, b) => (a.balance * a.price < b.balance * b.price) ? 1 : -1);
      const totalValue = filteredBalances.reduce((accumulator, balance) => 
        accumulator + (balance.balance * balance.price),
        0
      ).toFixed(2);


const addressdep = `${address}`;

      const embed = new EmbedBuilder()
        //.setTitle(`Balance de ${interaction.user.username}`)
        .setDescription(`**Valeur totale du wallet :** $${totalValue}\n\n**Solde des tokens :**\n${filteredBalances.map(balance => `<:${balance.symbol}:${balance.emoji}> **${balance.symbol} :** \`${balance.balance}\` ($${(balance.balance * balance.price).toFixed(2)})`).join('\n')}`)
        .setAuthor({ name: `Balance de ${interaction.user.username}`, iconURL: interaction.user.avatarURL()})
        .setColor(bot.color)
  
      await interaction.reply({ embeds: [embed] }, `${addressdep}`);
      
      //await interaction.reply(`${address}`);
  
      // Fermer la connexion à la base de données
      await db.end();


    } catch (error) {
      console.error(error);
      const embed = new EmbedBuilder()
        .setTitle('Erreur')
        .setDescription('Il y a eu une erreur lors de la récupération de votre balance.')
        .setColor(bot.colorr);
      await interaction.reply({ embeds: [embed] });
    }
  }
  
};