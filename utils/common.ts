import { bool, GetStructureSchema, struct, u64 } from "@raydium-io/raydium-sdk";
import {
  ComputeBudgetProgram,
  Connection,
  PublicKey,
  sendAndConfirmTransaction,
  Transaction,
  TransactionInstruction,
  VersionedTransaction,
} from "@solana/web3.js";
const computeUnit = 6000000;
interface Blockhash {
  blockhash: string;
  lastValidBlockHeight: number;
}
export type BONDINGCURVECUSTOMLAYOUT = typeof BONDING_CURV;
export type BONDINGCURVECUSTOM = GetStructureSchema<BONDINGCURVECUSTOMLAYOUT>;
export const BONDING_CURV = struct([
  u64("virtualTokenReserves"),
  u64("virtualSolReserves"),
  u64("realTokenReserves"),
  u64("realSolReserves"),
  u64("tokenTotalSupply"),
  bool("complete"),
]);

export function bufferFromUInt64(value: number | string) {
  const buffer = Buffer.alloc(8);
  buffer.writeBigUInt64LE(BigInt(value));
  return buffer;
}

export async function createTransaction(
  connection: Connection,
  instructions: TransactionInstruction[],
  payer: PublicKey,
  priorityFeeInSol: number = 0 /// == 16_000_000_000_000_000
): Promise<Transaction> {
  const modifyComputeUnits = ComputeBudgetProgram.setComputeUnitLimit({
    units: computeUnit,
  });
  const transaction = new Transaction().add(modifyComputeUnits);

  if (priorityFeeInSol > 0) {
    // 100_000_000_000_000
    const microLamports =
      Math.round((priorityFeeInSol * 1_000_000_000) / computeUnit) * 10 ** 6; // convert SOL to microLamports
    // const microLamports = 100_000;
    const addPriorityFee = ComputeBudgetProgram.setComputeUnitPrice({
      microLamports,
    });
    transaction.add(addPriorityFee);
  }

  transaction.add(...instructions);
  transaction.feePayer = payer;
  transaction.recentBlockhash = (
    await connection.getRecentBlockhash()
  ).blockhash;
  return transaction;
}

export async function sendAndConfirmTransactionWrapper(
  connection: Connection,
  transaction: Transaction,
  signers: any[]
) {
  try {
    const signature = await sendAndConfirmTransaction(
      connection,
      transaction,
      signers,
      { skipPreflight: true }
    );
    console.log("Transaction confirmed with signature:", signature);
    return signature;
  } catch (error) {
    console.error("Error sending transaction:", error);
    return null;
  }
}

export const execute = async (
  transaction: VersionedTransaction,
  latestBlockhash: Blockhash,
  connection: Connection
) => {
  const signature = await connection.sendRawTransaction(
    transaction.serialize(),
    {
      preflightCommitment: "confirmed",
    }
  );
  console.log("excuting signature ===> ", signature);
  const confirmation = await connection.confirmTransaction(
    {
      signature,
      lastValidBlockHeight: latestBlockhash.lastValidBlockHeight,
      blockhash: latestBlockhash.blockhash,
    },
    "confirmed"
  );
  console.log("transaction confirmation ====> ", confirmation);

  if (confirmation.value.err) {
    console.log("Confrimtaion error");
    return signature;
  } else {
    console.log("https://solscan.io/tx/", signature);
  }
};

export function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
