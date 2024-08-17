import { useState, useEffect } from 'react'
import { StakeWiseSDK, Network } from '@stakewise/v3-sdk'
import { ethers } from "ethers";

// Ethers providers
const ethProvider = 
new ethers.JsonRpcProvider("https://eth-mainnet.g.alchemy.com/v2/JTXUw4DQJ0PEVskCBSsadhBnk3rkd4vN")
const realProvider = new ethers.JsonRpcProvider("https://tangible-real.gateway.tenderly.co/29G4PChJRVFiAJiyQg1FnC")

const sdk = new StakeWiseSDK({ 
  network: Network.Mainnet, 
  provider: ethProvider
})

// Contract addresses and ABIs
const genesisAddress = "0xac0f906e433d58fa868f936e8a43230473652885"
const chorusOneAddress = "0xe6d8d8aC54461b1C5eD15740EEe322043F696C08"
const stakewiseABI = 
[
  // Some details about the contract
  "function vaultId() view returns (bytes32)",
  "function version() view returns (uint8)",
  // Functions to get vault balance for a wallet
  "function getShares(address) view returns (uint256)",
  "function convertToAssets(uint256) view returns (uint256)",
  // Function to get minted osETH shares for a user
  "function osTokenPositions(address) view returns (uint256)" 
]

// osETH Contract
const osETHAddress = "0xf1C9acDc66974dFB6dEcB12aA385b9cD01190E38"
const osETHABI = 
[
  // Some details about the contract
  "function name() view returns (string)",
  "function decimals() view returns (uint8)",
  // Function to get balance of address
  "function balanceOf(address) view returns (uint256)"
]

// EigenLayer OETH pool
const eigenlayerPoolAddress = "0xa4C637e0F704745D182e4D38cAb7E7485321d059"
const eigenlayerABI = 
[
  // Functions to get pool balance for a wallet
  "function shares(address) view returns (uint256)",
  "function sharesToUnderlyingView(uint256) view returns (uint256)"  
]

// reALT Contract
const reALTAddress = "0xF96798F49936EfB1a56F99Ceae924b6B8359afFb"
const reALTABI = 
[
  // Some details about the contract
  "function name() view returns (string)",
  "function decimals() view returns (uint8)",
  // Function to get balance of address
  "function balanceOf(address) view returns (uint256)",
  // Function to get balance of ALT tokens
  "function convertToAssets(uint256) view returns (uint256)"
]

// re.al ETH rewards contract
const realEthAddress = "0xf4e03D77700D42e13Cd98314C518f988Fd6e287a"
const realEthABI =
[
  "function claimable(address) view returns (uint256, uint256[], uint256[], uint256, uint256)"
]

// re.al RWA rewards contract
const realRWAAddress = "0x9D146A1C099adEE2444aFD629c04B4cbb5eE1539"
const realRWAABI =
[
  "function claimable(address) view returns (uint256)"
]

// Ethers contract objects
const genesisContract = new ethers.Contract(genesisAddress, stakewiseABI, ethProvider)
const chorusOneContract = new ethers.Contract(chorusOneAddress, stakewiseABI, ethProvider)
const osethContract = new ethers.Contract(osETHAddress, osETHABI, ethProvider)
const eigenlayerPoolContract = new ethers.Contract(eigenlayerPoolAddress, 
                                                    eigenlayerABI, ethProvider)
const reALTContract = new ethers.Contract(reALTAddress, reALTABI, ethProvider)
const realEthContract = new ethers.Contract(realEthAddress, realEthABI, realProvider)
const realRWAContract = new ethers.Contract(realRWAAddress, realRWAABI, realProvider)

function getCookie(caddr) {
  let address = caddr + "=";
  let decodedCookie = decodeURIComponent(document.cookie);
  let ca = decodedCookie.split(';');
  for(let i = 0; i <ca.length; i++) {
      let c = ca[i];
      while (c.charAt(0) == ' ') {
          c = c.substring(1);
      }
      if (c.indexOf(address) == 0) {
          return c.substring(name.length, c.length);
      }
  }
  return "";
}

