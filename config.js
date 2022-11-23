
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
        // make sure that CORS is enabled in rpc section in config.toml
        // cors_allowed_origins = ["*"]
        "rpc_endpoint": "https://rpc.sentry-02.theta-testnet.polypore.xyz",

    },
    "sender": {
        "mnemonic": "surround miss nominee dream gap cross assault thank captain prosper drop duty group candy wealth weather scale put",
        "option": {
            "hdPaths": [stringToPath("m/44'/118'/0'/0/0")],
            "prefix": "cosmos"
        }
    },
    "tx": {
        "amount": {
            "denom": "uatom",
            "amount": "10000"
        },
        "fee": {
            "amount": [
                {
                    "amount": "1000",
                    "denom": "uatom"
                }
            ],
            "gas": "200000"
        },
        "frequency_in_24h": "2"
    },
}