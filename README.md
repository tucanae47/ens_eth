# Usage
Start server with 
```js 
npm run dev 
```

# Test
```js
npm test 
```


# Contract address
https://etherscan.io/address/0x6090a6e47849629b7245dfa1ca21d94cd15878ef

Created  simple timeseries graph of contract event logs. taking the bid done on ENS event, the timestamp with the blocknumber.
the graph plots the changes over the time of the actual bidding. 


![chart example](https://github.com/tucanae47/sl0ckit/blob/master/graph.png)


# Description 

* From nodejs simple server get logs from contract using nodejs api https://web3js.readthedocs.io/en/1.0/web3-eth-contract.html#getpastevents and get blocknumber https://web3js.readthedocs.io/en/1.0/web3-eth.html#getblocknumber
* Setup rest get endpoint to public events in json format
* Read json events from raw html, using [c3](https://github.com/c3js/c3)

# Eth js filter logs snippet 

```js

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

```
