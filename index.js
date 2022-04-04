let {getData, getSmartContractData} = require('./controllers/tracker.controller');

(async function () {
    for await (let val of process.argv) {
        console.log(val)
        switch (val) {
            case "transaction":
                await getData();
                break;
            case "smart_contract":
                await getSmartContractData();
        }
    }
})()