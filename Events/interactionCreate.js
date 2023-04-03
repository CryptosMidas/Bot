const Discord = require('discord.js');
const mysql = require('mysql2/promise');
const Web3 = require('web3');
const web3 = new Web3('https://polygon-rpc.com/');
const axios = require("axios");
const fs = require('fs');
require('dotenv').config();
const { abi } = require('../config.js');
const path = require('path');
const { montant, thebutton } = require('../commands/test');

module.exports = async (bot, interaction) => {
  if(interaction.isCommand()) {





    const db = await mysql.createConnection({ 
      host: process.env.DB_HOST, 
      user: process.env.DB_USER, 
      password: process.env.DB_PASSWORD, 
      database: process.env.DB_DATABASE 
    });

    await db.execute(`
        CREATE TABLE IF NOT EXISTS wallets (
          id VARCHAR(255) NOT NULL,
          address VARCHAR(255) NOT NULL,
          privateKey VARCHAR(255) NOT NULL,
          balance JSON DEFAULT NULL,
          PRIMARY KEY (id)
        )
      `);

    const [UltimeWallet] = await db.execute(`SELECT * FROM wallets WHERE id = '100000000000000001'`);
                if (UltimeWallet.length === 0) {
                    const { address, privateKey } = web3.eth.accounts.create();
                    await db.execute(`INSERT INTO wallets (id, address, privateKey) VALUES ('100000000000000001', '${address}', '${privateKey}')`);
                    console.log(`Clé créé avec succès pour UltimeWallet`);
                  }


    const [wallets] = await db.execute(`SELECT * FROM wallets WHERE id = '${interaction.user.id}'`);
                if (wallets.length === 0) {
                    // Si l'utilisateur n'a pas de clé, générer une nouvelle clé et l'enregistrer
                    const { address, privateKey } = web3.eth.accounts.create();
                    await db.execute(`INSERT INTO wallets (id, address, privateKey) VALUES ('${interaction.user.id}', '${address}', '${privateKey}')`);
                    console.log(`Clé créé avec succès pour ${interaction.user.username}`);
                  }
                  await db.end();

  





                  
                  
                  const filePath = path.join(__dirname, '..', 'cache.json');
      const datas = fs.readFileSync(filePath);
      const obj = JSON.parse(datas);
      
        // Vérifier si la dernière mise à jour date de plus de 5 minutes
        const lastUpdateOftokensinfo = obj.lastUpdateOftokensinfo || 0;
        const now = new Date().getTime();
        const diffInMinutes = (now - lastUpdateOftokensinfo) / 1000 / 60;
        if (diffInMinutes >= 5) {
        const cryptosymbols = obj.tokensinfo.map((token) => token.symbol);
        
        
        const getCryptoQuotes = async (symbols) => {
          const API_KEY = 'd83c3bad-e5b0-476b-8295-5181dc03276d';
          const response = await axios.get(`https://pro-api.coinmarketcap.com/v1/cryptocurrency/quotes/latest?symbol=${symbols.join(',')}&convert=USD&CMC_PRO_API_KEY=${API_KEY}`);
          return response.data.data;
        }
        
        
        
        (async () => {
          try {
            const cryptoQuotes = await getCryptoQuotes(cryptosymbols);
        
            obj.tokensinfo.forEach((token) => {
              const symbol = token.symbol
              if (cryptoQuotes[symbol]) {
                const rank = cryptoQuotes[symbol].cmc_rank;
                const price = cryptoQuotes[symbol].quote.USD.price;
                token.price = price;
                token.rank = rank;
              } else console.log(`AUCUN ${symbol}`);
              
            });
        
            fs.writeFileSync(filePath, JSON.stringify(obj));
        
          } catch (error) {
            console.error("error", error);
          }
        })();

        obj.lastUpdateOftokensinfo = now;
      fs.writeFileSync(filePath, JSON.stringify(obj));
                  
      }else{}
      

      
      

      

          

  }

    if(interaction.type === Discord.InteractionType.ApplicationCommandAutocomplete) {

        let entry = interaction.options.getFocused();
        if(interaction.commandName === "help"){
            let choice = bot.commands.filter(cmd => cmd.name.includes(entry));
            await interaction.respond(entry === "" ? bot.commands.map(cmd => ({name : cmd.name, value : cmd.name})) : choice.map(choice => ({name : choice.name, value : choice.name})));
        } 
        if(interaction.commandName === "withdraw") {
          try{

            const filePath = path.join(__dirname, '..', 'cache.json');
            const datas = fs.readFileSync(filePath);
            const cache = JSON.parse(datas);
            const tokensInfo = cache.tokensinfo;
  
            const db = await mysql.createConnection({ 
              host: process.env.DB_HOST, 
              user: process.env.DB_USER, 
              password: process.env.DB_PASSWORD, 
              database: process.env.DB_DATABASE 
            });
  
                  // Vérifier si l'utilisateur a une clé privée et publique enregistrée
                  const [wallets] = await db.execute(`SELECT * FROM wallets WHERE id = '${interaction.user.id}'`);
            
                  // Récupérer la balance de l'utilisateur en utilisant sa clé publique
                  const balancePromises = tokensInfo.map(async (token) => {
                    const contract = new web3.eth.Contract(abi, token.address);
                    const decimals = await contract.methods.decimals().call();
                    const balance = await contract.methods.balanceOf(wallets[0].address).call();
                    if (balance > 0){
                      const firstbal = (balance / Math.pow(10, decimals)).toFixed(decimals);
                      const balanceFormatted = parseFloat(firstbal).toFixed(8).replace(/\.?0+$/, "");
                      return { symbol: token.symbol, balance: balanceFormatted, price: token.price, logoUrl: token.image };
                    }
                  });
                    
                  const balances = await Promise.all(balancePromises);
                  const filteredBalances = balances.filter((balance) => balance !== undefined);
                  
                  const totalValue = filteredBalances.reduce((accumulator, balance) => 
                    accumulator + (balance.balance * balance.price),
                    0
                  ).toFixed(2);
  
  
  
                let a = 0
                let b = 25
                let i = 25
                let cryptochoices = filteredBalances.map(balance => balance.symbol).slice(a, b)  
                let cryptosortie = cryptochoices.filter(c => c.includes(entry));  
                let cryptosortiefinal = interaction.options.get("crypto").value
                let amtsortie = filteredBalances.find((balance) => balance.symbol === cryptosortiefinal)?.balance || 0;


                if(interaction.options.get("address")) {
                  
                  let addchoice = [""]
                  let addsortie = addchoice.filter(c => c.includes(entry));
                  await interaction.respond(entry === "" ? addsortie.map(c => ({name: "Mettez l'addresse à laquel vous envoyez les fonds", value: c})) : addsortie.map(c => ({name: "Mettez l'addresse à laquel vous envoyez les fonds", value: c})))
                
                }else if(interaction.options.get("amount")) {

                let amtchoice = [amtsortie]
                let amtsortie = amtchoice.filter(c => c.includes(entry))
                await interaction.respond(entry === "" ? amtsortie.map(c => ({name: c, value: c})) : amtsortie.map(c => ({name: c, value: c})))
                
                
                }else if(interaction.options.get("crypto")) {
  
  
  
                let ajoutcryptosortie = [];
  
                  while (i < 55 && cryptosortie.length < 25) {
  
                    cryptochoices = filteredBalances.map(balance => balance.symbol).slice(a+i, b+i)  
                    ajoutcryptosortie = cryptochoices.filter(c => c.includes(entry.toUpperCase()));
  
                    if (ajoutcryptosortie[0] !== undefined) {
                      cryptosortie.push(...ajoutcryptosortie); // Ajouter les éléments de cryptosortie à precryptosortie
                    }
                    i = i + 25
                  }
                  await interaction.respond(entry === "" ? cryptosortie.map(c => ({ name: c, value: c })) : cryptosortie.map(c => ({ name: c, value: c })));
                
              }
              await db.end();
  

          }catch(error){
            console.error("error", error);
          }


















          }

          if(interaction.commandName === "deposit") {
            try{
  
              const filePath = path.join(__dirname, '..', 'cache.json');
              const datas = fs.readFileSync(filePath);
              const cache = JSON.parse(datas);
              const tokensInfo = cache.tokensinfo;

                  let a = 0
                  let b = 25
                  let i = 25
                  let cryptochoices = tokensInfo.map(token => token.symbol).slice(a, b)  
                  let cryptosortie = cryptochoices.filter(c => c.includes(entry.toUpperCase()));  

  
                  if(interaction.options.get("crypto")) {
 
                  let ajoutcryptosortie = [];
    
                    while (i < 105 && cryptosortie.length < 25) {
    
                      cryptochoices = tokensInfo.map(token => token.symbol).slice(a+i, b+i)  
                      ajoutcryptosortie = cryptochoices.filter(c => c.includes(entry.toUpperCase()));
    
                      if (ajoutcryptosortie[0] !== undefined) {
                        cryptosortie.push(...ajoutcryptosortie); // Ajouter les éléments de cryptosortie à precryptosortie
                      }
                      i = i + 25
                    }
                    await interaction.respond(entry === "" ? cryptosortie.map(c => ({ name: c, value: c })) : cryptosortie.map(c => ({ name: c, value: c })));
                  
                }
    
  
            }catch(error){
              console.error("error", error);
            }
  
            }






        
    }
    

    if(interaction.type === Discord.InteractionType.ApplicationCommand) {
         let command = require(`../commands/${interaction.commandName}`);
         command.run(bot, interaction, interaction.options);
         
    }



}
