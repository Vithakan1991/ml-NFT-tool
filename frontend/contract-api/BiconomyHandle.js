import axios from 'axios'
import axiosRetry from 'axios-retry'

axiosRetry(axios, { retries: 3 })

let biconomyApiURL
let biconomyApiKey
let biconomy_morpheusNftManagerDappApiId
let biconomy_morpheusNftManagerInfoDappApiId
let domainName
let domainVersion

const forwardMetaTx = async (body) => {
  return new Promise((resolve, reject) => {
    axios
      .post(biconomyApiURL, JSON.stringify(body), {
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': biconomyApiKey,
        },
      })
      .then((res) => resolve(res.data.txHash))
      .catch((error) => {
        console.log('forwardMetaTx - Error:', error)
        resolve(null)
      })
  })
}

const signTxData = async (senderAddress, data) => {
  const params = [senderAddress, JSON.stringify(data)]
  return new Promise((resolve, reject) => {
    window.ethereum
      .request({
        method: 'eth_signTypedData_v4',
        params,
        jsonrpc: '2.0',
        id: 999999999999,
        from: senderAddress,
      })
      .then((result) => {
        resolve(result)
      })
      .catch((err) => {
        reject(err)
      })
  })
}

const getSignatureParameters = (sig) => {
  const oriSig = sig.substring(2)
  const r = '0x' + oriSig.substring(0, 64)
  const s = '0x' + oriSig.substring(64, 128)
  const v = parseInt(oriSig.substring(128, 130), 16)

  return { r, s, v }
}

// Reference:
// https://github.com/nglglhtr/ETHOnline-Workshop/blob/6b615b8a4ef00553c17729c721572529303c8e1b/2-network-agnostic-transfer/meta-tx.js
const getTypedData = (data) => {
  const { name, version, chainId, verifyingContract, nonce, from, functionSignature } = data
  return {
    types: {
      EIP712Domain: [
        {
          name: 'name',
          type: 'string',
        },
        {
          name: 'version',
          type: 'string',
        },
        {
          name: 'chainId',
          type: 'uint256',
        },
        {
          name: 'verifyingContract',
          type: 'address',
        },
      ],
      MetaTransaction: [
        {
          name: 'nonce',
          type: 'uint256',
        },
        {
          name: 'from',
          type: 'address',
        },
        {
          name: 'functionSignature',
          type: 'bytes',
        },
      ],
    },
    domain: {
      name,
      version,
      chainId: Number(chainId),
      verifyingContract,
    },
    primaryType: 'MetaTransaction',
    message: {
      nonce: Number(nonce),
      from,
      functionSignature,
    },
  }
}

const biconomyWrapper = async (
  contractAddress,
  senderAddress,
  chainId,
  nonce,
  functionSignature,
  isInfoContract = false,
) => {
  const dataToSign = getTypedData({
    name: domainName,
    version: domainVersion,
    chainId,
    verifyingContract: contractAddress,
    nonce,
    from: senderAddress,
    functionSignature,
  })

  const signature = await signTxData(senderAddress, dataToSign)

  const { r, s, v } = getSignatureParameters(signature)

  const metaTxData = {
    to: contractAddress,
    userAddress: senderAddress,
    apiId: isInfoContract
      ? biconomy_morpheusNftManagerInfoDappApiId
      : biconomy_morpheusNftManagerDappApiId,
    params: [senderAddress, functionSignature, r, s, v],
  }

  const txHash = await forwardMetaTx(metaTxData)
  return txHash
}

export const setBiconomyEnv = (
  biconomyApiURL_,
  biconomyApiKey_,
  biconomy_morpheusNftManagerDappApiId_,
  biconomy_morpheusNftManagerInfoDappApiId_,
  domainName_,
  domainVersion_,
) => {
  biconomyApiURL = biconomyApiURL_
  biconomyApiKey = biconomyApiKey_
  biconomy_morpheusNftManagerDappApiId = biconomy_morpheusNftManagerDappApiId_
  biconomy_morpheusNftManagerInfoDappApiId = biconomy_morpheusNftManagerInfoDappApiId_
  domainName = domainName_
  domainVersion = domainVersion_
}

// erc721Contract
export const createCollectibleMetaTx = async (
  erc721Contract,
  erc721ContractAddress,
  senderAddress,
  chainId,
  tokenURI,
) => {
  const nonce = await erc721Contract.getSenderNonce(erc721ContractAddress, senderAddress)

  const functionSignature = await erc721Contract.createCollectibleFuncSig(
    erc721ContractAddress,
    tokenURI,
  )
  const txHash = await biconomyWrapper(
    erc721ContractAddress,
    senderAddress,
    chainId,
    nonce,
    functionSignature,
  )
  return txHash
}

