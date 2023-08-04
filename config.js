
import { stringToPath } from '@cosmjs/crypto'

export default {
    port: 8088, // http port 
    db: {
        path: "./db/faucet.db" // save request states 
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
                rpc_endpoint: " https://kent-rpc.side.exchange",
            },
            sender: {
                mnemonic: "enroll say issue energy aim south swing gesture elbow viable end action inherit key uphold",
                option: {
                    hdPaths: [stringToPath("m/44'/118'/0'/0/0")],
                    prefix: "kent"
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
                mnemonic: "enroll say issue energy aim south swing gesture elbow viable end action inherit key uphold",
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
                mnemonic: "enroll say issue energy aim south swing gesture elbow viable end action inherit key uphold",
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
