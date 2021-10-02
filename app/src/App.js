import './App.css';
import { useState } from 'react';
import { Connection, PublicKey } from '@solana/web3.js';
import {
  Program, Provider, web3, utils, BN
} from '@project-serum/anchor';
import idl from './idl.json';

import { getPhantomWallet } from '@solana/wallet-adapter-wallets';
import { useWallet, WalletProvider, ConnectionProvider } from '@solana/wallet-adapter-react';
import { WalletModalProvider, WalletMultiButton } from '@solana/wallet-adapter-react-ui';

const wallets = [
  /* view list of available wallets at https://github.com/solana-labs/wallet-adapter#wallets */
  getPhantomWallet()
]

const { SystemProgram, Keypair } = web3;
/* create an account  */
const baseAccount = Keypair.generate();
const opts = {
  preflightCommitment: "processed"
}
const programID = new PublicKey(idl.metadata.address);

function App() {
  const [value, setValue] = useState(null);
  const wallet = useWallet();
  let myPda;
  let nonce;

  async function getProvider() {
    /* create the provider and return it to the caller */
    /* network set to local network for now */
    const network = "http://127.0.0.1:8899";
    const connection = new Connection(network, opts.preflightCommitment);

    const provider = new Provider(
      connection, wallet, opts.preflightCommitment,
    );
    return provider;
  }

  async function createCounter() {    
    const provider = await getProvider()
    /* create the program interface combining the idl, program ID, and provider */
    const program = new Program(idl, programID, provider);
    try {
      const seed = Buffer.from([1, 2, 3, 4]);
      const domain = wallet.publicKey.toString().substring(0, 10);
      const foo = web3.SYSVAR_RENT_PUBKEY;
      [myPda, nonce] = await web3.PublicKey.findProgramAddress(
        [
          Buffer.from(utils.bytes.utf8.encode("my-seed")),
          Buffer.from(utils.bytes.utf8.encode(domain)),
          foo.toBuffer(),
          seed,
        ],
        program.programId
      );
      console.log(myPda);
      
      await program.rpc.testPdaInit(domain, seed, nonce, {
        accounts: {
          myPda: myPda,
          myPayer: wallet.publicKey,
          foo: foo,
          rent: web3.SYSVAR_RENT_PUBKEY,
          systemProgram: web3.SystemProgram.programId,
        },  
      });

      const count = await program.account.counterData.fetch(myPda);
      console.log('account: ', count);
      setValue(count.counter.toString());
    } catch (err) {
      console.log("Transaction error: ", err);
      const count = await program.account.counterData.fetch(myPda);
      console.log('account: ', count.counter.toString());
      setValue(count.counter.toString());
    }
  }

  async function increment() {
    const provider = await getProvider();
    const program = new Program(idl, programID, provider);

    const seed = Buffer.from([1, 2, 3, 4]);
    const domain = wallet.publicKey.toString().substring(0, 10);
    const foo = web3.SYSVAR_RENT_PUBKEY;
    [myPda, nonce] = await web3.PublicKey.findProgramAddress(
      [
        Buffer.from(utils.bytes.utf8.encode("my-seed")),
        Buffer.from(utils.bytes.utf8.encode(domain)),
        foo.toBuffer(),
        seed,
      ],
      program.programId
    );
    console.log(myPda);
    await program.rpc.testPdaInc(new BN(111), {
      accounts: {
        myPda: myPda,
      }
    });

    const count = await program.account.counterData.fetch(myPda);
    console.log('account: ', count);
    setValue(count.counter.toString());
  }

  if (!wallet.connected) {
    /* If the user's wallet is not connected, display connect wallet button. */
    return (
      <div style={{ display: 'flex', justifyContent: 'center', marginTop:'100px' }}>
        <WalletMultiButton />
      </div>
    )
  } else {
    return (
      <div className="App">
        <div>
          {
            !value && (<button onClick={createCounter}>Create counter</button>)
          }
          {
            value && <button onClick={increment}>Increment counter</button>
          }

          {
            value && value >= Number(0) ? (
              <h2>{value}</h2>
            ) : (
              <h3>Please create the counter.</h3>
            )
          }
        </div>
      </div>
    );
  }
}

/* wallet configuration as specified here: https://github.com/solana-labs/wallet-adapter#setup */
const AppWithProvider = () => (
  <ConnectionProvider endpoint="http://127.0.0.1:8899">
    <WalletProvider wallets={wallets} autoConnect>
      <WalletModalProvider>
        <App />
      </WalletModalProvider>
    </WalletProvider>
  </ConnectionProvider>
)

export default AppWithProvider;