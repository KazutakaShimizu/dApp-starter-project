import React, { useEffect, useState } from 'react'
import './App.css'
import { ethers } from 'ethers'
import abi from './utils/WavePortal.json'
const { ethereum } = window as any

const App = () => {
  const [currentAccount, setCurrentAccount] = useState('')
  const [allWaves, setAllWaves] = useState<any[]>([])
  const [messageValue, setMessageValue] = useState('')

  const provider = new ethers.providers.Web3Provider(ethereum)
  const signer = provider.getSigner()
  const contractAddress = '0x4c10b9F17a930f06501910bcf9E16FEabc4DCD5D'
  const contractABI = abi.abi
  const wavePortalContract = new ethers.Contract(
    contractAddress,
    contractABI,
    signer
  )

  const checkIfWalletIsConnected = async () => {
    try {
      if (!ethereum) {
        console.log('Make sure you have MetaMask!')
        return
      } else {
        console.log('We have the ethereum object', ethereum)
      }
      const accounts: any[] = await ethereum.request({ method: 'eth_accounts' })
      if (accounts.length !== 0) {
        const account = accounts[0]
        console.log('Found an authorized account:', account)
        setCurrentAccount(account)
        getAllWaves()
      } else {
        console.log('No authorized account found')
      }
    } catch (e) {
      console.log(e)
    }
  }

  const connectWallet = async () => {
    try {
      if (!ethereum) {
        alert('Get MetaMask!')
        return
      }
      const accounts = await ethereum.request({
        method: 'eth_requestAccounts',
      })

      console.log('Connected: ', accounts[0])
      setCurrentAccount(accounts[0])
    } catch (error) {
      console.log(error)
    }
  }

  const wave = async () => {
    try {
      if (ethereum) {
        let count = await wavePortalContract.getTotalWaves()
        console.log('Retrieved total wave count...', count.toNumber())
        console.log('Signer:', signer)

        let contractBalance = await provider.getBalance(
          wavePortalContract.address
        )
        console.log(contractBalance)

        const waveTxn = await wavePortalContract.wave(messageValue, {
          gasLimit: 300000,
        })
        console.log('Mining...', waveTxn.hash)
        await waveTxn.wait()
        console.log('Mined -- ', waveTxn.hash)
        count = await wavePortalContract.getTotalWaves()
        console.log('Retrieved total wave count...', count.toNumber())

        let contractBalance_post = await provider.getBalance(
          wavePortalContract.address
        )
        if (contractBalance_post < contractBalance) {
          console.log('won')
        } else {
          console.log('lose')
        }
        console.log(
          'Contract balance after wave:',
          ethers.utils.formatEther(contractBalance_post)
        )
      } else {
      }
    } catch (error) {
      console.log(error)
    }
  }

  const getAllWaves = async () => {
    try {
      if (ethereum) {
        const waves = await wavePortalContract.getAllWaves()
        const wavesCleand = waves.map((wave: any) => {
          return {
            address: wave.waver,
            timestamp: new Date(wave.timestamp * 1000),
            message: wave.message,
          }
        })
        setAllWaves(wavesCleand)
      } else {
        console.log("Ethereum object doesn't exist!")
      }
    } catch (error) {
      console.log(error)
    }
  }

  useEffect(() => {
    checkIfWalletIsConnected()
  }, [])

  useEffect(() => {
    let wavePortalContract: ethers.Contract

    const onNewWave = (from: any, timestamp: any, message: any) => {
      console.log('NewWave', from, timestamp, message)
      setAllWaves([
        ...allWaves,
        {
          address: from,
          timestamp: new Date(timestamp * 1000),
          message: message,
        },
      ])
    }

    if (ethereum) {
      wavePortalContract = new ethers.Contract(
        contractAddress,
        contractABI,
        signer
      )
      wavePortalContract.on('NewWave', onNewWave)
    }
    return () => {
      if (wavePortalContract) {
        wavePortalContract.off('NewWave', onNewWave)
      }
    }
  }, [])

  return (
    <div className="mainContainer">
      <div className="dataContainer">
        <div className="header">
          <span role="img" aria-label="hand-wave">
            👋
          </span>{' '}
          WELCOME!
        </div>
        <div className="bio">
          イーサリアムウォレットを接続して、「
          <span role="img" aria-label="hand-wave">
            👋
          </span>
          (wave)」を送ってください
          <span role="img" aria-label="shine">
            ✨
          </span>
        </div>
        {!currentAccount && (
          <button className="waveButton" onClick={connectWallet}>
            Connect Wallet
          </button>
        )}
        {currentAccount && (
          <button className="waveButton" onClick={connectWallet}>
            Wallet Connected
          </button>
        )}
        <button className="waveButton" onClick={wave}>
          Wave at Me
        </button>
        {currentAccount && (
          <textarea
            name="messageArea"
            placeholder="メッセージはこちら"
            id="message"
            value={messageValue}
            onChange={e => setMessageValue(e.target.value)}
          />
        )}
        {currentAccount &&
          allWaves
            .slice(0)
            .reverse()
            .map((wave, index) => {
              return (
                <div
                  key={index}
                  style={{
                    backgroundColor: '#F8F8FF',
                    marginTop: '16px',
                    padding: '8px',
                  }}
                >
                  <div>Address: {wave.address}</div>
                  <div>Time: {wave.timestamp.toString()}</div>
                  <div>Message: {wave.message}</div>
                </div>
              )
            })}
      </div>
    </div>
  )
}

export default App
