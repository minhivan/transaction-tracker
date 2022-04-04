let axios = require('axios');
let elasticService = require('../services/elastic.service')
const {isArray, isObject} = require("../helpers/utilities");
require('dotenv').config()
const Web3EthAbi = require('web3-eth-abi');


let currentBlockWallet = 0;
let currentBlockContract = 0;
let pathPrefixSmartContract = `/api?module=account&action=txlist&address=${process.env.WALLET_MASTER}&startblock=${currentBlockWallet}&sort=asc&apikey=${process.env.BSCSCAN_API_KEY}`;
let pathPrefixWallet = `/api?module=account&action=txlist&address=${process.env.WALLET_TO}&startblock=${currentBlockContract}&sort=asc&apikey=${process.env.BSCSCAN_API_KEY}`;

// init recursive call
const getData = async() => {
    try {
        const path = process.env.BSCSCAN_URL + pathPrefixWallet;
        let response = await  axios.get(path);
        let data = await response.data;

        if (!isArray(data.result)){
            throw new Error("Empty data");
        }

        const latestRecords = data.result[data.result.length -1];

        if (!isObject(latestRecords)) {
            throw new Error("Wrong records");
        }

        if (parseInt(latestRecords.blockNumber) !== currentBlockWallet) {
            currentBlockWallet = parseInt(latestRecords.blockNumber);
            // import
            console.log(" [x] Import data wallet tracker")
            elasticService.create_bulk('transaction_tracker', data.result)
        }
        await new Promise(resolve => setTimeout(resolve, process.env.BLOCK_PER_SECOND * 1000))

    } catch (e) {
        console.log(e.message)
        await getData();
    }
    await getData(); // recursive
}



// init recursive call
const getSmartContractData = async() => {
    // if (count > 10)
    //     process.exit(1);
    try {
        const path = process.env.BSCSCAN_URL + pathPrefixSmartContract;
        let response = await  axios.get(path);
        let data = await response.data;

        if (!isArray(data.result)){
            throw new Error("Empty data");
        }

        const latestRecords = data.result[data.result.length -1];

        if (!isObject(latestRecords)) {
            throw new Error("Wrong records");
        }

        if (parseInt(latestRecords.blockNumber) !== currentBlockContract) {
            currentBlockContract = parseInt(latestRecords.blockNumber);
            let filtered = data.result.filter(function(value, index, arr) {
                let methodHash = Web3EthAbi.encodeFunctionSignature('claim(uint64)');
                return value.input.includes(methodHash);
            })
            // import
            console.log(" [x] Import data smart contract tracker")
            elasticService.create_bulk('transaction_smart_contract_tracker', data.result);
            elasticService.create_bulk('transaction_smart_contract_claim_tracker', filtered);
        }
        await new Promise(resolve => setTimeout(resolve, process.env.BLOCK_PER_SECOND * 1000))
    } catch (e) {
        console.log(e.message);
        await getSmartContractData();
    }
   // console.timeEnd("answer time");
    await getSmartContractData();
}




module.exports = {
    getSmartContractData,
    getData
}

