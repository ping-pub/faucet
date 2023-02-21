import express from 'express';
import * as path from 'path'

import { DirectSecp256k1HdWallet } from "@cosmjs/proto-signing";
import { SigningStargateClient } from "@cosmjs/stargate";
import { FrequencyChecker } from './checker';

import conf from './config'

// load config
console.log("loaded config: ", conf)

const app = express()

const checker = new FrequencyChecker(conf)

app.get('/', (req, res) => {
  res.sendFile(path.resolve('./index.html'));
})

app.get('/config.json', async (req, res) => {
  const sample = {}
  for(let i =0; i < conf.blockchains.length; i++) {
    const chainConf = conf.blockchains[i]
    const wallet = await DirectSecp256k1HdWallet.fromMnemonic(chainConf.sender.mnemonic, chainConf.sender.option);
    const [firstAccount] = await wallet.getAccounts();
    sample[chainConf.name] = firstAccount.address
  }

  const project = conf.project
  project.sample = sample
  project.blockchains = conf.blockchains.map(x => x.name)
  res.send(project);
})

app.get('/send/:chain/:address', async (req, res) => {
  const {chain, address} = req.params;
  console.log('request tokens to ', address, req.ip)
  if (chain || address ) {
    try {
      const chainConf = conf.blockchains.find(x => x.name === chain)
      if (chainConf && address.startsWith(chainConf.sender.option.prefix)) {
        if( await checker.checkAddress(address, chain) && await checker.checkIp(`${chain}${req.ip}`, chain) ) {
          checker.update(`${chain}${req.ip}`) // get ::1 on localhost
          sendTx(address, chain).then(ret => {

            checker.update(address)
            res.send({ result: ret })
          });
        }else {
          res.send({ result: "You requested too often" })
        }
      } else {
        res.send({ result: `Address [${address}] is not supported.` })
      }
    } catch (err) {
      console.error(err);
      res.send({ result: 'Failed, Please contact to admin.' })
    }

  } else {
    // send result
    res.send({ result: 'address is required' });
  }
})

app.listen(conf.port, () => {
  console.log(`Faucet app listening on port ${conf.port}`)
})


async function sendTx(recipient, chain) {
  // const mnemonic = "surround miss nominee dream gap cross assault thank captain prosper drop duty group candy wealth weather scale put";
  const chainConf = conf.blockchains.find(x => x.name === chain) 
  if(chainConf) {
    const wallet = await DirectSecp256k1HdWallet.fromMnemonic(chainConf.sender.mnemonic, chainConf.sender.option);
    const [firstAccount] = await wallet.getAccounts();

    // console.log("sender", firstAccount);

    const rpcEndpoint = chainConf.endpoint.rpc_endpoint;
    const client = await SigningStargateClient.connectWithSigner(rpcEndpoint, wallet);

    // const recipient = "cosmos1xv9tklw7d82sezh9haa573wufgy59vmwe6xxe5";
    const amount = chainConf.tx.amount;
    const fee = chainConf.tx.fee;
    return client.sendTokens(firstAccount.address, recipient, [amount], fee);
  }
  throw new Error(`Blockchain Config [${chain}] not found`)
}

