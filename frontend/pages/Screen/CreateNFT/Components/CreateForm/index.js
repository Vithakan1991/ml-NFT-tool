import React from 'react'
import { withRouter } from 'next/router'
import { connect } from 'react-redux'
import {
  Button,
  Form,
  Input,
  Tooltip,
  Spin,
  Alert,
  notification,
  Select,
  Upload,
  Tag,
  Menu,
  Dropdown,
  Icon,
} from 'antd'
import { DownOutlined } from '@ant-design/icons'
import ImgCrop from 'antd-img-crop'
const { Option } = Select
import Erc721Contract from 'contract-api/Erc721Contract'
import Erc721InfoContract from 'contract-api/Erc721InfoContract'
import Web3Service from 'controller/Web3'
import {
  createCollectibleMetaTx,
  setBiconomyEnv,
  addCollectionMetaTx,
  addItemTxMetaTx,
  reqAuthMetaTx,
  addAuthorizedBatchMetaTx,
  clearAuthReqListMetaTx,
  revokeAuthorizedMetaTx,
  safeTransferFromMetaTx,
} from 'contract-api/BiconomyHandle'
import Erc1155Contract from 'contract-api/Erc1155Contract'
import IPFS from 'ipfs-http-client'
import axios from 'axios'
import detectEthereumProvider from '@metamask/detect-provider'
import web3Utils from 'web3-utils'
import { isMobile } from 'react-device-detect'
import './style.scss'

const ipfs = new IPFS({ host: 'ipfs.infura.io', port: 5001, protocol: 'https' })
const IPFS_BASE_URL = 'https://ipfs.io/ipfs'
const DEFAULT_GAS_PRICE = 50 // GWei
const explorerLink = {
  1: 'https://etherscan.io',
  3: 'https://ropsten.etherscan.io',
  4: 'https://rinkeby.etherscan.io',
  5: 'https://goerli.etherscan.io',
  42: 'https://kovan.etherscan.io',
  80001: 'https://mumbai.polygonscan.com',
  137: 'https://polygonscan.com',
}

const networkName = {
  1: 'Ethereum Mainnet',
  3: 'Ethereum Testnet Ropsten',
  4: 'Ethereum Testnet Rinkeby',
  5: 'Ethereum Testnet Goerli',
  42: 'Ethereum Testnet Kovan',
  80001: 'Matic Mumbai Testnet',
  137: 'Matic Mainnet',
}

const VERSION = 'V1.0 beta'

const erc721InfoContractAddress = process.env.REACT_APP_ERC721_INFO_CONTRACT_ADDRESS
const erc721ContractGasless = process.env.REACT_APP_ERC721_GASLESS_CONTRACT_ADDRESS

const biconomyApiURL = process.env.REACT_APP_BICONOMY_API_URL
const biconomyApiKey = process.env.REACT_APP_BICONOMY_API_KEY
const biconomy_morpheusNftManagerDappApiId =
  process.env.REACT_APP_BICONOMY_morpheusNftManagerDappApiId
const biconomy_morpheusNftManagerInfoDappApiId =
  process.env.REACT_APP_BICONOMY_morpheusNftManagerInfoDappApiId

const domainName = process.env.REACT_APP_DOMAIN_NAME
const domainVersion = process.env.REACT_APP_DOMAIN_VERSION

let gasPrice
class CreateForm extends React.PureComponent {
  constructor(props) {
    super(props)
    this.state = {
      loading: false,
      imgLoading: false,
      imgBase64: null,
      nftOpResult: null,
      networkID: null,
      address: null,
      selectedNftStandard: 'ERC721',
      isMenuCreateCollection: true,
      isMenuAddItem: false,
      isMenuAddAuthorized: false,
      isMenuTransferItem: false,
      nftCollectionName: '',
      nftCollectionSymbol: '',
      collectionList: [],
      userAuthReqList: [],
      selectedCollection: null,
      selectedTokenIdToTransfer: null,
      selectedTokenIdCollectionAddressToTransfer: null,
      isOwner: false,
      isAuthorizedForAddItem: false,
      itemTxList: [],
      itemTxTokenIdList: [],
      ownerTokenIdList: [],
      selectedTokenItemDesc: '',
      selectedTokenItemName: '',
      selectedTokenItemImg: '',
    }
    this.formRef = React.createRef()
    this.clr = null
    this.getItemTxList = this.getItemTxList.bind(this)
  }
  componentDidMount() {
    this.metamaskWeb3Handle()

    setBiconomyEnv(
      biconomyApiURL,
      biconomyApiKey,
      biconomy_morpheusNftManagerDappApiId,
      biconomy_morpheusNftManagerInfoDappApiId,
      domainName,
      domainVersion,
    )
  }

  componentWillUnmount() {
    clearInterval(this.clr)
  }

