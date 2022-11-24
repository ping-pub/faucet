
import { stringToPath } from '@cosmjs/crypto'

export default {
    "port": 80, // http port 
    "db": {
        "path": "./db/faucet.db" // save request states 
    },
    "project": {
        "name": "Ping Testnet",
        "logo": "https://ping.pub/logo.svg",
        "deployer": `<a href="#">Your Brand</a>`
    },
    "blockchain": {
        "chainId": 9000,
        "cosmosChainId": 'evmos_9000-4',
        // make sure that CORS is enabled in lcd section in config.toml
        // cors_allowed_origins = ["*"]
        "endpoint": "https://rest.bd.evmos.dev:1317",

    },
    "sender": {
        "mnemonic": "surround miss nominee dream gap cross assault thank captain prosper drop duty group candy wealth weather scale put",
        "option": {
            "hdPaths": "m/44'/60'/0'/0/0",
            "prefix": "evmos"
        }
    },
    "tx": {
        "amount": {
            "denom": "aevmos",
            "amount": "10000"
        },
        "fee": {
            "amount": [
                {
                    "amount": "1000",
                    "denom": "aevmos"
                }
            ],
            "gas": "200000"
        },
        "frequency_in_24h": "2"
    },
}