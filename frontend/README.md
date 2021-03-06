# NFT Frontend Component

Web app to facilitate in launching NFT to Ethereum network and Matic network with the in-browser Metamask extension.

Both ERC721 and ERC1155 standards are supported.

The target network is determined by Metamask current connection.

## Metamask connected to Matic

To get Metamask connected to Matic, please set the `Custom RPC` with the following info:

- `Network Name`: `Matic Mumbai Testnet` or `Matic Mainnet`
- `New RPC URL`: `https://rpc-mumbai.maticvigil.com` or `https://rpc-mainnet.maticvigil.com`
- `Chain ID`: `80001` or `137`
- `Currency symbol`: `MATIC`
- `Block explorer URL`: `https://mumbai.polygonscan.com/` or `https://polygonscan.com/`

## Installation

`npm i`

## Configuration (only for interacting with Matic network)

The config file (`frontend/.env`) contains the following params that need to be set:

- `REACT_APP_ERC721_INFO_CONTRACT_ADDRESS`: deployed address of the contract `erc721/contracts/MorpheusNftManagerInfo.sol`

- `REACT_APP_ERC721_GASLESS_CONTRACT_ADDRESS`: deployed address of the contract `erc721/contracts/MorpheusNftManager.sol`

- `REACT_APP_BICONOMY_morpheusNftManagerDappApiId`: API ID of the Biconomy tx-relayer for the contract `REACT_APP_ERC721_GASLESS_CONTRACT_ADDRESS`

- `REACT_APP_BICONOMY_morpheusNftManagerInfoDappApiId`: API ID of the Biconomy tx-relayer for the contract `REACT_APP_ERC721_INFO_CONTRACT_ADDRESS`

**Notice**

- Whenever the contracts are changed and re-deployed, the API ID of the Biconomy tx-relayer must be re-registered at here: https://dashboard.biconomy.io/

- For how to deployment of contracts, please refer to this file `erc721/README.md`

## Deployment

`pm2 start script_deploy.sh`

The frontend server is listenning at port `8080` (as specified in the `.env` file)

**Notice**

`pm2` tool needs to be installed (if not yet) with this cmd `npm i pm2 -g`

## Start With Development Mode

For development on localhost, please use the below command to start

`npm start`
