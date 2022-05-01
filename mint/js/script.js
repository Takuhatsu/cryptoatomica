"use strict";
const Web3Modal = window.Web3Modal.default;
let web3Modal;
let provider;
let selectedAccount;
let isConnected = false;

let contractAddress = "0x29ee0d92c5d9b3982173ccea98520c59a1e58046";
let abi = [{
        "inputs": [{
            "internalType": "address",
            "name": "owner",
            "type": "address"
        }],
        "name": "balanceOf",
        "outputs": [{
            "internalType": "uint256",
            "name": "",
            "type": "uint256"
        }],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "ishidaFreeMintLive",
        "outputs": [{
            "internalType": "bool",
            "name": "",
            "type": "bool"
        }],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [{
            "internalType": "uint256",
            "name": "tokenId",
            "type": "uint256"
        }],
        "name": "ishidaHolderMint",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [{
            "internalType": "uint256",
            "name": "tokenQuantity",
            "type": "uint256"
        }],
        "name": "mint",
        "outputs": [],
        "stateMutability": "payable",
        "type": "function"
    },
    {
        "inputs": [{
            "internalType": "uint256",
            "name": "tokenId",
            "type": "uint256"
        }],
        "name": "ownerOf",
        "outputs": [{
            "internalType": "address",
            "name": "",
            "type": "address"
        }],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "privateLive",
        "outputs": [{
            "internalType": "bool",
            "name": "",
            "type": "bool"
        }],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [{
                "internalType": "uint256",
                "name": "tokenQuantity",
                "type": "uint256"
            },
            {
                "internalType": "bytes",
                "name": "signature",
                "type": "bytes"
            }
        ],
        "name": "privateMint",
        "outputs": [],
        "stateMutability": "payable",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "publicLive",
        "outputs": [{
            "internalType": "bool",
            "name": "",
            "type": "bool"
        }],
        "stateMutability": "view",
        "type": "function"
    }
]


function init() {
    const providerOptions = {};
    web3Modal = new Web3Modal({
        cacheProvider: false,
        providerOptions,
        disableInjectedProvider: false,
    });

}
async function fetchAccountData() {
    const web3 = new Web3(provider);
    const accounts = await web3.eth.getAccounts();
    selectedAccount = accounts[0];
}

async function onConnect() {
    try {
        provider = await web3Modal.connect();
    } catch (e) {
        console.log("Could not get a wallet connection", e);
        return;
    }

    provider.on("accountsChanged", (accounts) => {
        fetchAccountData();
    });

    fetchAccountData();
}



async function connect() {
    if (window.web3 == undefined && window.ethereum == undefined) {
        window
            .open("https://metamask.app.link/dapp/cryptoatomica.com", "_blank")
            .focus();
    }
    provider = await web3Modal.connect();
    provider.on("accountsChanged", (accounts) => {
        fetchAccountData();
    });

    await fetchAccountData();
    if (isConnected) {
        return
    }
    if (selectedAccount) {
        const web3 = new Web3(provider);
        const contract = new web3.eth.Contract(abi, contractAddress);

        axios.post("https://sig.cryptoatomica.com/isEligible/", {
            wallet: selectedAccount
        }).then(data => {
            if (data.data.eligible) {
                contract.methods.privateLive().call().then(state => {
                    if (state) {
                        document.getElementById("prButton").classList.remove("d-none");
                    }
                })
            }
        }).catch(data => {

        })

        contract.methods.ishidaFreeMintLive().call().then(async state => {

            if (state) {
                const ishidaContract = new web3.eth.Contract(abi, "0x79731d6f294e47129b7c6eb0ae5abfa02d5c9193");
                let balanceOfUser = await ishidaContract.methods.balanceOf(selectedAccount).call();
                if (balanceOfUser > 0) {
                    document.getElementById("iButton").classList.remove("d-none");
                }
            }
        }).catch(e => {})

        contract.methods.publicLive().call().then(state => {
            if (state) {
                document.getElementById("puButton").classList.remove("d-none");
            }
        }).catch(e => {

        })
        document.getElementById("connect-button").innerHTML = "Connected";
        document.getElementById("connect-button").classList.add("btn-outline-dark");
        document.getElementById("connect-button").classList.remove("btn-outline-success");
        isConnected = true;

    } else {
        document.getElementById("connect-button").innerHTML = "Connect";
        document.getElementById("connect-button").classList.add("btn-outline-sucess");
        document.getElementById("connect-button").classList.remove("btn-outline-dark");
        isConnected = false;
    }


}



async function freeMint() {
    if (!isConnected) {
        iziToast.error({
            title: "Error",
            message: "Not connected",
        });
        return
    }
    const web3 = new Web3(provider);
    const contract = new web3.eth.Contract(abi, contractAddress);
    if (selectedAccount) {
        let iTokenId = parseInt(document.getElementById("ishidaMintTokenId").value);
        if (iTokenId > 0 && iTokenId <= 1001)
            contract.methods
            .ishidaHolderMint(iTokenId)
            .send({
                from: selectedAccount
            }).then(function (info) {
                iziToast.success({
                    title: 'OK',
                    message: 'Successfully minted!',
                });
            }).catch(function (err) {

            });
    }
}
async function publicMint() {
    if (!isConnected) {
        iziToast.error({
            title: "Error",
            message: "No connected",
        });
        return
    }
    const web3 = new Web3(provider);
    const contract = new web3.eth.Contract(abi, contractAddress);
    if (selectedAccount) {
        if (document.getElementById("publicMintQuantity").value > 0) {
            contract.methods
                .mint(document.getElementById("publicMintQuantity").value)
                .send({
                    value: web3.utils.toWei(`${document.getElementById("publicMintQuantity").value * 0.08}`, "ether"),
                    from: selectedAccount
                }).then(function (info) {
                    iziToast.success({
                        title: 'OK',
                        message: 'Successfully bought!',
                    });
                }).catch(function (err) {

                });
        }
    }
}
async function privateMint(quantity) {
    if (!isConnected) {
        iziToast.error({
            title: "Error",
            message: "No connected",
        });
        return
    }
    const web3 = new Web3(provider);
    const contract = new web3.eth.Contract(abi, contractAddress);
    if (selectedAccount) {

        axios.post("https://sig.cryptoatomica.com/getMintAccess/", {
            wallet: selectedAccount,
        }).then(data => {
            if (data.data.signature) {
                contract.methods
                    .privateMint(quantity, data.data.signature)
                    .send({
                        value: web3.utils.toWei(`${quantity * 0.08}`, "ether"),
                        from: selectedAccount
                    }).then(function (info) {
                        iziToast.success({
                            title: 'OK',
                            message: 'Successfully bought!',
                        });
                    }).catch(function (err) {

                    });
            } else {
                iziToast.error({
                    title: 'Error',
                    message: 'Not whitelisted',
                });
            }

        });
    }
}


window.addEventListener("load", async () => {
    init();
})