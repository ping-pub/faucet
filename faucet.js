import express from 'express';
import * as path from 'path'

import { DirectSecp256k1HdWallet } from "@cosmjs/proto-signing";
import { SigningStargateClient } from "@cosmjs/stargate";
import conf from './config.json' assert {type: 'json'}
// let conf = require('./config.json')

const app = express()
// load config
console.log("config: ", conf)

app.get('/', (req, res) => {
  res.sendFile(path.resolve('./index.html'));
})

app.get('/config.json', (req, res) => {
  res.send(conf.client);
})

app.get('/send/:address', async (req, res) => {
  console.log('request tokens to ', req.params.address)
  if (req.params && req.params.address) {
    try {
      if(req.params.address.startsWith(conf.sender.option.prefix)) {
        sendTx(req.params.address).then(ret => {
          console.log('sent tokens to ', req.params.address)
          res.send({result: ret})
        })
      } else {
        res.send({result: `Address [${req.params.address}] is not supported.`})
      }
    } catch(err) {
      console.error(err);
      res.send({result: 'Failed, Please contact to admin.'})
    }

  } else {
  // send result
  res.send({result: 'address is required'});
  }
})

app.listen(conf.port, () => {
  console.log(`Faucet app listening on port ${conf.port}`)
})


async function sendTx(recipient) {
  
  // const mnemonic = "surround miss nominee dream gap cross assault thank captain prosper drop duty group candy wealth weather scale put";
  const wallet = await DirectSecp256k1HdWallet.fromMnemonic(conf.sender.mnemonic, /*conf.sender.option*/);
  const [firstAccount] = await wallet.getAccounts();

  console.log("sender", firstAccount);
  
  const rpcEndpoint = conf.blockchain.rpc_endpoint;
  const client = await SigningStargateClient.connectWithSigner(rpcEndpoint, wallet);
  
  // const recipient = "cosmos1xv9tklw7d82sezh9haa573wufgy59vmwe6xxe5";
  const amount = conf.tx.amount;
  const fee = conf.tx.fee;
  return client.sendTokens(firstAccount.address, recipient, [amount], fee);
}
