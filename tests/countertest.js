const anchor = require('@project-serum/anchor');
const { publicKey } = require('@project-serum/anchor/dist/cjs/utils');
const { assert } = require('chai');
const {
  TOKEN_PROGRAM_ID,
  getTokenAccount,
  createMint,
  createTokenAccount,
  mintToAccount,
} = require('./utils')

describe('counterr', () => {

  // Configure the client to use the local cluster.
  const provider = anchor.Provider.local();
  anchor.setProvider(provider);
  const program = anchor.workspace.Countertest;

  it("test pda", async () => {
    const seed = Buffer.from([1, 2, 3, 4]);
    const domain = provider.wallet.publicKey.toString().substring(0, 10);
    const foo = anchor.web3.SYSVAR_RENT_PUBKEY;
    const [myPda, nonce] = await publicKey.findProgramAddressSync(
      [
        Buffer.from(anchor.utils.bytes.utf8.encode("my-seed")),
        Buffer.from(anchor.utils.bytes.utf8.encode(domain)),
        foo.toBuffer(),
        seed,
      ],
      program.programId
    );
    await program.rpc.testPdaInit(domain, seed, nonce, {
      accounts: {
        myPda,
        myPayer: program.provider.wallet.publicKey,
        foo,
        rent: anchor.web3.SYSVAR_RENT_PUBKEY,
        systemProgram: anchor.web3.SystemProgram.programId,
      },  
    })

    console.log(myPda)

    await program.rpc.testPdaInc(new anchor.BN(111), {
      accounts: {
        myPda,
      }
    });

    await program.rpc.testPdaInc(new anchor.BN(1112), {
      accounts: {
        myPda,
      }
    });

    await program.rpc.testPdaInc(new anchor.BN(1131), {
      accounts: {
        myPda,
      }
    });

    const count = await program.account.counterData.fetch(myPda);
    console.log(count.counter);
    assert.ok(count.counter.toNumber() === 3);
  });
});