  metamaskWeb3Handle = () => {
    detectEthereumProvider()
      .then(async (provider) => {
        if (provider) {
          if (provider !== window.ethereum) {
            return notification.open({
              message: 'Metamask conflict',
              description: 'Do you have multiple wallets installed?',
            })
          } else {
            const accounts = await ethereum.request({ method: 'eth_accounts' })
            if (accounts.length === 0) {
              this.clr = setInterval(async () => {
                const accounts = await ethereum.request({ method: 'eth_accounts' })
                if (accounts.length !== 0) {
                  clearInterval(this.clr)
                  window.location.reload()
                }
              }, 1000)
              return notification.open({
                message: 'Metamask is locked',
                description: 'Please click the Metamask to unlock it',
              })
            } else {
              const defaultAddress = accounts[0]
              console.log(`defaultAddress:${defaultAddress}`)
              this.erc721Contract = new Erc721Contract(defaultAddress)
              this.erc1155Contract = new Erc1155Contract(defaultAddress)

              if (erc721InfoContractAddress) {
                this.erc721InfoContract = new Erc721InfoContract(
                  defaultAddress,
                  erc721InfoContractAddress,
                )
              } else {
                this.erc721InfoContract = null
              }

              let contractGaslessOwner = null
              if (erc721ContractGasless) {
                contractGaslessOwner = await this.erc721Contract.owner(erc721ContractGasless)
              }

              let networkID = await ethereum.request({ method: 'eth_chainId' })
              networkID = web3Utils.hexToNumber(networkID)
              console.log('networkID:', networkID)
              this.setState({
                networkID,
                address: defaultAddress,
                isOwner:
                  contractGaslessOwner &&
                  web3Utils.toChecksumAddress(contractGaslessOwner) ===
                    web3Utils.toChecksumAddress(defaultAddress),
              })
              const gasPriceGwei = await this.queryGasPrice(networkID)
              gasPrice = gasPriceGwei * Math.pow(10, 9)

              window.ethereum.on('chainChanged', (chainId) => {
                if (chainId !== this.state.networkID) {
                  notification.open({
                    message: 'Metamask network changed',
                    description: 'Reload is to happen',
                  })
                  setTimeout(() => {
                    window.location.reload()
                  }, 1000)
                }
              })

              ethereum.on('accountsChanged', (accounts) => {
                if (accounts[0] !== this.state.address) {
                  notification.open({
                    message: 'Metamask account changed',
                    description: 'Reload is to happen',
                  })
                  setTimeout(() => {
                    window.location.reload()
                  }, 1000)
                }
              })
            }
          }
        } else {
          notification.open({
            message: 'Metamask is not available',
            description: 'Please install Metamask on your web browser',
          })
        }
      })
      .catch((err) => console.error(err))
  }

  onMainMenuChange = (value) => {
    const { address } = this.state
    this.setState(
      {
        isMenuCreateCollection: value === 'create_collection',
        isMenuAddItem: value === 'create_item',
        isMenuAddAuthorized: value === 'add_authorized' || value === 'revoke_authorized',
        isMenuRevokeAuthorized: value === 'revoke_authorized',
        isMenuTransferItem: value === 'transfer_item',
        imgLoading: false,
        imgBase64: null,
        nftOpResult: null,
        nftCollectionName: '',
        nftCollectionSymbol: '',
        collectionList: [],
        ownerTokenIdList: [],
        userAuthReqList: [],
        itemTxList: [],
        selectedCollection: null,
        selectedTokenIdToTransfer: null,
        isAuthorizedForAddItem: false,
      },
      async () => {
        if (value === 'add_authorized' || value === 'revoke_authorized') {
          if (!this.erc721InfoContract) {
            window.location.reload()
          }
          let userAuthReqList = await this.erc721InfoContract.getAuthReqList({
            gasPrice,
          })
          if (!userAuthReqList) {
            window.location.reload()
          }

          this.setState({
            userAuthReqList,
          })
        } else if (value !== 'create_collection') {
          if (!this.erc721InfoContract) {
            window.location.reload()
          }
          let userCreatedContractList = await this.erc721InfoContract.getCollection({
            userAddr: address,
            gasPrice,
          })
          if (!userCreatedContractList) {
            window.location.reload()
          }

          if (value === 'create_item' || value === 'transfer_item') {
            if (!userCreatedContractList.includes(erc721ContractGasless)) {
              userCreatedContractList = [erc721ContractGasless, ...userCreatedContractList]
            }
            await this.getItemTxList()
          }

          const collectionList = []
          for (const contractAddr of userCreatedContractList) {
            const retrievedNftName = await this.erc721Contract.name(contractAddr)
            const retrievedNftSymbol = await this.erc721Contract.symbol(contractAddr)
            collectionList.push({
              collectionAddress: contractAddr,
              collectionName: retrievedNftName,
              collectionSymbol: retrievedNftSymbol,
            })
          }

          if (value === 'transfer_item') {
            await this.getOwnerTokenIdList(collectionList)
          }

          this.setState({
            collectionList,
          })
        }
      },
    )
  }

