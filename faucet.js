import express from 'express';
import * as path from 'path'
import { FrequencyChecker } from './checker';
import conf from './config'
// EVMOS dependency
import fetch from "node-fetch";
import { Wallet } from '@ethersproject/wallet'
import { createMessageSend } from '@tharsis/transactions'
import {
  broadcast,
  getSender,
  signTransaction,
} from '@hanchon/evmos-ts-wallet'

// load config
console.log("loaded config: ", conf)

const app = express()

const checker = new FrequencyChecker(conf)

app.get('/', (req, res) => {
  res.sendFile(path.resolve('./index.html'));
})

app.get('/config.json', (req, res) => {
  res.send(conf.project);
})

app.get('/send/:address', async (req, res) => {
  const { address } = req.params;
  console.log('request tokens to ', address)
  if (address) {
    try {
      if (address.startsWith(conf.sender.option.prefix)) {
        checker.check(
          // 1. address
          address,
          // onAccept
          () => {
            sendTx(address).then(ret => {
              console.log('sent tokens to ', address)
              checker.update(address)
              res.send({ result: ret })
            });
          },
          // onReject
          () => {
            res.send({ result: "You requested too often" })
          });
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

// sendTx('evmos144ysmwalylpju9yuplfh2a900pugv5ly2j7r6l')

async function sendTx(recipient) {

  const wallet = Wallet.fromMnemonic(conf.sender.mnemonic, conf.sender.option.hdPaths);
  const sender = await getSender(wallet, conf.blockchain.endpoint)

  // console.log("sender:", sender)

  const fee = {
    amount: conf.tx.fee.amount.amount,
    denom: conf.tx.fee.amount.denom,
    gas: conf.tx.fee.gas,
  }

  const tx = createMessageSend(conf.blockchain, sender, fee, '', {
    destinationAddress: recipient,
    amount: '1',
    denom: 'tevmos',
  })

  // console.log(tx)

  const resKeplr = await signTransaction(wallet, tx)
  console.log('tx', resKeplr)
  // const broadcastRes = await broadcast(resKeplr, conf.blockchain.endpoint)
  const broadcastRes = await fetch(`${conf.blockchain.endpoint}/cosmos/tx/v1beta1/txs`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: '*/*',
    },
    body: resKeplr, // body data type must match "Content-Type" header
  })

  console.log("response:", broadcastRes)

}

