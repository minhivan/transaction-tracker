// const Web3EthAbi = require('web3-eth-abi');
//
// let rs = Web3EthAbi.encodeFundectionSignature('claim(uint64)');
// console.log(rs)

const InputDataDecoder = require('ethereum-input-data-decoder');
const decoder = new InputDataDecoder(`${__dirname}/config/abi/zomland.json`);


const data = `0xaab8ab0c000000000000000000000000000000000000000000000000000000000000001f`;

const result = decoder.decodeData(data);

console.log(result);