  queryGasPrice = async (networkID) => {
    const isMatic = networkID === 80001 || networkID === 137
    const gasStationURL = isMatic
      ? 'https://gasstation-mainnet.matic.network'
      : 'https://ethgasstation.info/json/ethgasAPI.json'
    return new Promise((resolve) => {
      axios
        .get(gasStationURL)
        .then((res) => {
          let gasPrice = Number(res.data.fast)
          gasPrice = isMatic ? gasPrice : gasPrice / 10
          console.log(`queryGasPrice: ${gasPrice} GWei (isMatic: ${isMatic})`)
          resolve(gasPrice)
        })
        .catch(() => {
          resolve(DEFAULT_GAS_PRICE)
        })
    })
  }
  createNewCollection = async (nftCollectionName, nftCollectionSymbol) => {
    const { address, networkID, selectedNftStandard } = this.state

    let result
    if (selectedNftStandard === 'ERC721') {
      result = await this.erc721Contract.create({
        name: nftCollectionName,
        symbol: nftCollectionSymbol,
        chainId: networkID,
        gasPrice,
      })
    } else {
      result = await this.erc1155Contract.create({
        name: nftCollectionName,
        symbol: nftCollectionSymbol,
        to: address,
        tokenURI: nftItemImage,
      })
    }

    // Add the newly-deployed NFT address
    if (result && result.address) {
      const tx = await addCollectionMetaTx(
        this.erc721InfoContract,
        erc721InfoContractAddress,
        address,
        networkID,
        address,
        result.address,
      )

      console.log('addCollectionMetaTx:', tx)
    }
    this.setState({
      loading: false,
      nftOpResult: result
        ? {
            address: result.address,
            tx: result.transactionHash,
          }
        : null,
    })
  }

  addItem = async (nftCollectionAddress, nftItemDescription, nftItemName, nftItemExternalLink) => {
    const { imgBase64, address, selectedNftStandard, selectedCollection, networkID } = this.state

    // Upload image to IPFS
    let ipfsResult = await ipfs.add(Buffer(imgBase64))
    let ipfsHash = ipfsResult[0].hash
    let external_url = nftItemExternalLink !== '' ? nftItemExternalLink : null
    const image = `${IPFS_BASE_URL}/${ipfsHash}`
    console.log('nftItemExternalLink:', nftItemExternalLink)

    // This is only the content that the tokenURI returns
    const tokenURIContent = JSON.stringify({
      name: nftItemName,
      description: nftItemDescription,
      external_url,
      image,
    })

    // Upload the entire JSON to get the tokenURI
    ipfsResult = await ipfs.add(Buffer(tokenURIContent))
    ipfsHash = ipfsResult[0].hash
    const tokenURI = `${IPFS_BASE_URL}/${ipfsHash}`
    console.log('tokenURI:', tokenURI)
    ///////////

    let result
    if (selectedNftStandard === 'ERC721') {
      const authorized = await this.erc721Contract.checkAuthorized(nftCollectionAddress, address)
      if (!authorized) {
        notification.open({
          message: 'Unauthorized',
          description: 'You are neither the owner nor authorized',
        })
        this.setState({
          loading: false,
          nftOpResult: null,
        })
        return
      }

      if (selectedCollection === erc721ContractGasless) {
        result = await createCollectibleMetaTx(
          this.erc721Contract,
          selectedCollection,
          address,
          networkID,
          tokenURI,
        )
        console.log('createCollectibleMetaTx:', result)
      } else {
        result = await this.erc721Contract.createCollectible({
          contractAddress: selectedCollection,
          tokenURI,
          gasPrice,
        })
        console.log('createCollectible:', result)
      }

      const txHash = await addItemTxMetaTx(
        this.erc721InfoContract,
        erc721InfoContractAddress,
        address,
        networkID,
        address,
        result.tx || result,
      )

      console.log('addItemTxMetaTx:', txHash)
    } else {
      // result = await this.erc1155Contract.create({
      //   name: nftCollectionName,
      //   symbol: nftCollectionSymbol,
      //   to: address,
      //   tokenURI: nftItemImage,
      // })
    }

    this.setState(
      {
        loading: false,
        nftOpResult: result
          ? {
              tx: result.tx || result,
            }
          : null,
      },
      () => this.getItemTxList(),
    )
  }

  getItemTxList = async () => {
    const { address } = this.state
    const itemTxList = await this.erc721InfoContract.getItemTx({
      userAddr: address,
      gasPrice,
    })

    if (!itemTxList) {
      return
    }

    const web3 = Web3Service.getWeb3()
    const itemTxTokenIdList = []
    for (const itemTx of itemTxList) {
      const tokenId = await this.getTokenIdFromTxHash(web3, itemTx)

      // Check the token owner again because the token could be transferred to others
      // const tokenOwner = await this.erc721Contract.ownerOf(erc721ContractGasless, tokenId)
      // if (web3Utils.toChecksumAddress(tokenOwner) === web3Utils.toChecksumAddress(address)) {
      itemTxTokenIdList.push({
        itemTx,
        tokenId,
      })
      // }
    }
    console.log('itemTxTokenIdList:', itemTxTokenIdList)
    this.setState(
      {
        itemTxList,
        itemTxTokenIdList,
      },
      () => this.forceUpdate(),
    )
  }

