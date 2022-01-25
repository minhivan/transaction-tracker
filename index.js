let getData = require('./controllers/tracker.controller');



(async function () {
    await getData();
})()


// (async function () {
//     for await (let val of process.argv) {
//         switch (val) {
//             case "sync_coin_detail": // Loop coin list
//                 await getData();
//                 //await new Promise(resolve => setTimeout(resolve, 1000 * 60 * 15)) // wait for another function setup
//                 break;
//         }
//     }
// })()