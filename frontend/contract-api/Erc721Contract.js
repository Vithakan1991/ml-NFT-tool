import Erc721ContractAbi from '../erc721/contracts/MorpheusNftManager.json'
import contract from '@truffle/contract'
import Web3Service from '../controller/Web3'

let instance = null

export default class Erc721Contract {
  constructor(defaultAddress) {
    if (!instance) {
      instance = this
      this.web3 = Web3Service.getWeb3()
      this.contract = contract(Erc721ContractAbi)
      this.contract.setProvider(this.web3.currentProvider)
      this.contract.defaults({ from: defaultAddress })
    }

    return instance
  }

  // Launch a brandnew NFT token
  async create(data) {
    const { name, symbol, chainId, gasPrice } = data
    console.log('gasPrice:', gasPrice)
    try {
      const contractInstance = await this.contract.new(name, symbol, chainId, {
        gasPrice,
      })
      return contractInstance
    } catch (err) {
      console.log(err)
      return null
    }
  }

  async name(contractAddress) {
    try {
      const contractInstance = await this.contract.at(contractAddress)
      return contractInstance.name()
    } catch (err) {
      console.log(err)
      return null
    }
  }

  async symbol(contractAddress) {
    try {
      const contractInstance = await this.contract.at(contractAddress)
      return contractInstance.symbol()
    } catch (err) {
      console.log(err)
      return null
    }
  }

  async owner(contractAddress) {
    try {
      const contractInstance = await this.contract.at(contractAddress)
      return contractInstance.owner()
    } catch (err) {
      console.log(err)
      return null
    }
  }

  async tokenId(contractAddress) {
    try {
      const contractInstance = await this.contract.at(contractAddress)
      return contractInstance.tokenId()
    } catch (err) {
      console.log(err)
      return null
    }
  }

  async ownerOf(contractAddress, tokenId) {
    try {
      const contractInstance = await this.contract.at(contractAddress)
      return contractInstance.ownerOf(tokenId)
    } catch (err) {
      console.log(err)
      return null
    }
  }

  async tokenURI(contractAddress, tokenId) {
    try {
      const contractInstance = await this.contract.at(contractAddress)
      return contractInstance.tokenURI(tokenId)
    } catch (err) {
      console.log(err)
      return null
    }
  }

  async checkAuthorized(contractAddress, checkAddress) {
    try {
      const contractInstance = await this.contract.at(contractAddress)
      const result = await contractInstance.checkAuthorized(checkAddress)
      console.log('checkAuthorized - checkAddress:', checkAddress, ', result:', result)
      return result
    } catch (err) {
      console.log(err)
      return false
    }
  }

  async createCollectible(data) {
    const { contractAddress, tokenURI, gasPrice } = data
    try {
      const contractInstance = await this.contract.at(contractAddress)
      return contractInstance.createCollectible(tokenURI, {
        gasPrice,
      })
    } catch (err) {
      console.log(err)
      return null
    }
  }

  async addAuthorized(data) {
    const { contractAddress, userAddress, gasPrice } = data
    try {
      const contractInstance = await this.contract.at(contractAddress)
      return contractInstance.addAuthorized(userAddress, {
        gasPrice,
      })
    } catch (err) {
      console.log(err)
      return null
    }
  }

  async revokeAuthorized(data) {
    const { contractAddress, userAddress, gasPrice } = data
    try {
      const contractInstance = await this.contract.at(contractAddress)
      return contractInstance.clearAuthorized(userAddress, {
        gasPrice,
      })
    } catch (err) {
      console.log(err)
      return null
    }
  }

  async safeTransferFrom(data) {
    const { contractAddress, from, to, tokenId, gasPrice } = data
    try {
      const contractInstance = await this.contract.at(contractAddress)
      return contractInstance.safeTransferFrom(from, to, tokenId, {
        gasPrice,
      })
    } catch (err) {
      console.log(err)
      return null
    }
  }

  ////////// Meta-Tx ////////////////////////////////////
  async getSenderNonce(contractAddress, senderAddress) {
    try {
      const contractInstance = await this.contract.at(contractAddress)
      return contractInstance.getNonce(senderAddress)
    } catch (err) {
      console.log(err)
      return null
    }
  }

  async createCollectibleFuncSig(contractAddress, tokenURI) {
    const contractInstance = new this.web3.eth.Contract(Erc721ContractAbi.abi, contractAddress)
    return contractInstance.methods.createCollectible(tokenURI).encodeABI()
  }

  async addAuthorizedFuncSig(contractAddress, userWalletAddress) {
    const contractInstance = new this.web3.eth.Contract(Erc721ContractAbi.abi, contractAddress)
    return contractInstance.methods.addAuthorized(userWalletAddress).encodeABI()
  }

  async addAuthorizedBatchFuncSig(contractAddress, userWalletAddressList) {
    const contractInstance = new this.web3.eth.Contract(Erc721ContractAbi.abi, contractAddress)
    return contractInstance.methods.addAuthorizedBatch(userWalletAddressList).encodeABI()
  }

  async revokeAuthorizedFuncSig(contractAddress, userWalletAddress) {
    const contractInstance = new this.web3.eth.Contract(Erc721ContractAbi.abi, contractAddress)
    return contractInstance.methods.clearAuthorized(userWalletAddress).encodeABI()
  }

  async safeTransferFromFuncSig(contractAddress, from, to, tokenId) {
    const contractInstance = new this.web3.eth.Contract(Erc721ContractAbi.abi, contractAddress)
    return contractInstance.methods.safeTransferFrom(from, to, tokenId).encodeABI()
  }

  //////////////////////////////////////////////
}