  // Get owner tokenIds from all relevant NFT collection list
  getOwnerTokenIdList = async (collectionList) => {
    if (!this.erc721Contract) {
      notification.open({
        message: 'Metamask is locked',
        description: 'Please click the Metamask to unlock it',
      })
      window.location.reload()
    }

    const { address } = this.state

    const ownerTokenIdList = []
    for (const nftCollection of collectionList) {
      const collectionAddr = nftCollection.collectionAddress

      const tokenIdCnt = await this.erc721Contract.tokenId(collectionAddr)
      console.log(`tokenIdCnt: ${tokenIdCnt} - collectionAddr: ${collectionAddr}`)

      if (!tokenIdCnt || tokenIdCnt === 0) {
        continue
      }

      for (let tokenId = 1; tokenId <= tokenIdCnt; tokenId++) {
        // Check the token owner again because the token could be transferred to others
        const tokenOwner = await this.erc721Contract.ownerOf(collectionAddr, tokenId)
        if (
          tokenOwner &&
          address &&
          web3Utils.toChecksumAddress(tokenOwner) === web3Utils.toChecksumAddress(address)
        ) {
          ownerTokenIdList.push({
            tokenId,
            collectionName: nftCollection.collectionName,
            collectionSymbol: nftCollection.collectionSymbol,
            collectionAddress: nftCollection.collectionAddress,
          })
        }
      }
    }

    console.log('ownerTokenIdList:', ownerTokenIdList)
    this.setState(
      {
        ownerTokenIdList,
      },
      () => this.forceUpdate(),
    )
  }

  addRevokeAuthorized = async (userWalletAddress) => {
    const { isMenuAddAuthorized, selectedCollection } = this.state

    let result
    if (isMenuAddAuthorized) {
      result = await this.erc721Contract.addAuthorized({
        contractAddress: selectedCollection,
        userAddress: userWalletAddress,
        gasPrice,
      })
    } else {
      result = await this.erc721Contract.revokeAuthorized({
        contractAddress: selectedCollection,
        userAddress: userWalletAddress,
        gasPrice,
      })
    }
    console.log('result:', result)
    this.setState({
      loading: false,
      nftOpResult: result
        ? {
            tx: result,
          }
        : null,
    })
  }

  onFinish = async (values) => {
    const callbackOnFinish = async () => {
      this.setState({
        loading: true,
        nftOpResult: null,
      })
      const {
        nftCollectionName,
        nftCollectionSymbol,
        nftCollectionAddress,
        nftItemDescription,
        nftItemName,
        nftItemExternalLink,
        nftItemImage,
        revokeUserAddress,
        receivingUserAddress,
      } = values
      const {
        isMenuCreateCollection,
        isMenuAddItem,
        isMenuAddAuthorized,
        isMenuRevokeAuthorized,
        isMenuTransferItem,
        isAuthorizedForAddItem,
        address,
        networkID,
        userAuthReqList,
        selectedTokenIdToTransfer,
        selectedTokenIdCollectionAddressToTransfer,
      } = this.state

      if (isMenuCreateCollection) {
        await this.createNewCollection(nftCollectionName, nftCollectionSymbol)
      } else if (isMenuAddItem) {
        if (isAuthorizedForAddItem) {
          await this.addItem(
            nftCollectionAddress,
            nftItemDescription,
            nftItemName,
            nftItemExternalLink,
            nftItemImage,
          )
        } else {
          const result = await reqAuthMetaTx(
            this.erc721InfoContract,
            erc721InfoContractAddress,
            address,
            networkID,
            address,
          )

          console.log('result:', result)
          this.setState({
            loading: false,
            nftOpResult: result
              ? {
                  tx: result,
                }
              : null,
          })
        }
      } else if (isMenuTransferItem) {
        console.log('selectedTokenIdToTransfer:', selectedTokenIdToTransfer)

        // Meta tx -> not work
        // let result = await safeTransferFromMetaTx(
        //   this.erc721Contract,
        //   erc721ContractGasless,
        //   address,
        //   networkID,
        //   address,
        //   receivingUserAddress,
        //   selectedTokenIdToTransfer,
        // )
        // console.log('safeTransferFromMetaTx - result:', result)
        // this.setState({
        //   loading: false,
        //   nftOpResult: result
        //     ? {
        //         tx: result,
        //       }
        //     : null,
        // })

        // Normal tx -> work
        let result = await this.erc721Contract.safeTransferFrom({
          contractAddress: selectedTokenIdCollectionAddressToTransfer,
          from: address,
          to: receivingUserAddress,
          tokenId: selectedTokenIdToTransfer,
          gasPrice,
        })
        console.log('safeTransferFrom - result:', result)
        this.setState({
          loading: false,
          nftOpResult: result
            ? {
                tx: result.tx,
              }
            : null,
        })
      } else {
        let result
        if (!isMenuRevokeAuthorized) {
          result = await addAuthorizedBatchMetaTx(
            this.erc721Contract,
            erc721ContractGasless,
            address,
            networkID,
            userAuthReqList,
          )

          console.log('addAuthorizedBatchMetaTx - result:', result)

          result = await clearAuthReqListMetaTx(
            this.erc721InfoContract,
            erc721InfoContractAddress,
            address,
            networkID,
          )
          console.log('clearAuthReqListMetaTx - result:', result)
        } else {
          result = await revokeAuthorizedMetaTx(
            this.erc721Contract,
            erc721ContractGasless,
            address,
            networkID,
            revokeUserAddress,
          )

          console.log('revokeAuthorizedMetaTx - result:', result)
        }

        this.setState({
          loading: false,
          nftOpResult: result
            ? {
                tx: result,
              }
            : null,
        })
      }
    }
    const isSigned = this.state.address !== null
    if (!isSigned || !this.erc721Contract) {
      notification.open({
        message: 'Metamask is locked',
        description: 'Please click the Metamask to unlock it',
      })
    } else {
      callbackOnFinish().catch(() => {
        this.setState({
          loading: false,
          nftOpResult: null,
        })
      })
    }
  }
  generateNumber = (min = 1, max = 10000) => {
    // const rand = Math.floor(Math.random() * (max - min + 1) + min)
    // return rand
    return 1
  }

