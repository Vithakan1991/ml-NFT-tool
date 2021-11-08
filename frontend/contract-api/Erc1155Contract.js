import ERC1155ContractAbi from '../erc1155/contracts/ERC1155Tradable.json'
import contract from '@truffle/contract'
import Web3Service from '../controller/Web3'

let instance = null

export default class ERC1155Contract {
  constructor(defaultAddress) {
    if (!instance) {
      instance = this
      this.web3 = Web3Service.getWeb3()
      this.contract = contract(ERC1155ContractAbi)
      this.contract.setProvider(this.web3.currentProvider)
      this.contract.defaults({ from: defaultAddress })
    }

    return instance
  }

  addSlashToUri = (uri) => {
    if (uri[uri.length - 1] !== '/') {
      return `${uri}/`
    } else {
      return uri
    }
  }

  async create(data) {
    const { name, symbol, to, tokenURI } = data
    try {
      const contractInstance = await this.contract.new(
        name,
        symbol,
        this.addSlashToUri(tokenURI),
        Web3Service.toChecksumAddress(to),
        1,
      )
      return contractInstance
    } catch (err) {
      console.log(err)
      return null
    }
  }

  async name(contractAddress) {
    try {
      console.log('contractAddress:', contractAddress)
      const contractInstance = await this.contract.at(contractAddress)
      return contractInstance.name()
    } catch (err) {
      console.log(err)
      return null
    }
  }
}
