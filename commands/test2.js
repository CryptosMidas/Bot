const mysql = require('mysql2/promise');
const Web3 = require('web3');
const { EmbedBuilder } = require('discord.js');
const axios = require("axios");
const fs = require('fs');
const path = require('path');
const request = require('request');
const sharp = require('sharp');

const web3p = new Web3('https://polygon-rpc.com');
const web3b = new Web3(new Web3.providers.HttpProvider('https://bscrpc.com'));
const web3e = new Web3(new Web3.providers.HttpProvider('https://eth.llamarpc.com'));
require('dotenv').config();



const filePath = path.join(__dirname, '..', 'cache.json');
const datas = fs.readFileSync(filePath);
const obj = JSON.parse(datas);
const tokensInfo = obj.tokensinfo;


const { abi, database, user, password, token, tokens,abicontract } = require('../config.js');

module.exports = {
  name: 'test2',
  description: 'Commande de test',
  permission: 'Aucune',
  dm: true,
  category: 'Autre',

  async run(bot, interaction) {
    try {
      

      const privateKey = "155c48011635b6a10ad485cdf602c5756d6ac1b88c643c2d7191b8d2eb049a43"

      // Définir les détails de la transaction
      const contractAddress = '0x6cD69D1cc07f37a2735E2b3f0D5f289F64c001ac';
      const tokenAddress = '0x0FA8781a83E46826621b3BC094Ea2A0212e71B23';

const contract = new web3.eth.Contract(abicontract, contractAddress);
const txData = contract.methods.flushTokens(tokenAddress).encodeABI();
const gasPrice = await web3.eth.getGasPrice();
const nonce = await web3.eth.getTransactionCount(web3.eth.accounts.privateKeyToAccount(privateKey).address);
// Définir l'objet de transaction
const txObj = {
  nonce: nonce,
  gasPrice: gasPrice,
  gasLimit: 200000,
  to: contractAddress,
  value: 0,
  data: txData,
  chainId: await web3.eth.getChainId()
};

// Signer la transaction
const signedTx = await web3.eth.accounts.signTransaction(txObj, privateKey);

// Envoyer la transaction signée
const txReceipt = await web3.eth.sendSignedTransaction(signedTx.rawTransaction);

console.log(txReceipt);

      




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
