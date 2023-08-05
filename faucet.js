import express from 'express';
import * as path from 'path'

import { Wallet } from '@ethersproject/wallet'
import {
  Bip39,
  EnglishMnemonic,
  pathToString,
  Secp256k1,
  Slip10,
  Slip10Curve,
  stringToPath,
  Keccak256
} from "@cosmjs/crypto";
import { toBech32, fromHex, toHex, toAscii } from "@cosmjs/encoding";

import { ethers } from 'ethers';
import { bech32 } from 'bech32';

import { DirectSecp256k1HdWallet } from "@cosmjs/proto-signing";
import { SigningStargateClient } from "@cosmjs/stargate";

import conf from './config.js'
import { FrequencyChecker } from './checker.js';

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
    if(chainConf.type === 'Ethermint') {
      const wallet = await fromMnemonicEthermint(chainConf.sender.mnemonic, chainConf.sender.option);
      sample[chainConf.name] = wallet.address;
    }

    const wallet2 = Wallet.fromMnemonic(chainConf.sender.mnemonic, pathToString(chainConf.sender.option.hdPaths[0]));
    console.log('address:', sample[chainConf.name], wallet2.address);
  }

  const project = conf.project
  project.sample = sample
  project.blockchains = conf.blockchains.map(x => x.name)
  res.send(project);
})

app.get('/balance/:chain', async (req, res) => {
  const { chain }= req.params

  let balance = {}

  try{
    const chainConf = conf.blockchains.find(x => x.name === chain)
    if(chainConf) {
      if(chainConf.type === 'Ethermint') {
        const ethProvider = new ethers.providers.JsonRpcProvider(chainConf.endpoint.evm_endpoint);
        const wallet = Wallet.fromMnemonic(chainConf.sender.mnemonic).connect(ethProvider);
        await wallet.getBalance().then(ethBlance => {
          balance = {
            denom:chainConf.tx.amount.denom,
            amount:ethBlance.toString()
          }
        }).catch(e => console.error(e))
      }else{
        const rpcEndpoint = chainConf.endpoint.rpc_endpoint;
        const wallet = await DirectSecp256k1HdWallet.fromMnemonic(chainConf.sender.mnemonic, chainConf.sender.option);
        const client = await SigningStargateClient.connectWithSigner(rpcEndpoint, wallet);
        const [firstAccount] = await wallet.getAccounts();
        await client.getBalance(firstAccount.address, chainConf.tx.amount.denom).then(x => {
          return balance = x
        }).catch(e => console.error(e));
      }
    }
  } catch(err) {
    console.log(err)
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
      if (chainConf && (address.startsWith(chainConf.sender.option.prefix) || address.startsWith('0x'))) {
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

  try{
    const chainConf = conf.blockchains.find(x => x.name === chain) 
    // const ethProvider = new ethers.providers.JsonRpcProvider(chainConf.endpoint.evm_endpoint);

    const wallet = Wallet.fromMnemonic(chainConf.sender.mnemonic); // .connect(ethProvider);

    let evmAddress =  recipient;
    if(recipient && !recipient.startsWith('0x')) {
      let decode = bech32.decode(recipient);
      let array = bech32.fromWords(decode.words);
      evmAddress =  "0x" + toHexString(array);
    }

    let result = await wallet.sendTransaction(
        { 
          from:wallet.address,
          to:evmAddress,
          value:chainConf.tx.amount.amount
        }
      );
   
    let repTx = {
      "code":0,
      "nonce":result["nonce"],
      "value":result["value"].toString(),
      "hash":result["hash"]
    };

    console.log("xxl result : ",repTx);
    return repTx;
  }catch(e){
    console.log("xxl e ",e);
    return e;
  }

}

function toHexString(bytes) {
  return bytes.reduce(
      (str, byte) => str + byte.toString(16).padStart(2, '0'), 
      '');
}

async function sendTx(recipient, chain) {
  const chainConf = conf.blockchains.find(x => x.name === chain) 
  if(chainConf.type === 'Ethermint') {
    return sendEvmosTx(recipient, chain)
  }
  return sendCosmosTx(recipient, chain)
}

// write a function to send evmos transaction
async function sendEvmosTx2(recipient, chain) {

  // use evmosjs to send transaction
  const chainConf = conf.blockchains.find(x => x.name === chain) 
  // create a wallet instance
  const wallet = Wallet.fromMnemonic(chainConf.sender.mnemonic).connect(chainConf.endpoint.evm_endpoint);
}

async function fromMnemonicEthermint(mnemonic, options) {
  const mnemonicChecked = new EnglishMnemonic(mnemonic);
  const seed = await Bip39.mnemonicToSeed(mnemonicChecked, options.bip39Password);
  const prefix = options.prefix ?? "cosmos";
  const hdPaths = options.hdPaths ?? [stringToPath("m/44'/60'/0'/0/0")];
  const hdPath = hdPaths[0];
  const { privkey } = Slip10.derivePath(Slip10Curve.Secp256k1, seed, hdPath);
  const { pubkey } = await Secp256k1.makeKeypair(privkey);
  
  const coinType = pathToString(hdPath).split('/')[2]
  // ETH cointype=60
  if (coinType !== "60'") {
    console.error("Only support hapath with 60'");
    return
  }

  const hash = new Keccak256(pubkey.slice(1)).digest()
  // 40 low hex characters
  const lastTwentyBytes = toHex(hash.slice(-20));
  const addressHash = toHex(new Keccak256(toAscii(lastTwentyBytes)).digest());
  // EVM address
  let checksumAddress = "0x";
  for (let i = 0; i < 40; i++) {
    checksumAddress += parseInt(addressHash[i], 16) > 7 ? lastTwentyBytes[i].toUpperCase() : lastTwentyBytes[i];
  }
  const evmAddrWithoutHexPrefix = checksumAddress.replace(/^(-)?0x/i, '$1');
  const evmAddressBytes = fromHex(evmAddrWithoutHexPrefix);
  const evmToBech32Address = toBech32(prefix, evmAddressBytes);
  
  return {
    algo: "eth_secp256k1",
    privkey: privkey,
    pubkey: Secp256k1.compressPubkey(pubkey),
    address: evmToBech32Address,
  }
}