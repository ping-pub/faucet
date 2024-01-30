
import { stringToPath } from '@cosmjs/crypto'
import fs from 'fs'
import { ethers } from 'ethers'

const HOME = ".faucet";
const mnemonic_path= `${HOME}/mnemonic.txt`
if (!fs.existsSync(mnemonic_path)) {
    fs.mkdirSync(HOME, { recursive: true })
    fs.writeFileSync(mnemonic_path, ethers.Wallet.createRandom().mnemonic.phrase)
}

const mnemonic = fs.readFileSync(mnemonic_path, 'utf8')
console.log("======================== faucet mnemonic =========================")
console.log(mnemonic)
console.log("==================================================================")

export default {
    port: 8088, // http port 
    db: {
        path: `${HOME}/history.db` // save request states 
    },
    project: {
        name: "Demo of Side Exchange",
        logo: "https://side.one/favicon.ico",
        deployer: `<a href="https://demo.side.exchange">Side Exchange</a>`
    },
    blockchains: [
        {
            name: "rigi-kent",
            endpoint: {
                // make sure that CORS is enabled in rpc section in config.toml
                // cors_allowed_origins = ["*"]
                rpc_endpoint: " https://testnet-rpc.side.one",
            },
            sender: {
                mnemonic,
                option: {
                    hdPaths: [stringToPath("m/44'/118'/0'/0/0")],
                    prefix: "side" // human readable address prefix
                }
            },
            tx: {
                amount: [
                    {
                        denom: "ukent",
                        amount: "1000000000"
                    },
                    {
                        denom: "uatom",
                        amount: "10000000000"
                    },
                ],
                fee: {
                    amount: [
                        {
                            amount: "5000",
                            denom: "ukent"
                        }
                    ],
                    gas: "200000"
                },
            },
            limit: {
                // how many times each wallet address is allowed in a window(24h)
                address: 1, 
                // how many times each ip is allowed in a window(24h),
                // if you use proxy, double check if the req.ip is return client's ip.
                ip: 10 
            }
        },
        {
            type: 'Ethermint',
            ids: {
                chainId: 1818,
                cosmosChainId: 'sidechain_1818-1',
            },
            name: "Proxima",
            endpoint: {
                // make sure that CORS is enabled in rpc section in config.toml
                // cors_allowed_origins = ["*"]
                rpc_endpoint: "https://proxima-rpc.side.exchange",
                evm_endpoint: "http://13.229.237.39:8545/",
            },
            sender: {
                mnemonic,
                option: {
                    hdPaths: [stringToPath("m/44'/60")],
                    prefix: "prox"
                }
            },
            tx: {
                amount: {
                    denom: "aprox",
                    amount: "5000000000000000000"
                },
                fee: {
                    amount: [
                        {
                            amount: "100000",
                            denom: "aprox"
                        }
                    ],
                    gas: "10000000000000"
                },
            },
            limit: {
                // how many times each wallet address is allowed in a window(24h)
                address: 1, 
                // how many times each ip is allowed in a window(24h),
                // if you use proxy, double check if the req.ip is return client's ip.
                ip: 10 
            }
        },
        {
            type: 'Ethermint',
            ids: {
                chainId: 1819,
                cosmosChainId: 'sidechain_1819-1',
            },
            name: "Toliman",
            endpoint: {
                // make sure that CORS is enabled in rpc section in config.toml
                // cors_allowed_origins = ["*"]
                rpc_endpoint: "https://toliman-rpc.side.exchange",
                evm_endpoint: "http://52.77.209.10:8545/",
            },
            sender: {
                mnemonic,
                option: {
                    hdPaths: [stringToPath("m/44'/60/0'/0/0")],
                    prefix: "toli"
                }
            },
            tx: {
                amount: {
                    denom: "atoli",
                    amount: "5000000000000000000"
                },
                fee: {
                    amount: [
                        {
                            amount: "100000",
                            denom: "atoli"
                        }
                    ],
                    gas: "10000000000000"
                },
            },
            limit: {
                // how many times each wallet address is allowed in a window(24h)
                address: 1, 
                // how many times each ip is allowed in a window(24h),
                // if you use proxy, double check if the req.ip is return client's ip.
                ip: 10 
            }
        },
    ]    
}
