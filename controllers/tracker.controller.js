let axios = require('axios');
let elasticService = require('../services/elastic.service')
const {isArray, isObject} = require("../helpers/utilities");
require('dotenv').config()
const Web3EthAbi = require('web3-eth-abi');


let currentBlockWallet = 0;
let currentBlockContract = 0;
let count_process_1 = 0;
let count_process_2 = 0;

// init recursive call
const getData = async() => {
    if (count_process_1 > 250)
        process.exit(1);

    await new Promise(resolve => setTimeout(resolve, process.env.BLOCK_PER_SECOND * 1000))
    try {
        console.log(" [*] Starting tracker data from wallet");
        let path = `/api?module=account&action=txlist&address=${process.env.WALLET_TO}&startblock=${currentBlockContract}&sort=asc&apikey=${process.env.BSCSCAN_API_KEY}`;
        const url = process.env.BSCSCAN_URL + path;
        let response = await  axios.get(url);
        let data = await response.data;

        if (!isArray(data.result)){
            throw new Error("Empty data");
        }

        const latestRecords = data.result[data.result.length -1];

        if (!isObject(latestRecords)) {
            throw new Error("Wrong records");
        }


        if (Number(latestRecords.blockNumber) !== Number(currentBlockWallet)) {
            currentBlockWallet = Number(latestRecords.blockNumber);
            // import
            console.log(" [x] Starting import data to elasticsearch");
            elasticService.create_bulk('transaction_tracker', data.result)
        }
        console.log(` [x] Done process tracker - ${count_process_1} times`);
        count_process_1 ++;
        await getData(); // recursive
    } catch (e) {
        console.log(e.message)
        await getData();
    }

}



// init recursive call
const getSmartContractData = async() => {
    if (count_process_2 > 250)
        process.exit(1);

    await new Promise(resolve => setTimeout(resolve, process.env.BLOCK_PER_SECOND * 1000));
    try {
        console.log(" [*] Starting tracker data from smart contract");
        let path = `/api?module=account&action=txlist&address=${process.env.WALLET_MASTER}&startblock=${currentBlockWallet}&sort=asc&apikey=${process.env.BSCSCAN_API_KEY}`;

        const url = process.env.BSCSCAN_URL + path;
        let response = await axios.get(url);
        let data = await response.data;

        if (!isArray(data.result)){
            throw new Error("Empty data");
        }

        const latestRecords = data.result[data.result.length -1];

        if (!isObject(latestRecords)) {
            throw new Error("Wrong records");
        }

        if (Number(latestRecords.blockNumber) !== Number(currentBlockContract)) {
            currentBlockContract = Number(latestRecords.blockNumber);
            let methodHash = Web3EthAbi.encodeFunctionSignature('claim(uint64)');
            let filtered = data.result.filter(function(value, index, arr) {
                return value.input.includes(methodHash);
            })
            // import data
            console.log(" [x] Starting import data to elasticsearch");
            elasticService.create_bulk('transaction_smart_contract_tracker', data.result);
            elasticService.create_bulk('transaction_smart_contract_claim_tracker', filtered);
        }
        console.log(` [x] Done process tracker - ${count_process_2} times`);
        count_process_2 ++;
        // console.timeEnd("answer time");
        await getSmartContractData();
    } catch (e) {
        console.log(e.message);
        await getSmartContractData();
    }

}




module.exports = {
    getSmartContractData,
    getData
}