// erc721Contract
export const addAuthorizedMetaTx = async (
  erc721Contract,
  erc721ContractAddress,
  senderAddress,
  chainId,
  userWalletAddress,
) => {
  const nonce = await erc721Contract.getSenderNonce(erc721ContractAddress, senderAddress)

  const functionSignature = await erc721Contract.addAuthorizedFuncSig(
    erc721ContractAddress,
    userWalletAddress,
  )
  const txHash = await biconomyWrapper(
    erc721ContractAddress,
    senderAddress,
    chainId,
    nonce,
    functionSignature,
  )
  return txHash
}

// erc721Contract
export const addAuthorizedBatchMetaTx = async (
  erc721Contract,
  erc721ContractAddress,
  senderAddress,
  chainId,
  userWalletAddressList,
) => {
  const nonce = await erc721Contract.getSenderNonce(erc721ContractAddress, senderAddress)

  const functionSignature = await erc721Contract.addAuthorizedBatchFuncSig(
    erc721ContractAddress,
    userWalletAddressList,
  )
  const txHash = await biconomyWrapper(
    erc721ContractAddress,
    senderAddress,
    chainId,
    nonce,
    functionSignature,
  )
  return txHash
}

// erc721Contract
export const revokeAuthorizedMetaTx = async (
  erc721Contract,
  erc721ContractAddress,
  senderAddress,
  chainId,
  userWalletAddress,
) => {
  const nonce = await erc721Contract.getSenderNonce(erc721ContractAddress, senderAddress)

  const functionSignature = await erc721Contract.revokeAuthorizedFuncSig(
    erc721ContractAddress,
    userWalletAddress,
  )
  const txHash = await biconomyWrapper(
    erc721ContractAddress,
    senderAddress,
    chainId,
    nonce,
    functionSignature,
  )
  return txHash
}

// erc721Contract
export const safeTransferFromMetaTx = async (
  erc721Contract,
  erc721ContractAddress,
  senderAddress,
  chainId,
  from,
  to,
  tokenId,
) => {
  const nonce = await erc721Contract.getSenderNonce(erc721ContractAddress, senderAddress)

  const functionSignature = await erc721Contract.safeTransferFromFuncSig(
    erc721ContractAddress,
    from,
    to,
    tokenId,
  )
  const txHash = await biconomyWrapper(
    erc721ContractAddress,
    senderAddress,
    chainId,
    nonce,
    functionSignature,
  )
  return txHash
}

/////////////////////////////////

// erc721ContractInfo
export const reqAuthMetaTx = async (
  erc721ContractInfo,
  erc721ContractInfoAddress,
  senderAddress,
  chainId,
  userWalletAddress,
) => {
  const nonce = await erc721ContractInfo.getSenderNonce(erc721ContractInfoAddress, senderAddress)

  const functionSignature = await erc721ContractInfo.reqAuthFuncSig(
    erc721ContractInfoAddress,
    userWalletAddress,
  )

  const txHash = await biconomyWrapper(
    erc721ContractInfoAddress,
    senderAddress,
    chainId,
    nonce,
    functionSignature,
    true,
  )
  return txHash
}

// erc721ContractInfo
export const addCollectionMetaTx = async (
  erc721ContractInfo,
  erc721ContractInfoAddress,
  senderAddress,
  chainId,
  userAddr,
  collectionContractAddr,
) => {
  const nonce = await erc721ContractInfo.getSenderNonce(erc721ContractInfoAddress, senderAddress)

  const functionSignature = await erc721ContractInfo.addCollectionFuncSig(
    erc721ContractInfoAddress,
    userAddr,
    collectionContractAddr,
  )

  const txHash = await biconomyWrapper(
    erc721ContractInfoAddress,
    senderAddress,
    chainId,
    nonce,
    functionSignature,
    true,
  )
  return txHash
}

// erc721ContractInfo
export const clearAuthReqListMetaTx = async (
  erc721ContractInfo,
  erc721ContractInfoAddress,
  senderAddress,
  chainId,
) => {
  const nonce = await erc721ContractInfo.getSenderNonce(erc721ContractInfoAddress, senderAddress)

  const functionSignature = await erc721ContractInfo.clearAuthReqListFuncSig(
    erc721ContractInfoAddress,
  )

  const txHash = await biconomyWrapper(
    erc721ContractInfoAddress,
    senderAddress,
    chainId,
    nonce,
    functionSignature,
    true,
  )
  return txHash
}

// erc721ContractInfo
export const addItemTxMetaTx = async (
  erc721ContractInfo,
  erc721ContractInfoAddress,
  senderAddress,
  chainId,
  userAddr,
  addItemTxHash,
) => {
  const nonce = await erc721ContractInfo.getSenderNonce(erc721ContractInfoAddress, senderAddress)

  const functionSignature = await erc721ContractInfo.addItemTxFuncSig(
    erc721ContractInfoAddress,
    userAddr,
    addItemTxHash,
  )

  const txHash = await biconomyWrapper(
    erc721ContractInfoAddress,
    senderAddress,
    chainId,
    nonce,
    functionSignature,
    true,
  )
  return txHash
}
