import {
    Connection,
    Transaction,
    TransactionSignature,
    PublicKey,
} from '@solana/web3.js';
import { SolendMarket, SolendAction } from '@solendprotocol/solend-sdk';
import { lendingProps } from './types';

/**
 * get Market instanct.
 *
 * @param connection A solana web3 connection
 * @param env Solend program environment
 * @param ownerKeypair private keypair of owner
 * @param payerKeypair private keypair of feepayer
 * @return Solend market
 */
export const getMarket = async (...[connection, env]: lendingProps) => {
    const market = await SolendMarket.initialize(
        connection,
        env,
        '7y2cniJyAJtc3ybVrT6Yi9KSZTckYKzHuy6qDFtaBnmd'
    );

    await market.loadAll();

    return market;
};

/**
 * get obligation instanct.
 *
 * @param connection A solana web3 connection
 * @param env Solend program environment
 * @param ownerKeypair private keypair of owner
 * @param payerKeypair private keypair of feepayer
 * @return user obligation info
 */
export const getObligation = async (
    ...[connection, env, ownerKeypair, payerKeypair]: lendingProps
) => {
    const market = await getMarket(connection, env, ownerKeypair, payerKeypair);

    const obligation = await market.fetchObligationByWallet(
        ownerKeypair.publicKey
    );

    console.log(obligation);

    return obligation;
};

/**
 * get reserve instanct.
 *
 * @param connection A solana web3 connection
 * @param env Solend program environment
 * @param ownerKeypair private keypair of owner
 * @param payerKeypair private keypair of feepayer
 * @param symbol symbol to find reserve
 * @return get market reserve
 */
export const getReserve = async (
    ...[connection, env, ownerKeypair, payerKeypair, symbol]: lendingProps
) => {
    const market = await getMarket(connection, env, ownerKeypair, payerKeypair);

    const reserve = market.reserves.find((r) => r.config.symbol === symbol);

    const parseReserve = {
        config: reserve?.config,
        stats: {
            optimalUtilizationRate: reserve?.stats?.optimalBorrowRate,
            loanToValueRatio: reserve?.stats?.loanToValueRatio,
            liquidationBonus: reserve?.stats?.liquidationBonus,
            liquidationThreshold: reserve?.stats?.liquidationThreshold,
            minBorrowRate: reserve?.stats?.minBorrowRate,
            optimalBorrowRate: reserve?.stats?.optimalBorrowRate,
            maxBorrowRate: reserve?.stats?.maxBorrowRate,
            borrowFeePercentage: reserve?.stats?.borrowFeePercentage,
            hostFeePercentage: reserve?.stats?.hostFeePercentage,
            depositLimit: reserve?.stats?.depositLimit.toString(),
            reserveBorrowLimit: reserve?.stats?.reserveBorrowLimit.toString(),
            name: reserve?.stats?.name,
            symbol: reserve?.stats?.symbol,
            decimals: reserve?.stats?.decimals,
            mintAddress: reserve?.stats?.mintAddress,
            totalDepositsWads: reserve?.stats?.totalDepositsWads.toString(),
            totalBorrowsWads: reserve?.stats?.totalBorrowsWads.toString(),
            totalLiquidityWads: reserve?.stats?.totalLiquidityWads.toString(),
            supplyInterestAPY: reserve?.stats?.supplyInterestAPY,
            borrowInterestAPY: reserve?.stats?.borrowInterestAPY,
            assetPriceUSD: reserve?.stats?.assetPriceUSD,
            userDepositLimit: reserve?.stats?.userDepositLimit,
            cumulativeBorrowRateWads:
                reserve?.stats?.cumulativeBorrowRateWads.toString(),
            cTokenExchangeRate: reserve?.stats?.cTokenExchangeRate,
        },
    };

    console.log(parseReserve);

    return reserve;
};

