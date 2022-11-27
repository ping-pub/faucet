# faucet

General Faucet for Cosmos SDK testnet. There are two versions: [Cosmos](https://github.com/ping.pub/faucet) and [Evmos](https://github.com/ping-pub/faucet/tree/evmos)

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
 
 - setup configs, you have to change everything you need in `./config.js`
 ```js
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
    "project": {
        "testnet": "Ping Testnet", // What ever you want, recommend: chain-id, 
        "logo": "https://ping.pub/logo.svg",
        "deployer": ""
    },
    // request limitation
    limit: {
        // how many times each wallet address is allowed in a window(24h)
        address: 1, 
        // how many times each ip is allowed in a window(24h),
        // if you use proxy, double check if the req.ip returns client's ip.
        ip: 10 
    }
}
 ```
 
 - Run faucet
 ```sh
 node --es-module-specifier-resolution=node faucet.js
 ```
 
 # Test
 
 visit http://localhost:80 
 
 80 is default, you can edit it in the config.json
 
 # Donation

Your donation will help us make better products. Thanks in advance.

 - Address for ERC20: USDC, USDT, ETH
```
0x88BFec573Dd3E4b7d2E6BfD4D0D6B11F843F8aa1
```

 - You can donate any token in the Cosmos ecosystem: [here](https://ping.pub/coffee)
 
 
 
 
