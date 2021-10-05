use anchor_lang::{prelude::*, solana_program::system_program};
use anchor_spl::token::{self, SetAuthority, Token, TokenAccount, Transfer, MintTo, mint_to, Mint};


declare_id!("Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS");

#[program]
pub mod countertest {
    use super::*;

    pub fn test_pda_init(
        ctx: Context<TestPdaInit>,
        _domain: String,
        _seed: Vec<u8>,
        _bump: u8,
    ) -> ProgramResult {
        ctx.accounts.my_pda.counter = 0;
        Ok(())
    }

    pub fn test_pda_inc(ctx: Context<TestPdaInc>, _a: i64) -> ProgramResult {
        ctx.accounts.my_pda.counter += 1;
        Ok(())
    }
}

#[derive(Accounts)]
#[instruction(domain: String, seed: Vec<u8>, bump: u8)]
pub struct TestPdaInit<'info> {
    #[account(
        init,
        seeds = [b"my-seed", domain.as_bytes(), foo.key.as_ref(), &seed],
        bump = bump,
        payer = my_payer,
    )]
    pub my_pda: Account<'info, CounterData>,
    pub my_payer: AccountInfo<'info>,
    pub foo: AccountInfo<'info>,
    pub system_program: AccountInfo<'info>,
}

#[derive(Accounts)]
pub struct TestPdaInc<'info> {
    #[account(mut)]
    pub my_pda: Account<'info, CounterData>
}

#[account]
#[derive(Default)]
pub struct CounterData {
    pub counter: i64,
    pub deposit_last: i64,
}