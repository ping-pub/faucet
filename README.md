# faucet

General Faucet for Cosmos SDK testnet.

<img width="1052" alt="preview" src="https://user-images.githubusercontent.com/2882920/202998797-b793c52b-9ad7-47fe-a80b-a0f75eff6ba1.png">

## Prerequisite

```sh
node -v
v16.15.0
```

# Installation

 - clone code:
 
 ```sh
 git clone https://github.com/ping-pub/faucet.git
 ```
 
 - setup configs, you have to change everything you need in `./config.json`
 ```json
 {
    "port": 80,  // http port 
    "db": {
        "path": "~/.faucet.db" // db for frequency checker(WIP)
    }, 
    "blockchain": {
        "rpc_endpoint": "https://rpc.sentry-02.theta-testnet.polypore.xyz"
    },
    "sender": {
        "mnemonic": "surround miss nominee dream gap cross assault thank captain prosper drop duty group candy wealth weather scale put",
        "option": {
            "hdPaths": ["m/44'/118'/0'/0/0"],
            "prefix": "cosmos"  //address prefix
        }
    },
    "tx": {
        "amount": {
            "denom": "uatom",
            "amount": "10000" // how many does tx send for each request.
          },
        "fee": {
            "amount": [
                {
                  "amount": "1000",
                  "denom":  "uatom"
                }
            ],
            "gas": "200000"
        },
        "frequency_in_24h": "1"
    },
    "client": {
        "testnet": "Ping Testnet", // What ever you want, recommend: chain-id, 
        "logo": "https://ping.pub/logo.svg",
        "deployer": "heelo"
    }
    
}
 ```
 
 - Run faucet
 ```sh
 node faucet.js
 ```
 
 # Test
 
 visit http://localhost:80 
 
 80 is default, you can edit it in the config.json
 
 
 
 