export default function App() {

  const [userAddress, setUserAddress] = useState("")
  const [ethGenesisBal, setEthGenesisBal] = useState(0)
  const [osethGenesisBal, setOsethGenesisBal] = useState(0)
  const [ethChorusOneBal, setEthChorusOneBal] = useState(0)
  const [osethChorusOneBal, setOsethChorusOneBal] = useState(0)
  const [osethWalletBal, setOsethWalletBal] = useState(0)
  const [eigenlayerOethBal, setEigenLayerOethBal] = useState(0)
  const [altlayerBal, setAltlayerBal] = useState(0)
  const [realDaiBal, setRealDaiBal] = useState(0)
  const [realUstbBal, setRealUstbBal] = useState(0)
  const [arcanaUsdBal, setArcanaUsdBal] = useState(0)
  const [realUkreBal, setRealUkreBal] = useState(0)
  const [reethRewardsBal, setReethRewardsBal] = useState(0)
  const [rwaRewardsBal, setRwaRewardsBal] = useState(0)

  useEffect(() => {
    // Default wallet address
    const cookie = getCookie("defaultAddress")
    if (cookie != "") {
      const defaultAddress = cookie.split('=')
      setUserAddress(defaultAddress[1])
    }
  }, [])

  async function getOsethPosition(userAddr, vaultAddr) {
    let output

    output = await sdk.osToken.getBaseData()
    const thresholdPercent = output.thresholdPercent

    output = await sdk.vault.getStakeBalance({
        userAddress: userAddr,
        vaultAddress: vaultAddr
    })
    const stakeBalance = output.assets

    output = await sdk.osToken.getPosition({
        userAddress: userAddr,
        vaultAddress: vaultAddr,
        stakedAssets: stakeBalance,
        thresholdPercent: thresholdPercent
    })
    return output
  }


  async function updateBalances() {
    let shares
    let assets
    let balanceWei = 0
    let output
    let daiWei = 0
    let ustbWei = 0
    let arcusdWei = 0
    let ukreWei = 0
     
    try {
        output = await sdk.vault.getStakeBalance({
            userAddress: userAddress,
            vaultAddress: genesisAddress
        })
        setEthGenesisBal(ethers.formatEther(output.assets))
    } catch (error) {
        console.log(error)
    }

    shares = await genesisContract.osTokenPositions(userAddress)
    setOsethGenesisBal(ethers.formatEther(shares))

    try {
        output = await sdk.vault.getStakeBalance({
            userAddress: userAddress,
            vaultAddress: chorusOneAddress
        })
        setEthChorusOneBal(ethers.formatEther(output.assets))
    } catch (error) {
        console.log(error)
    }

    shares = await chorusOneContract.osTokenPositions(userAddress)
    setOsethChorusOneBal(ethers.formatEther(shares))

    balanceWei = await osethContract.balanceOf(userAddress)
    setOsethWalletBal(ethers.formatEther(balanceWei))

    shares = await eigenlayerPoolContract.shares(userAddress)
    assets = await eigenlayerPoolContract.sharesToUnderlyingView(shares)
    setEigenLayerOethBal(ethers.formatEther(assets))

    shares = await reALTContract.balanceOf(userAddress)
    console.log(`shares = ${shares}`)
    assets = await reALTContract.convertToAssets(shares)
    console.log(`assets = ${assets}`)
    setAltlayerBal(ethers.formatEther(assets))
    console.log(`altlayerBal = ${altlayerBal}`)

    try {
        const res = await fetch(`https://explorer.re.al/api/v2/addresses/${userAddress}/token-balances`)
        if (!res.ok) {
            throw new Error(`${res.status} ${res.statusText}`)
        }
        const results = await res.json()

        // console.log(results)

        results.forEach(item => {
            if (item.token.symbol === "DAI") {
                daiWei = item.value
            } else if (item.token.symbol === "USTB") {
                ustbWei = item.value
            } else if (item.token.symbol === "arcUSD") {
                arcusdWei = item.value
            } else if (item.token.symbol === "UKRE") {
                ukreWei = item.value
            }
        })
        setRealDaiBal(ethers.formatEther(daiWei))
        setRealUstbBal(ethers.formatEther(ustbWei))
        setArcanaUsdBal(ethers.formatEther(arcusdWei))
        setRealUkreBal(ethers.formatEther(ukreWei))
    } catch (error) {
        console.log(error)
    }

    let balWei
    const result = await realEthContract.claimable(userAddress)
    balWei = result[0]
    setReethRewardsBal(ethers.formatEther(balWei))
    balWei = await realRWAContract.claimable(userAddress)
    setRwaRewardsBal(ethers.formatEther(balWei))
  }

  function addressChange(e) {
    setUserAddress(e.target.value)
  }

  function saveAddress() {
    if (userAddress != "") {
      document.cookie = "defaultAddress=" + userAddress
    } else {
        console.log("No address entered")
    }
  }

  return (
    <>
      <h1>Token Balances</h1>
      <label htmlFor="user-address">Retrieve current balances for this address:</label>
        <input 
            type="text" 
            className="user-address" 
            id="user-address" 
            value={userAddress} 
            onChange={addressChange} 
        />
        <div className="button-div">
            <button className="buttons update-btn" onClick={updateBalances}>
                Update Balances
            </button>
            <button className="buttons" onClick={saveAddress}>Save Default Address</button>
        </div>
        <label>Current balances:-</label>
        <div className="balances">
            <div className="balance">
                <div className="bal-label">Stakewise Genesis ETH:</div>
                <div className="bal-value">{ethGenesisBal}</div>
            </div>
            <div className="balance">
                <div className="bal-label">Stakewise Genesis osETH:</div>
                <div className="bal-value">{osethGenesisBal}</div>
            </div>
              <div className="balance">
                <div className="bal-label">Stakewise Chorus One ETH:</div>
                <div className="bal-value">{ethChorusOneBal}</div>
            </div>
            <div className="balance">
                <div className="bal-label">Chorus One osETH:</div>
                <div className="bal-value">{osethChorusOneBal}</div>
            </div>
            <div className="balance">
                <div className="bal-label">osETH in Wallet:</div>
                <div className="bal-value">{osethWalletBal}</div>
            </div>
            <div className="balance">
                <div className="bal-label">EigenLayer OETH:</div>
                <div className="bal-value">{eigenlayerOethBal}</div>
            </div>
            <div className="balance">
                <div className="bal-label">Altlayer ALT:</div>
                <div className="bal-value">{altlayerBal}</div>
            </div>
            <div className="balance">
                <div className="bal-label">re.al DAI:</div>
                <div className="bal-value">{realDaiBal}</div>
            </div>
            <div className="balance">
                <div className="bal-label">re.al USTB:</div>
                <div className="bal-value">{realUstbBal}</div>
            </div>
            <div className="balance">
                <div className="bal-label">Arcana arcUSD:</div>
                <div className="bal-value">{arcanaUsdBal}</div>
            </div>
            <div className="balance">
                <div className="bal-label">re.al UKRE:</div>
                <div className="bal-value">{realUkreBal}</div>
            </div>
        </div>
        <label>re.al reward balances:-</label>
        <div className="balances">
            <div className="balance">
                <div className="bal-label">reETH Rewards:</div>
                <div className="bal-value">{reethRewardsBal}</div>
            </div>
            <div className="balance">
                <div className="bal-label">RWA Rewards:</div>
                <div className="bal-value">{rwaRewardsBal}</div>
            </div>
        </div>
    </>
  )
}