  getCurrAddress = async () => {
    return new Promise((resolve) => {
      window.ethereum
        .enable()
        .then((accounts) => {
          const defaultAddress = accounts[0]
          return resolve(defaultAddress)
        })
        .catch((e) => {
          console.error(e)
        })
    })
  }
  onNftStandardChange = (e) => {
    if (this.state.selectedNftStandard !== e) {
      this.setState({ selectedNftStandard: e })
    }
  }

  getTokenMetadata = async (tokenId, collectionAddr) => {
    if (!this.erc721Contract) {
      notification.open({
        message: 'Metamask is locked',
        description: 'Please click the Metamask to unlock it',
      })
      return
    }

    const tokenURI = await this.erc721Contract.tokenURI(collectionAddr, tokenId)
    let metadata = await axios.get(tokenURI)
    if (!metadata) {
      return null
    } else {
      return metadata.data
    }
  }

  // "e" contains only the index of "ownerTokenIdList"
  onItemTxTokenIdListChange = async (e) => {
    const { selectedTokenIdToTransfer, ownerTokenIdList } = this.state
    const selectedTokeIdData = ownerTokenIdList[e]
    const tokenMetadata = await this.getTokenMetadata(
      selectedTokeIdData.tokenId,
      selectedTokeIdData.collectionAddress,
    )
    console.log('tokenMetadata:', tokenMetadata)
    this.setState(
      {
        selectedTokenIdToTransfer: selectedTokeIdData.tokenId,
        selectedTokenIdCollectionAddressToTransfer: selectedTokeIdData.collectionAddress,
        selectedTokenItemName: tokenMetadata.name,
        selectedTokenItemDesc: tokenMetadata.description,
        selectedTokenItemImg: tokenMetadata.image,
      },
      () => {
        // this.getContractInfo(e)
      },
    )
  }

  onCollectionAddressListChange = (e) => {
    const { selectedCollection } = this.state
    if (!selectedCollection || selectedCollection !== e) {
      this.setState(
        {
          selectedCollection: e,
          nftCollectionName: '',
          nftCollectionSymbol: '',
          nftOpResult: null,
          isAuthorizedForAddItem: false,
        },
        () => {
          this.getContractInfo(e)
        },
      )
    }
  }

  handleChange = (info) => {
    if (info.file.status === 'uploading') {
      this.setState({ imgLoading: true })
      return
    }
    if (info.file.status === 'done') {
      const reader = new FileReader()
      reader.readAsArrayBuffer(info.file.originFileObj) // convert file to array for buffer
      reader.onloadend = () => {
        this.setState({ imgBase64: Buffer(reader.result), imgLoading: false })
      }
    }
  }

  onPreview = async (file) => {
    let src = file.url
    if (!src) {
      src = await new Promise((resolve) => {
        const reader = new FileReader()
        reader.readAsDataURL(file.originFileObj)
        reader.onload = () => resolve(reader.result)
      })
    }
    const image = new Image()
    image.src = src
    const imgWindow = window.open(src)
    imgWindow.document.write(image.outerHTML)
  }

  getContractInfo = async (contractAddr) => {
    if (!this.erc721Contract || !this.erc721InfoContract) {
      notification.open({
        message: 'Metamask is locked',
        description: 'Please click the Metamask to unlock it',
      })
      return
    }
    const retrievedNftName = await this.erc721Contract.name(contractAddr)
    const retrievedNftSymbol = await this.erc721Contract.symbol(contractAddr)
    const isAuthorizedForAddItem = await this.erc721Contract.checkAuthorized(
      contractAddr,
      this.state.address,
    )

    if (!retrievedNftName || !retrievedNftSymbol) {
      notification.open({
        message: 'Collection address not found',
        description: `Please ensure collection address is valid on ${
          networkName[this.state.networkID] || '...'
        }`,
      })
      this.setState({ nftCollectionName: null, nftCollectionName: null })
      return
    }
    this.setState({
      nftCollectionName: retrievedNftName,
      nftCollectionSymbol: retrievedNftSymbol,
      isAuthorizedForAddItem,
    })
  }

