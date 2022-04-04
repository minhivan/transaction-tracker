const Web3EthAbi = require('web3-eth-abi');
let rs = Web3EthAbi.encodeFunctionSignature('claim(uint64)');

let input = "0xaab8ab0c0000000000000000000000000000000000000000000000000000000000000000";
if (input.includes(rs)) {
    console.log("Is claim")
}
// const InputDataDecoder = require('ethereum-input-data-decoder');
// const decoder = new InputDataDecoder(`${__dirname}/config/abi/zomland.json`);
//
//
// const data = `0xaab8ab0c000000000000000000000000000000000000000000000000000000000000001f`;
//
// const result = decoder.decodeData(data);
//
// console.log(result);