/**
 * run Solend deposit action.
 *
 * @param connection A solana web3 connection
 * @param env Solend program environment
 * @param ownerKeypair private keypair of owner
 * @param payerKeypair private keypair of feepayer
 * @param symbol reserve mint symbol
 * @param amount deposit amount
 * @return send depoist tx
 */
export const deposit = async (
    ...[
        connection,
        env,
        ownerKeypair,
        payerKeypair,
        symbol,
        amount,
    ]: lendingProps
) => {
    const solendAction = await SolendAction.buildDepositTxns(
        connection,
        amount,
        symbol,
        ownerKeypair.publicKey,
        env,
        new PublicKey('7y2cniJyAJtc3ybVrT6Yi9KSZTckYKzHuy6qDFtaBnmd')
    );

    const txs = await solendAction.sendTransactions(
        async (
            txn: Transaction,
            connection: Connection
        ): Promise<TransactionSignature> => {
            const txhash = await connection.sendTransaction(txn, [
                ownerKeypair,
                payerKeypair,
            ]);

            return txhash;
        }
    );

    console.log(txs);

    return txs;
};

/**
 * run Solend withdraw action.
 *
 * @param connection A solana web3 connection
 * @param env Solend program environment
 * @param ownerKeypair private keypair of owner
 * @param payerKeypair private keypair of feepayer
 * @param symbol reserve mint symbol
 * @param amount withdraw amount
 * @return send withdraw tx
 */
export const withdraw = async (
    ...[
        connection,
        env,
        ownerKeypair,
        payerKeypair,
        symbol,
        amount,
    ]: lendingProps
) => {
    const solendAction = await SolendAction.buildWithdrawTxns(
        connection,
        amount,
        symbol,
        ownerKeypair.publicKey,
        env,
        new PublicKey('7y2cniJyAJtc3ybVrT6Yi9KSZTckYKzHuy6qDFtaBnmd')
    );

    const txs = await solendAction.sendTransactions(
        async (
            txn: Transaction,
            connection: Connection
        ): Promise<TransactionSignature> => {
            const txhash = await connection.sendTransaction(txn, [
                ownerKeypair,
                payerKeypair,
            ]);

            return txhash;
        }
    );

    console.log(txs);

    return txs;
};

/**
 * run Solend depositReserveLiquidity action.
 *
 * @param connection A solana web3 connection
 * @param env Solend program environment
 * @param ownerKeypair private keypair of owner
 * @param payerKeypair private keypair of feepayer
 * @param symbol reserve mint symbol
 * @param amount depositReserveLiquidity amount
 * @return send depositReserveLiquidity tx
 */
export const depositReserveLiquidity = async (
    ...[
        connection,
        env,
        ownerKeypair,
        payerKeypair,
        symbol,
        amount,
    ]: lendingProps
) => {
    const solendAction = await SolendAction.buildDepositReserveLiquidityTxns(
        connection,
        amount,
        symbol,
        ownerKeypair.publicKey,
        env,
        new PublicKey('7y2cniJyAJtc3ybVrT6Yi9KSZTckYKzHuy6qDFtaBnmd')
    );

    const txs = await solendAction.sendTransactions(
        async (
            txn: Transaction,
            connection: Connection
        ): Promise<TransactionSignature> => {
            const txhash = await connection.sendTransaction(txn, [
                ownerKeypair,
                payerKeypair,
            ]);

            return txhash;
        }
    );

    console.log(txs);

    return txs;
};

/**
 * run Solend redeemReserveCollateral action.
 *
 * @param connection A solana web3 connection
 * @param env Solend program environment
 * @param ownerKeypair private keypair of owner
 * @param payerKeypair private keypair of feepayer
 * @param symbol reserve mint symbol
 * @param amount redeemReserveCollateral amount
 * @return send redeemReserveCollateral tx
 */
