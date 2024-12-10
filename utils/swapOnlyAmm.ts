import { Keypair, PublicKey, VersionedTransaction } from "@solana/web3.js";

export const getBuyTxWithJupiter = async (
  wallet: Keypair,
  quoteMint: PublicKey,
  amount: number
) => {
  try {
    const quoteResponse = await (
      await fetch(
        `https://quote-api.jup.ag/v6/quote?inputMint=So11111111111111111111111111111111111111112&outputMint=${quoteMint.toBase58()}&amount=${amount}&slippageBps=1000`
      )
    ).json();

    console.log("🚀 ~ getBuyTxWithJupiter ~ quoteResponse:", quoteResponse);
    // get serialized transactions for the swap
    const { swapTransaction } = await (
      await fetch("https://quote-api.jup.ag/v6/swap", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          quoteResponse,
          userPublicKey: wallet.publicKey.toString(),
          wrapAndUnwrapSol: true,
          dynamicComputeUnitLimit: true,
          prioritizationFeeLamports: 52000,
        }),
      })
    ).json();

    // deserialize the transaction
    const swapTransactionBuf = Buffer.from(swapTransaction, "base64");
    const transaction = VersionedTransaction.deserialize(swapTransactionBuf);

    // sign the transaction
    transaction.sign([wallet]);
    return transaction;
  } catch (error) {
    console.log("Failed to get buy transaction");
    return null;
  }
};

export const getSellTxWithJupiter = async (
  wallet: Keypair,
  baseMint: PublicKey,
  amount: number
) => {
  try {
    const quoteResponse = await (
      await fetch(
        `https://quote-api.jup.ag/v6/quote?inputMint=${baseMint.toBase58()}&outputMint=So11111111111111111111111111111111111111112&amount=${amount}&slippageBps=1000`
      )
    ).json();
    console.log("🚀 ~ getSellTxWithJupiter ~ quoteResponse:", quoteResponse);

    // get serialized transactions for the swap
    const { swapTransaction } = await (
      await fetch("https://quote-api.jup.ag/v6/swap", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          quoteResponse,
          userPublicKey: wallet.publicKey.toString(),
          wrapAndUnwrapSol: true,
          dynamicComputeUnitLimit: true,
          prioritizationFeeLamports: 52000,
        }),
      })
    ).json();

    // deserialize the transaction
    const swapTransactionBuf = Buffer.from(swapTransaction, "base64");
    const transaction = VersionedTransaction.deserialize(swapTransactionBuf);

    // sign the transaction
    transaction.sign([wallet]);
    return transaction;
  } catch (error) {
    console.log("🚀 ~ getSellTxWithJupiter ~ error:", error);
    console.log("Failed to get sell transaction");
    return null;
  }
};
