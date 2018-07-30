const Web3 = require('web3');
const fs = require('fs');
const path = require('path');
const express = require('express')
const app = express()
const web3 = new Web3(new Web3.providers.HttpProvider('https://mainnet.infura.io/'));
const ABI = JSON.parse(fs.readFileSync('./abi.json', 'utf8'));
const ens_contract = '0x6090A6e47849629b7245Dfa1Ca21D94cd15878Ef';
const contract = new web3.eth.Contract(ABI, ens_contract);


/**
 * Return an array of promises represents the time, block number and bid value 
 * for events logs for topic signature 
 * BidRevealed (index_topic_1 bytes32 hash, index_topic_2 address owner, uint256 value, uint8 status)
 * emited on method unsealBid(bytes32,uint256,bytes32) [0x47872b42] 
 * of the public Registrar contract of ENS 
 *
 * @returns {Promise} array with the events logs to create simple graph of the contract, taking the bid done on ENS, the timestamp and the blocknumber
 */
function blocks() {
    const dateNow = Date.now();
    return contract.getPastEvents('BidRevealed', {
            fromBlock: '5927632',
            toBlock: 'latest'
        })
        .then((logs) => {
            var promises = logs.map((log) => {
                return web3.eth.getBlock(log.blockNumber)
                    .then((block) => {
                        return new Promise(
                            (resolve, reject) => {
                                let wei = web3.utils.fromWei(log.returnValues['2'], 'milliether');
                                let t = block.timestamp * 1000;
                                let n = log.blockNumber;
                                resolve({
                                    x: {
                                        time: t,
                                        n: String(n)
                                    },
                                    bid: Number(wei)
                                });
                            });
                    });
            });
            return Promise.all(promises);
        });
}

/**
 * Aync to wait for promise events from web3 contract.
 * @returns {Object} return array of objects of the following structure `{x: {time: t, n: String}, bid: Number}`
 */
async function getEns() {
    let data = await blocks();
    return data;
}

/**
 * Render HTML static content 
 * @returns {Response} static file html content 
 */
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'data_url.html'));
});

/**
 * GET:/ens  endpoint to obtain json representation of ENS logs 
 * @returns {Response} json format of the event log feed
 */
app.get('/ens', (req, res) => {
    getEns().then((data) => {
        return res.json(data);
    });
});

/**
 * Server up !
 */
module.exports = app;
app.start = () => {
    // start the web server
    return app.listen(3000, () => {
        console.log('Web server listening');

    });
};
app.start();
