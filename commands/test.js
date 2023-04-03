const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, StringSelectMenuBuilder } = require('discord.js');

const mysql = require('mysql2/promise');
const Web3 = require('web3');
const web3 = new Web3(new Web3.providers.HttpProvider('https://polygon-rpc.com/'));
const Tx = require('ethereumjs-tx').Transaction;
const axios = require("axios");
const fs = require('fs');
require('dotenv').config();
const path = require('path');
const { abi, database, user, password, token, apipoly } = require('../config.js');
const QRCode = require('qrcode');

const filePath = path.join(__dirname, '..', 'cache.json');
const datas = fs.readFileSync(filePath);
const cache = JSON.parse(datas);
const tokensInfo = cache.tokensinfo;

module.exports = {
  name: 'test',
  description: 'Commande de test',
  permission: 'Aucune',
  dm: true,
  category: 'Autre',
  async run(bot, interaction) {
    try {


      
      // Définir les informations de l'adresse A, de l'adresse B et de l'adresse BOT
      const addressA = '0x979BaAE99731C2115547D3C64b33a0257e671AE2';
      const addressBot = '0x566344FE78D89BEDA2BDb2a2b06a163AD65A6555';
      
      // Définir les clés privées pour les adresses A et B
      const privateKeyA = "0xcabafede2ed88580938ad5ff18f6894063d5506deb13442a15ab81d1647db869"
      const privateKeyBOT = "0xf5b8f3a8e5363b511d4f1ea5b92e9136064e18b9458af595e6f82db3c7db9a84"
      
      // Définir les informations du token et du contrat du token
      const tokenAddress = '0xc2132D05D31c914a87C6611C10748AEb04B58e8F';
      
      // Créer une instance du contrat du token
      const tokenContract = new web3.eth.Contract(tokenAbi, tokenAddress);
      
      // Définir le montant de tokens à envoyer
      const amount = 50000
      
      // Estimer les frais de transaction
      const gasPrice = await web3.eth.getGasPrice();
      const gasLimit = await tokenContract.methods.transfer(addressBot, amount).estimateGas({from: addressA});
      
      // Calculer le coût total de la transaction
      const txCost = gasPrice * gasLimit;
      
      // Obtenir le nonce de l'adresse A
      const nonce = await web3.eth.getTransactionCount(addressA, 'latest');
      
      // Créer l'objet de transaction
      const txObject = {
        nonce:    web3.utils.toHex(nonce),
        gasLimit: web3.utils.toHex(gasLimit),
        gasPrice: web3.utils.toHex(gasPrice),
        to:       tokenAddress,
        data:     tokenContract.methods.transfer(addressBot, amount).encodeABI()
      };
      
      // Signer la transaction avec la clé privée de l'adresse A
      const tx = new Tx(txObject, { chain: 'matic' });
      tx.sign(privateKeyBOT);
      
      // Obtenir le compte nonce de l'adresse B
      const accountNonce = await web3.eth.getTransactionCount(addressBot, 'pending');
      
      // Envoyer la transaction signée à l'adresse B pour le relayer
      web3.eth.sendSignedTransaction('0x' + tx.serialize().toString('hex'), { from: addressBot, nonce: accountNonce })
        .on('transactionHash', function(hash){
          console.log("Transaction hash: " + hash);
        })
        .on('receipt', function(receipt){
          console.log("Transaction receipt: " + receipt);
        })
        .on('error', function(error){
          console.error(error);
        });











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
