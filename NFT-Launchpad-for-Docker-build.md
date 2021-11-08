# NFT launchpad for Docker build

## Introduction

This NFT launchpad demonstrates gasless transactions only on Matic network

## Github repo

`git clone https://github.com/Morpheuslabs-io/ml-NFT-tool`

## Components

1. Smart Contract

- Folder `erc721`
- Folder `erc1155` (currently not used)

2. Web Application

Folder `frontend`

## App Configuration

The config file (`frontend/.env`) contains the following params that need to be set:

- `REACT_APP_ERC721_INFO_CONTRACT_ADDRESS`: deployed address of the contract `erc721/contracts/MorpheusNftManagerInfo.sol`

- `REACT_APP_ERC721_GASLESS_CONTRACT_ADDRESS`: deployed address of the contract `erc721/contracts/MorpheusNftManager.sol`

- `REACT_APP_BICONOMY_morpheusNftManagerDappApiId`: API ID of the Biconomy tx-relayer for the contract `REACT_APP_ERC721_GASLESS_CONTRACT_ADDRESS`

- `REACT_APP_BICONOMY_morpheusNftManagerInfoDappApiId`: API ID of the Biconomy tx-relayer for the contract `REACT_APP_ERC721_INFO_CONTRACT_ADDRESS`

**Notice**

- Whenever the contracts are changed and re-deployed, the API ID of the Biconomy tx-relayer must be re-registered at here: https://dashboard.biconomy.io/

- For how to deployment of contracts, please refer to this file `erc721/README.md`

## App Installation

cd in the folder `frontend`

To install, run this cmd `yarn`

To start, run this cmd `yarn start`
