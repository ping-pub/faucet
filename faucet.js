import express from 'express';
import * as path from 'path'

import { DirectSecp256k1HdWallet } from "@cosmjs/proto-signing";
import { SigningStargateClient } from "@cosmjs/stargate";
import { FrequencyChecker } from './checker';

import conf from './config'

import { Wallet } from '@ethersproject/wallet'
import { createMessageSend } from '@tharsis/transactions'
import {
  broadcast,
  getSender,
  signTransaction,
} from '@hanchon/evmos-ts-wallet'
import { pathToString } from '@cosmjs/crypto';

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


    pathToString
    const wallet2 = Wallet.fromMnemonic(chainConf.sender.mnemonic, pathToString(chainConf.sender.option.hdPaths[0]));
    console.log('address:', firstAccount.address, wallet2.address)
  }

  const project = conf.project
  project.sample = sample
  project.blockchains = conf.blockchains.map(x => x.name)
  res.send(project);
})

app.get('/balance/:chain', async (req, res) => {
  const { chain }= req.params

  let balance = {}

  const chainConf = conf.blockchains.find(x => x.name === chain)
  if(chainConf) {
    const rpcEndpoint = chainConf.endpoint.rpc_endpoint;
    const wallet = await DirectSecp256k1HdWallet.fromMnemonic(chainConf.sender.mnemonic, chainConf.sender.option);
    const client = await SigningStargateClient.connectWithSigner(rpcEndpoint, wallet);
    const [firstAccount] = await wallet.getAccounts();
    balance = await client.getBalance(firstAccount.address, chainConf.tx.amount.denom)
  }

  res.send(balance);
})

app.get('/send/:chain/:address', async (req, res) => {
  const {chain, address} = req.params;
  const ip = req.headers['x-real-ip'] || req.headers['X-Real-IP'] || req.headers['X-Forwarded-For'] || req.ip
  console.log('request tokens to ', address, ip)
  if (chain || address ) {
    try {
      const chainConf = conf.blockchains.find(x => x.name === chain)
      if (chainConf && address.startsWith(chainConf.sender.option.prefix)) {
        if( await checker.checkAddress(address, chain) && await checker.checkIp(`${chain}${ip}`, chain) ) {
          checker.update(`${chain}${ip}`) // get ::1 on localhost
          sendTx(address, chain).then(ret => {

            checker.update(address)
            res.send({ result: ret })
          }).catch(err => {
            res.send({ result: `err: ${err}`})
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

async function sendCosmosTx(recipient, chain) {
  // const mnemonic = "surround miss nominee dream gap cross assault thank captain prosper drop duty group candy wealth weather scale put";
  const chainConf = conf.blockchains.find(x => x.name === chain) 
  if(chainConf) {
    const wallet = await DirectSecp256k1HdWallet.fromMnemonic(chainConf.sender.mnemonic, chainConf.sender.option);
    const [firstAccount] = await wallet.getAccounts();

    // console.log("sender", firstAccount);

    const rpcEndpoint = chainConf.endpoint.rpc_endpoint;
    const client = await SigningStargateClient.connectWithSigner(rpcEndpoint, wallet);
    client.getBalance

    // const recipient = "cosmos1xv9tklw7d82sezh9haa573wufgy59vmwe6xxe5";
    const amount = chainConf.tx.amount;
    const fee = chainConf.tx.fee;
    return client.sendTokens(firstAccount.address, recipient, [amount], fee);
  }
  throw new Error(`Blockchain Config [${chain}] not found`)
}

async function sendEvmosTx(recipient, chain) {

  const chainConf = conf.blockchains.find(x => x.name === chain) 
  const wallet = Wallet.fromMnemonic(chainConf.sender.mnemonic, pathToString(chainConf.sender.option.hdPaths[0]));
  const sender = await getSender(wallet, chainConf.endpoint.rpc_endpoint)

  // console.log("sender:", sender)

  const fee = {
    amount: chainConf.tx.fee.amount.amount,
    denom: chainConf.tx.fee.amount.denom,
    gas: chainConf.tx.fee.gas,
  }

  const tx = createMessageSend(chainConf.ids, sender, fee, '', {
    destinationAddress: recipient,
    amount: chainConf.tx.amount.amount,
    denom: chainConf.tx.amount.denom,
  })

  // console.log(tx)

  const resKeplr = await signTransaction(wallet, tx)
  console.log('tx', resKeplr)
  // const broadcastRes = await broadcast(resKeplr, conf.blockchain.endpoint)
  return await fetch(`${chainConf.endpoint.endpoint}/cosmos/tx/v1beta1/txs`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: '*/*',
    },
    body: resKeplr, // body data type must match "Content-Type" header
  })
}

async function sendTx(recipient, chain) {
  const chainConf = conf.blockchains.find(x => x.name === chain) 
  if(chainConf.type === 'Ethermint') {
    return sendEvmosTx(recipient, chain)
  }
  return sendCosmosTx(recipient, chain)
}