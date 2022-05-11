import {
    PublicKey,
    Transaction,
    SystemProgram,
    LAMPORTS_PER_SOL,
    sendAndConfirmTransaction,
    Keypair,
} from '@solana/web3.js';
import { transferProps } from './types';

/**
 * Transfer SOL to another account
 *
 * @param connection A solana web3 connection
 * @param ownerKeypair private keypair of owner
 * @param payerKeypair private keypair of feepayer
 * @param amount Amount of SOL balance
 * @param toOwner key of account owner
 */
export const solTransfer = async (
    ...[connection, ownerKeypair, payerKeypair, amount, toOwner]: transferProps
) => {
    const toOwnerPubkey = new PublicKey(toOwner as Keypair);

    console.log('from pubkey:', ownerKeypair.publicKey.toBase58());
    console.log('transfer amount:', amount);
    console.log('to pubkey:', toOwnerPubkey.toBase58());

    const transaction = new Transaction();

    const transferAmount = parseInt(amount as string) * LAMPORTS_PER_SOL;

    transaction.add(
        SystemProgram.transfer({
            fromPubkey: ownerKeypair.publicKey,
            toPubkey: toOwnerPubkey,
            lamports: transferAmount,
        })
    );
    transaction.feePayer = (payerKeypair as Keypair).publicKey;

    /* transfer method 1: sign + send */
    // let txhash_1 = await connection.sendTransaction(transaction, [fromKeypair]);
    // console.log('transfer:', txhash_1);

    /* transfer method 1: sign + send + confirm */
    const txhash_2 = await sendAndConfirmTransaction(connection, transaction, [
        ownerKeypair,
        payerKeypair as Keypair,
    ]);
    console.log('transfer:', txhash_2);
};

/**
 * Retrieve account balance
 *
 * @param connection A solana web3 connection
 * @param mainKeypair private keypair of your account
 * @return the Object of balance
 */
export const solBalance = async (
    ...[connection, ownerKeypair]: transferProps
) => {
    /* eslint-disable  @typescript-eslint/no-non-null-assertion */
    if (ownerKeypair! instanceof Keypair) {
        const balance = await connection.getBalance(ownerKeypair.publicKey);
        console.log('account pubkey:', ownerKeypair.publicKey.toBase58());
        console.log('account sol balance:', balance / LAMPORTS_PER_SOL);
        return balance;
    } else {
        throw new Error('The required parameters was wrong');
    }
};