  getButtonLabel = () => {
    const { isMenuCreateCollection, isMenuAddItem, selectedCollection, isAuthorizedForAddItem } =
      this.state

    if (isMenuCreateCollection) {
      return 'Create Collection'
    } else {
      if (isMenuAddItem) {
        if (isAuthorizedForAddItem) {
          return selectedCollection === erc721ContractGasless ? 'Add Item (gasless)' : 'Add Item'
        } else {
          return 'Submit'
        }
      } else {
        // add/revoke authorized
        return 'Submit'
      }
    }
  }

  getButtonStatusLabel = () => {
    const { isMenuCreateCollection, isMenuAddItem, isAuthorizedForAddItem } = this.state

    if (isMenuCreateCollection) {
      return 'NFT Token is being launched'
    } else {
      if (isMenuAddItem) {
        if (isAuthorizedForAddItem) {
          return 'Collection item is being added'
        } else {
          return 'In progress'
        }
      } else {
        // add/revoke authorized
        return 'In progress'
      }
    }
  }

  menu = () => {
    const { itemTxTokenIdList, networkID } = this.state
    return (
      <Menu>
        {itemTxTokenIdList.map((item, idx) => (
          <Menu.Item key={idx}>
            <a
              target="_blank"
              rel="noopener noreferrer"
              href={`${explorerLink[networkID]}/tx/${item.itemTx}`}
            >
              {`Token ID: ${item.tokenId}, Transaction: ${item.itemTx}`}
            </a>
          </Menu.Item>
        ))}
      </Menu>
    )
  }

  renderMenuCreateCollection = () => {
    return (
      <>
        <Tooltip placement="bottomRight" title="NFT token name">
          <Form.Item
            label={<div className="text text-bold text-color-4 text-size-3x">Collection Name</div>}
            name="nftCollectionName"
            rules={[
              {
                required: true,
                message: 'NFT token name is required',
              },
            ]}
          >
            <Input />
          </Form.Item>
        </Tooltip>

        <Tooltip placement="bottomRight" title="NFT token symbol">
          <Form.Item
            label={
              <div className="text text-bold text-color-4 text-size-3x">Collection Symbol</div>
            }
            name="nftCollectionSymbol"
            rules={[
              {
                required: true,
                message: 'NFT token symbol is required',
              },
            ]}
          >
            <Input />
          </Form.Item>
        </Tooltip>
      </>
    )
  }

  getTokenIdFromTxHash = async (web3, txHash) => {
    const { address } = this.state
    const txReceipt = await web3.eth.getTransactionReceipt(txHash)
    let tokenId = null
    const ADDRESS_ZERO = '0x0000000000000000000000000000000000000000'
    for (const txLog of txReceipt.logs) {
      if (txLog.topics.length < 4) {
        continue
      }
      if (
        txLog.topics[1].indexOf(ADDRESS_ZERO) !== -1 &&
        txLog.topics[2].indexOf(address.substr(2).toLowerCase()) !== -1
      ) {
        try {
          tokenId = web3Utils.hexToNumber(txLog.topics[3])
          console.log('tokenId:', tokenId)
        } catch (err) {}
      }
    }
    return tokenId
  }

  renderMenuTransferItem = () => {
    const {
      ownerTokenIdList,
      selectedTokenItemDesc,
      selectedTokenItemName,
      selectedTokenItemImg,
      collectionList,
    } = this.state
    if (!ownerTokenIdList) {
      return
    }
    console.log('collectionList:', collectionList)
    return (
      <>
        <Tooltip
          // placement="bottomLeft"
          title="List of the created NFT tokens"
        >
          <Form.Item
            label={
              <div className="text text-bold text-color-4 text-size-3x">NFT Token Item List</div>
            }
            name="nftCreatedItem"
            rules={[
              {
                required: true,
                message: 'NFT token is required',
              },
            ]}
          >
            <Select onChange={this.onItemTxTokenIdListChange}>
              {ownerTokenIdList.map((item, idx) => (
                <Option key={idx} value={idx}>
                  {`Token ID: ${item.tokenId} (${item.collectionName} / ${item.collectionSymbol})`}
                </Option>
              ))}
            </Select>
          </Form.Item>
        </Tooltip>

        <Form.Item
          label={
            <div className="text text-bold text-color-4 text-size-3x">NFT Token Item Name</div>
          }
        >
          <Input placeholder={selectedTokenItemName} disabled={true} />
        </Form.Item>
        <Form.Item
          label={
            <div className="text text-bold text-color-4 text-size-3x">
              NFT Token Item Description
            </div>
          }
        >
          <Input placeholder={selectedTokenItemDesc} disabled={true} />
        </Form.Item>
        <Form.Item
          label={
            <div className="text text-bold text-color-4 text-size-3x">NFT Token Item Image</div>
          }
        >
          <img width={isMobile ? 200 : 300} src={selectedTokenItemImg} />
        </Form.Item>
        <Tooltip placement="bottomRight" title="User address to receive the NFT token item">
          <Form.Item
            label={<div className="text text-bold text-color-4 text-size-3x">User Address</div>}
            name="receivingUserAddress"
            rules={[
              {
                required: true,
                message: 'User address is required',
              },
            ]}
          >
            <Input />
          </Form.Item>
        </Tooltip>
      </>
    )
  }

