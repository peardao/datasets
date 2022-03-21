const path = require('path')
const fs = require('fs')

const Web3 = require('web3')
const BigNumber = require('bignumber.js')
const {PEX_ADDRESS, RPC, UNCIRCULATING_ADDRESSES} = require("./const")
const ERC20_ABI = require('./abis/ERC20.json')


const dataDir = path.resolve(__dirname, '../data')
const tokenDir = path.resolve(dataDir, 'token')

const web3 = new Web3(RPC)
const contract = new web3.eth.Contract(ERC20_ABI, PEX_ADDRESS);

const updateToken = async () => {
  if(!fs.existsSync(tokenDir)){
    fs.mkdirSync(tokenDir, { recursive: true })
  }

  const totalSupply = await contract.methods.totalSupply().call()

  fs.writeFileSync(`${tokenDir}/totalSupply`, web3.utils.fromWei(totalSupply))

  const ret = await Promise.all(UNCIRCULATING_ADDRESSES.map(address => contract.methods.balanceOf(address).call()))
  const uncirculatingTotal = ret.reduce((total ,amt) => new BigNumber(amt).plus(total), new BigNumber(0))
  const circulatingTotal = new BigNumber(totalSupply).minus(uncirculatingTotal).toFixed(0, 1)

  fs.writeFileSync(`${tokenDir}/circulating`, new BigNumber(web3.utils.fromWei(circulatingTotal)).toFixed(8, 1))
}

updateToken()
