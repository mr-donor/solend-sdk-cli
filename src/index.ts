import fs from 'fs';
import { resolve } from 'path';
import { program } from 'commander';
import * as web3 from '@solana/web3.js';
import * as core from './core';
import * as utils from './utils';
import { endpoint } from './core/types';

/**
 * Main command
 */
program
    .version('0.0.1')
    .description('Interact on-chain Solend program with sdk')
    .argument('[func]', 'specific function name to run')
    .argument('[inputs...]', 'other inputs, if needed')
    .option(
        '-o, --owner <owner keypair>',
        'Keypair file path',
        '~/.config/solana/id.json'
    )
    .option(
        '-p, --payer <feepayer keypair>',
        'Keypair file path',
        '~/.config/solana/id.json'
    )
    .option(
        '-u, --url <cluster url>',
        "The moniker of URL for Solana's JSON RPC: [mainnet-beta, testnet, devnet, localhost]",
        'devnet'
    )
    .action(async (func, inputs, options) => {
        const cluster: endpoint = options.url;
        const endpoint = utils.toCluster(cluster);
        const connection = new web3.Connection(endpoint, 'confirmed');

        let ownerKeypairData: number[] | null = null;
        if (fs.existsSync(resolve(utils.toResolveHomePath(options.owner)))) {
            ownerKeypairData = JSON.parse(
                fs.readFileSync(
                    resolve(utils.toResolveHomePath(options.owner)),
                    'utf-8'
                )
            );
        }
        if (!ownerKeypairData) {
            throw new Error(
                'The default private key does not exist, please use the `-u, --url` option to change the private key path.'
            );
        }

        const ownerSecretKey = Uint8Array.from(ownerKeypairData);
        const ownerKeypair = web3.Keypair.fromSecretKey(ownerSecretKey);
        const ownerBalance = await core.solBalance(connection, ownerKeypair);
        if (ownerBalance < 2 * web3.LAMPORTS_PER_SOL && cluster === 'devnet') {
            await connection.requestAirdrop(ownerKeypair.publicKey, 1e9 * 2);
        }

        let payerKeypairData = ownerKeypairData;
        if (fs.existsSync(resolve(utils.toResolveHomePath(options.payer)))) {
            payerKeypairData = JSON.parse(
                fs.readFileSync(
                    resolve(utils.toResolveHomePath(options.payer)),
                    'utf-8'
                )
            );
        }
        const payerSecretKey = Uint8Array.from(payerKeypairData);
        const payerKeypair = web3.Keypair.fromSecretKey(payerSecretKey);
        const payerBalance = await core.solBalance(connection, payerKeypair);
        if (payerBalance < 2 * web3.LAMPORTS_PER_SOL && cluster === 'devnet') {
            await connection.requestAirdrop(payerKeypair.publicKey, 1e9 * 2);
            await utils.sleep(1000);
        }

        const version = await connection.getVersion();
        console.log('Connection to cluster established:', endpoint, version);

        const solend_env = cluster === 'mainnet-beta' ? 'production' : 'devnet';

        (core as any)[func]?.(
            connection,
            solend_env,
            ownerKeypair,
            payerKeypair,
            ...inputs
        );
    });

program.parse();