export const redeemReserveCollateral = async (
    ...[
        connection,
        env,
        ownerKeypair,
        payerKeypair,
        symbol,
        amount,
    ]: lendingProps
) => {
    const solendAction = await SolendAction.buildRedeemReserveCollateralTxns(
        connection,
        amount,
        symbol,
        ownerKeypair.publicKey,
        env,
        new PublicKey('7y2cniJyAJtc3ybVrT6Yi9KSZTckYKzHuy6qDFtaBnmd')
    );

    const txs = await solendAction.sendTransactions(
        async (
            txn: Transaction,
            connection: Connection
        ): Promise<TransactionSignature> => {
            const txhash = await connection.sendTransaction(txn, [
                ownerKeypair,
                payerKeypair,
            ]);

            return txhash;
        }
    );

    console.log(txs);

    return txs;
};

/**
 * run Solend depositObligationCollateral action.
 *
 * @param connection A solana web3 connection
 * @param env Solend program environment
 * @param ownerKeypair private keypair of owner
 * @param payerKeypair private keypair of feepayer
 * @param symbol reserve mint symbol
 * @param amount depositObligationCollateral amount
 * @return send depositObligationCollateral tx
 */
export const depositObligationCollateral = async (
    ...[
        connection,
        env,
        ownerKeypair,
        payerKeypair,
        symbol,
        amount,
    ]: lendingProps
) => {
    const solendAction =
        await SolendAction.buildDepositObligationCollateralTxns(
            connection,
            amount,
            symbol,
            ownerKeypair.publicKey,
            env,
            new PublicKey('7y2cniJyAJtc3ybVrT6Yi9KSZTckYKzHuy6qDFtaBnmd')
        );

    const txs = await solendAction.sendTransactions(
        async (
            txn: Transaction,
            connection: Connection
        ): Promise<TransactionSignature> => {
            const txhash = await connection.sendTransaction(txn, [
                ownerKeypair,
                payerKeypair,
            ]);

            return txhash;
        }
    );

    console.log(txs);

    return txs;
};

/**
 * run Solend borrow action.
 *
 * @param connection A solana web3 connection
 * @param env Solend program environment
 * @param ownerKeypair private keypair of owner
 * @param payerKeypair private keypair of feepayer
 * @param symbol reserve mint symbol
 * @param amount borrow amount
 * @return send borrow tx
 */
export const borrow = async (
    ...[
        connection,
        env,
        ownerKeypair,
        payerKeypair,
        symbol,
        amount,
    ]: lendingProps
) => {
    const solendAction = await SolendAction.buildBorrowTxns(
        connection,
        amount,
        symbol,
        ownerKeypair.publicKey,
        env,
        undefined,
        new PublicKey('7y2cniJyAJtc3ybVrT6Yi9KSZTckYKzHuy6qDFtaBnmd')
    );

    const txs = await solendAction.sendTransactions(
        async (
            txn: Transaction,
            connection: Connection
        ): Promise<TransactionSignature> => {
            const txhash = await connection.sendTransaction(txn, [
                ownerKeypair,
                payerKeypair,
            ]);

            return txhash;
        }
    );

    console.log(txs);

    return txs;
};

/**
 * run Solend repay action.
 *
 * @param connection A solana web3 connection
 * @param env Solend program environment
 * @param ownerKeypair private keypair of owner
 * @param payerKeypair private keypair of feepayer
 * @param symbol reserve mint symbol
 * @param amount repay amount
 * @return send repay tx
 */
export const repay = async (
    ...[
        connection,
        env,
        ownerKeypair,
        payerKeypair,
        symbol,
        amount,
    ]: lendingProps
) => {
    const solendAction = await SolendAction.buildRepayTxns(
        connection,
        amount,
        symbol,
        ownerKeypair.publicKey,
        env,
        new PublicKey('7y2cniJyAJtc3ybVrT6Yi9KSZTckYKzHuy6qDFtaBnmd')
    );

    const txs = await solendAction.sendTransactions(
        async (
            txn: Transaction,
            connection: Connection
        ): Promise<TransactionSignature> => {
            const txhash = await connection.sendTransaction(txn, [
                ownerKeypair,
                payerKeypair,
            ]);

            return txhash;
        }
    );

    console.log(txs);

    return txs;
};