  renderNotMenuAddAuthorized = () => {
    const { nftCollectionName, nftCollectionSymbol, collectionList } = this.state

    return (
      <>
        <Tooltip
          // placement="bottomLeft"
          title="Transaction history of adding items"
        >
          <Dropdown overlay={this.menu}>
            <a className="ant-dropdown-link" href="#">
              Transaction History <DownOutlined />
            </a>
          </Dropdown>
          {/* </Form.Item> */}
        </Tooltip>
        <div style={{ marginBottom: '40px' }} />
        <Tooltip
          // placement="bottomLeft"
          title="This is the NFT token address after creating new collection"
        >
          <Form.Item
            label={
              <div className="text text-bold text-color-4 text-size-3x">Collection Address</div>
            }
            name="nftCollectionAddress"
            rules={[
              {
                required: true,
                message: 'NFT token address is required',
              },
            ]}
          >
            <Select
              defaultValue={erc721ContractGasless}
              onChange={this.onCollectionAddressListChange}
            >
              {collectionList.map((entry, idx) => {
                return (
                  <Option key={idx} value={entry.collectionAddress}>
                    {`${entry.collectionName} ${
                      entry.collectionAddress === erc721ContractGasless
                        ? `(gasless), ${entry.collectionAddress}`
                        : `, ${entry.collectionAddress}`
                    }`}
                  </Option>
                )
              })}
            </Select>
          </Form.Item>
        </Tooltip>
        <Tooltip placement="bottomRight" title="This is the NFT token name">
          <Form.Item
            label={<div className="text text-bold text-color-4 text-size-3x">Collection Name</div>}
            name=""
            rules={[
              {
                required: false,
              },
            ]}
          >
            <Input placeholder={nftCollectionName} disabled={true} />
          </Form.Item>
        </Tooltip>

        <Tooltip placement="bottomRight" title="This is the NFT token symbol">
          <Form.Item
            label={
              <div className="text text-bold text-color-4 text-size-3x">Collection Symbol</div>
            }
            name=""
            rules={[
              {
                required: false,
              },
            ]}
          >
            <Input placeholder={nftCollectionSymbol} disabled={true} />
          </Form.Item>
        </Tooltip>
      </>
    )
  }

  renderMenuAddItemAndIsAuthorized = () => {
    const { selectedNftStandard, imgBase64 } = this.state

    return (
      <>
        <Tooltip placement="bottomRight" title="NFT token item name">
          <Form.Item
            label={<div className="text text-bold text-color-4 text-size-3x">Item Name</div>}
            name="nftItemName"
            rules={[
              {
                required: true,
                message: 'NFT token item name is required',
              },
            ]}
          >
            <Input />
          </Form.Item>
        </Tooltip>
        <Tooltip placement="bottomRight" title="NFT token item description">
          <Form.Item
            label={<div className="text text-bold text-color-4 text-size-3x">Item Description</div>}
            name="nftItemDescription"
            rules={[
              {
                required: true,
                message: 'NFT token item description is required',
              },
            ]}
          >
            <Input />
          </Form.Item>
        </Tooltip>

        <Tooltip placement="bottomRight" title="External link to the NFT token item">
          <Form.Item
            label={
              <div className="text text-bold text-color-4 text-size-3x">Item External Link</div>
            }
            name="nftItemExternalLink"
            rules={[
              {
                required: false,
                message: 'NFT token item external link is required',
              },
            ]}
          >
            <Input />
          </Form.Item>
        </Tooltip>

        <Tooltip placement="bottomRight" title="NFT token item image">
          <Form.Item
            label={
              <div className="text text-bold text-color-4 text-size-3x">
                {selectedNftStandard === 'ERC721' ? 'Item Image' : 'Base Metadata URI'}
              </div>
            }
            name="nftItemImage"
            rules={[
              {
                // required: true,
                // message: 'NFT link is required',
              },
            ]}
          >
            <ImgCrop rotate>
              <Upload
                name="avatar"
                listType="picture-card"
                className="avatar-uploader"
                onChange={this.handleChange}
                onPreview={this.onPreview}
                onRemove={() => {
                  this.setState({ imgBase64: null })
                }}
              >
                {!imgBase64 && '+ Upload'}
              </Upload>
            </ImgCrop>
          </Form.Item>
        </Tooltip>
      </>
    )
  }

  renderMenuAddRevokeAuthorized = () => {
    const { userAuthReqList, isMenuAddAuthorized, isMenuRevokeAuthorized } = this.state

    if (!isMenuRevokeAuthorized) {
      return (
        <>
          <Tooltip
            // placement="bottomLeft"
            title="User address list waiting for authorization"
          >
            <Form.Item
              label={
                <div className="text text-bold text-color-4 text-size-3x">User Address List</div>
              }
              name="userAuthReqList"
              rules={[
                {
                  required: false,
                  message: 'User address list is required',
                },
              ]}
            >
              <Select>
                {userAuthReqList.map((entry, idx) => {
                  return (
                    <Option key={idx} value={entry}>
                      {entry}
                    </Option>
                  )
                })}
              </Select>
            </Form.Item>
          </Tooltip>
        </>
      )
    } else {
      return (
        <Tooltip placement="bottomRight" title="User address to be revoked">
          <Form.Item
            label={<div className="text text-bold text-color-4 text-size-3x">User Address</div>}
            name="revokeUserAddress"
            rules={[
              {
                required: true,
                message: 'User address is required',
              },
            ]}
          >
            <Input />
          </Form.Item>
        </Tooltip>
      )
    }
  }

