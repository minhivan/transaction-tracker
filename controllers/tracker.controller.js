let axios = require('axios');
let elasticService = require('../services/elastic.service')
require('dotenv').config()

let countTransaction = 0;
let pathPrefix = `/api?module=account&action=txlist&address=${process.env.WALLET_TO}&startblock=0&sort=asc&apikey=${process.env.BSCSCAN_API_KEY}`;

// init recursive call
const getData = async() => {
    setTimeout(async () => {
        try {
            const path = process.env.BSCSCAN_URL + pathPrefix;

            let response = await  axios.get(path);
            let data = await response.data;
            if(countTransaction < data.result.length) {
                countTransaction = data.result.length;
                // import
                console.log("Import data")
                elasticService.create_bulk('transaction_tracker', data.result)
            }
        } catch (e) {
            console.log(e.message)
        }
        // Recursive call
        return getData()
    }, process.env.BLOCK_PER_SECOND * 1000)
}
module.exports = getData

