import { join } from 'path';
import * as web3 from '@solana/web3.js';
import { endpoint } from './core/types';

export const toCluster = (cluster: endpoint): string => {
    if (cluster == 'localhost') {
        return 'http://127.0.0.1:8899';
    } else if (['mainnet-beta', 'testnet', 'devnet'].includes(cluster)) {
        return web3.clusterApiUrl(cluster as web3.Cluster);
    }
    throw new Error('Invalid cluster provided.');
};

export const toResolveHomePath = (filepath: string) => {
    if (process.env.HOME && filepath[0] === '~') {
        return join(process.env.HOME, filepath.slice(1));
    }
    return filepath;
};

export function nowMS() {
    return new Date().getTime();
}

export function now() {
    return Math.floor(nowMS() / 1000);
}

export async function sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
}
