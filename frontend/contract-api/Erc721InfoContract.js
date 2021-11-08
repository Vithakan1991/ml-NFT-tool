import Erc721InfoContractAbi from '../erc721/contracts/MorpheusNftManagerInfo.json'
import contract from '@truffle/contract'
import Web3Service from '../controller/Web3'

let instance = null

export default class Erc721InfoContract {
  constructor(defaultAddress, deployedContractAddress) {
    if (!instance) {
      console.log('Erc721InfoContract - deployedContractAddress:', deployedContractAddress)
      instance = this
      this.web3 = Web3Service.getWeb3()
      this.contract = contract(Erc721InfoContractAbi)
      this.contract.setProvider(this.web3.currentProvider)
      this.contract.defaults({ from: defaultAddress })
      this.contract.at(deployedContractAddress).then((inst) => (this.contractInstance = inst))
    }

    return instance
  }

  // Collection
  async addCollection(data) {
    const { userAddr, collectionContractAddr, gasPrice } = data

    try {
      const result = await this.contractInstance.addCollection(userAddr, collectionContractAddr, {
        gasPrice,
      })
      console.log('Erc721InfoContract.addCollection - result:', result)
      return result
    } catch (err) {
      console.log(err)
      return null
    }
  }

  async getCollection(data) {
    const { userAddr, gasPrice } = data
    try {
      const result = await this.contractInstance.getCollection(userAddr, {
        gasPrice,
      })
      console.log('Erc721InfoContract.getCollection - result:', result)
      return result
    } catch (err) {
      console.log(err)
      return null
    }
  }
  ///////////////////////

  // Item
  async addItemTx(data) {
    const { userAddr, txHash, gasPrice } = data

    try {
      const result = await this.contractInstance.addItemTx(userAddr, txHash, {
        gasPrice,
      })
      console.log('Erc721InfoContract.addItemTx - result:', result)
      return result
    } catch (err) {
      console.log(err)
      return null
    }
  }

  async getItemTx(data) {
    const { userAddr, gasPrice } = data
    try {
      const result = await this.contractInstance.getItemTx(userAddr, {
        gasPrice,
      })
      console.log('Erc721InfoContract.getItemTx - result:', result)
      return result
    } catch (err) {
      console.log(err)
      return null
    }
  }
  ///////////////////////

  // Auth
  async reqAuth(data) {
    const { userAddr, gasPrice } = data

    try {
      const result = await this.contractInstance.reqAuth(userAddr, {
        gasPrice,
      })
      console.log('Erc721InfoContract.reqAuth - result:', result)
      return result
    } catch (err) {
      console.log(err)
      return null
    }
  }

  async getAuthReqList(data) {
    const { gasPrice } = data
    try {
      const result = await this.contractInstance.getAuthReqList({
        gasPrice,
      })
      console.log('Erc721InfoContract.getAuthReqList - result:', result)
      return result
    } catch (err) {
      console.log(err)
      return null
    }
  }

  async clearAuthReqList(data) {
    const { gasPrice } = data

    try {
      const result = await this.contractInstance.clearAuthReqList({
        gasPrice,
      })
      console.log('Erc721InfoContract.clearAuthReqList - result:', result)
      return result
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

  async addCollectionFuncSig(contractAddress, userAddr, collectionContractAddr) {
    const contractInstance = new this.web3.eth.Contract(Erc721InfoContractAbi.abi, contractAddress)
    return contractInstance.methods.addCollection(userAddr, collectionContractAddr).encodeABI()
  }

  async addItemTxFuncSig(contractAddress, userAddr, txHash) {
    const contractInstance = new this.web3.eth.Contract(Erc721InfoContractAbi.abi, contractAddress)
    return contractInstance.methods.addItemTx(userAddr, txHash).encodeABI()
  }

  async reqAuthFuncSig(contractAddress, userAddr) {
    const contractInstance = new this.web3.eth.Contract(Erc721InfoContractAbi.abi, contractAddress)
    return contractInstance.methods.reqAuth(userAddr).encodeABI()
  }

  async clearAuthReqListFuncSig(contractAddress) {
    const contractInstance = new this.web3.eth.Contract(Erc721InfoContractAbi.abi, contractAddress)
    return contractInstance.methods.clearAuthReqList().encodeABI()
  }

  //////////////////////////////////////////////
}