  render() {
    const {
      nftOpResult,
      networkID,
      nftCollectionName,
      loading,
      isMenuCreateCollection,
      isMenuAddAuthorized,
      isMenuAddItem,
      isOwner,
      isAuthorizedForAddItem,
      isMenuTransferItem,
    } = this.state
    const layout = {
      labelCol: { span: 13 },
      wrapperCol: { span: 11 },
    }

    return (
      <div className="create-form-container">
        <div className="wrapper">
          <div className="page-title" style={{ color: '#ffffff', padding: '40px' }}>
            <span
              style={{ textAlign: 'center', fontSize: `${isMobile ? '25px' : '35px'}` }}
            >{`NFT Launch Pad for ${networkName[networkID] || '...'}`}</span>
            {isMobile ? (
              <>
                <br />
                <div style={{ fontSize: '20px' }}>{VERSION}</div>
              </>
            ) : (
              <span style={{ float: 'right', fontSize: '20px' }}>{VERSION}</span>
            )}
          </div>
          <Form
            ref={this.formRef}
            {...layout}
            name="create-nft"
            labelAlign="left"
            initialValues={{
              numberOfIssuing: 1,
              remember: true,
              nftItemDescription: '',
              nftItemName: '',
              userWalletAddress: '',
              nftItemExternalLink: 'https://',
              enableSend: true,
              ownerMessage: '',
              nftID: this.generateNumber(),
              // nftOwner: '',
              nftStandard: 'ERC721',
              nftCollectionAddress: '',
            }}
            onFinish={this.onFinish}
          >
            <Form.Item>
              <Select defaultValue="create_collection" onChange={this.onMainMenuChange}>
                <Option value="create_collection">Create new collection</Option>
                <Option value="create_item">Add item to an existing collection</Option>
                <Option value="transfer_item">Transfer item to another user address</Option>
                {isOwner && (
                  <>
                    <Option value="add_authorized">Authorize address to add item</Option>
                    <Option value="revoke_authorized">Revoke authorized address</Option>
                  </>
                )}
              </Select>
            </Form.Item>

            <Tooltip placement="bottomRight" title="Select NFT token standard">
              <Form.Item
                label={<div className="text text-bold text-color-4 text-size-3x">Standard</div>}
                name="nftStandard"
                rules={[
                  {
                    required: true,
                    message: 'NFT token standard is required',
                  },
                ]}
              >
                <Select defaultValue="ERC721" onChange={this.onNftStandardChange}>
                  <Option value="ERC721">ERC721</Option>
                  <Option value="ERC1155" disabled={true}>
                    ERC1155
                  </Option>
                </Select>
              </Form.Item>
            </Tooltip>

            {isMenuTransferItem ? (
              this.renderMenuTransferItem()
            ) : isMenuCreateCollection ? (
              this.renderMenuCreateCollection()
            ) : (
              <>
                {!isMenuAddAuthorized && this.renderNotMenuAddAuthorized()}
                {isMenuAddItem
                  ? isAuthorizedForAddItem === true
                    ? this.renderMenuAddItemAndIsAuthorized()
                    : nftCollectionName !== '' && (
                        <div
                          className="text text-bold text-color-4 text-size-3x"
                          style={{ color: 'red' }}
                        >
                          Please click button Submit below to request for authorization to add item
                        </div>
                      )
                  : // authorize address to add item
                    this.renderMenuAddRevokeAuthorized()}
              </>
            )}

            <Form.Item xs={24} md={24}>
              <Button type="primary" htmlType="submit" className="ant-big-btn" disabled={loading}>
                {loading ? <Spin /> : this.getButtonLabel()}
              </Button>
              <div style={{ marginBottom: '5px' }} />
              {loading && (
                <Alert
                  message={this.getButtonStatusLabel()}
                  description="Please wait!"
                  type="info"
                />
              )}
            </Form.Item>
            {!loading && nftOpResult !== null && (
              <div style={{ justifyContent: 'center' }}>
                {isMenuCreateCollection ? (
                  <a
                    href={`${explorerLink[networkID]}/address/${nftOpResult.address}`}
                    target="_blank"
                  >
                    NFT Token Address: {nftOpResult.address}
                  </a>
                ) : (
                  <a href={`${explorerLink[networkID]}/tx/${nftOpResult.tx}`} target="_blank">
                    Transaction: {nftOpResult.tx}
                  </a>
                )}
              </div>
            )}
          </Form>
        </div>
      </div>
    )
  }
}

const mapStateToProps = () => ({})

export default withRouter(connect(mapStateToProps, null)(CreateForm))
