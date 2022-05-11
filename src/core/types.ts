import { Cluster, Keypair, Connection } from '@solana/web3.js';

export type endpoint = 'localhost' | Cluster;

export type lendingEnvironment = 'production' | 'devnet';

export type lendingProps = [
    Connection,
    lendingEnvironment,
    Keypair,
    Keypair,
    ...string[]
];

export type transferProps = [
    Connection,
    Keypair,
    ...(Keypair | string | undefined | null)[]
];
