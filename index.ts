import { BN } from "@coral-xyz/anchor";
import { SYSTEM_PROGRAM_ID } from "@coral-xyz/anchor/dist/cjs/native/system";
import { Metaplex } from "@metaplex-foundation/js";
import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  createAssociatedTokenAccountInstruction,
  getAccount,
  getAssociatedTokenAddress,
  getAssociatedTokenAddressSync,
  getMint,
  NATIVE_MINT,
  TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import {
  ComputeBudgetProgram,
  Connection,
  Keypair,
  LAMPORTS_PER_SOL,
  PublicKey,
  sendAndConfirmTransaction,
  Transaction,
  TransactionInstruction,
  VersionedTransaction,
} from "@solana/web3.js";
import base58 from "bs58";
import WebSocket from "ws";

import { getAllTokenPrice } from "./config";
import {
  JUP_AGGREGATOR,
  METEORA,
  METEORA_DLMM,
  MOONSHOT,
  ORCA_V1,
  ORCA_V2,
  PUMP_FUN,
  RAYDIUM,
  RAYDIUM_CLMM,
  RAYDIUM_CP,
  RPC_ENDPOINT,
  RPC_WEBSOCKET_ENDPOINT,
  TARGET_WALLET,
} from "./constants";
import { BONDING_CURV, bufferFromUInt64, execute } from "./utils/common";
import { getAtaList } from "./utils/spl";

const connection = new Connection(RPC_ENDPOINT, { commitment: "processed" });
const ws = new WebSocket(RPC_WEBSOCKET_ENDPOINT);
const keyPair = Keypair.fromSecretKey(
  base58.decode(process.env.PRIVATE_KEY as string)
);

const metaplex = Metaplex.make(connection);
const geyserList: any = [];
const wallet = TARGET_WALLET as string;
console.log("🚀 ~ wallet:", wallet);

// Global variables
const GLOBAL = new PublicKey("4wTV1YmiEkRvAtNtsSGPtUrqRYQMe5SKy2uB4Jjaxnjf");
const FEE_RECIPIENT = new PublicKey(
  "CebN5WGQ4jvEPvsVU4EoHEpgzq1VV7AbicfhtW4xC9iM"
);
const SYSTEM_PROGRAM = new PublicKey("11111111111111111111111111111111");
const ASSOC_TOKEN_ACC_PROG = new PublicKey(
  "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL"
);
const RENT = new PublicKey("SysvarRent111111111111111111111111111111111");
const PUMP_FUN_ACCOUNT = new PublicKey(
  "Ce6TQqeHC9p8KetsN6JsjHK7UTZk7nasjjnr7XxXp9F1"
);
const PUMP_FUN_PROGRAM = new PublicKey(
  "6EF8rrecthR5Dkzon8Nwu78hRvfCKubJ14M5uBEwF6P"
);
const TRADE_PROGRAM_ID = new PublicKey(
  "6EF8rrecthR5Dkzon8Nwu78hRvfCKubJ14M5uBEwF6P"
);
const BONDING_ADDR_SEED = new Uint8Array([
  98, 111, 110, 100, 105, 110, 103, 45, 99, 117, 114, 118, 101,
]);
let bonding: PublicKey;
let assoc_bonding_addr: PublicKey;

const getMetaData = async (mintAddr: string) => {
  const mintAddress = new PublicKey(mintAddr);

  let tokenName: string = "";
  let tokenSymbol: string = "";
  let tokenLogo: string = "";

  const metadataAccount = metaplex
    .nfts()
    .pdas()
    .metadata({ mint: mintAddress });

  const metadataAccountInfo = await connection.getAccountInfo(metadataAccount);

  if (metadataAccountInfo) {
    const token = await metaplex
      .nfts()
      .findByMint({ mintAddress: mintAddress });
    tokenName = token.name;
    tokenSymbol = token.symbol;
    //    @ts-ignore
    tokenLogo = token.json?.image;
  }

  return {
    tokenName: tokenName,
    tokenSymbol: tokenSymbol,
    tokenLogo: tokenLogo,
  };
};

getAllTokenPrice();

const getPoolState = async (mint: PublicKey, connection: Connection) => {
  try {
    // get the address of bonding curve and associated bonding curve
    
    // get the accountinfo of bonding curve

    // console.log(":rocket: ~ accountInfo:", accountInfo)
    

    // get the poolstate of the bonding curve

    // Calculate tokens out
    const virtualSolReserves = poolState.virtualSolReserves;
    const virtualTokenReserves = poolState.virtualTokenReserves;
    return { virtualSolReserves, virtualTokenReserves };
  } catch (error) {
    console.log("getting·pool·state·error·=>·", error);
    return false;
  }
};

// Function to send a request to the WebSocket server
ws.on("open", async function open() {
  await sendRequest(wallet);
  console.log("send request\n");
});

ws.on("message", async function incoming(data: any) {
  const messageStr = data.toString("utf8");
  // console.log("🚀 ~ incoming ~ messageStr:", messageStr)
  try {
    const messageObj = JSON.parse(messageStr);
    const result = messageObj.params.result;

    if (messageStr.includes(JUP_AGGREGATOR)) {
      console.log("JUP_AGGREGATOR");
    } else if (messageStr.includes(METEORA_DLMM)) {
      console.log("METEORA_DLMM");
    } else if (messageStr.includes(METEORA)) {
      console.log("METEORA");
    } else if (messageStr.includes(RAYDIUM_CLMM)) {
      console.log("RAYDIUM_CLMM");
    } else if (messageStr.includes(RAYDIUM)) {
      console.log("RAYDIUM");
    } else if (messageStr.includes(RAYDIUM_CP)) {
      console.log("RAYDIUM_CP");
    } else if (messageStr.includes(PUMP_FUN)) {
      console.log("PUMP_FUN");
    } else if (messageStr.includes(MOONSHOT)) {
      console.log("MOONSHOT");
    } else if (messageStr.includes(ORCA_V1)) {
      console.log("ORCA_V1");
    } else if (messageStr.includes(ORCA_V2)) {
      console.log("ORCA_V2");
    } else {
      console.log("This is not swap");
      return
    }

    if (messageStr.includes("Swap") || messageStr.includes("Buy") || messageStr.includes("Sell") || messageStr.includes("Route")) {
      let routingPro: any = []

      for (let i = 0; i < result.transaction.transaction.message.instructions.length; i++) {
        const proId = result.transaction.transaction.message.instructions[i];
        if (proId['accounts'] != undefined) {
          if (proId.accounts.length > 0) {
            routingPro.push(result.transaction.transaction.message.instructions[i].programId)
          }
        }
      }

      let temp: any = []

      for (let i = 0; i < messageObj.params.result.transaction.meta.innerInstructions.length; i++) {
        const element = messageObj.params.result.transaction.meta.innerInstructions[i];

        for (let index = 0; index < element.instructions.length; index++) {
          const subelement = element.instructions[index];
          temp.push(subelement)
        }
      }

      let temp1: any = []

      for (let index = 0; index < temp.length; index++) {
        const element = temp[index];

        if (element['program'] == "spl-token") {
          if (element['parsed']['type'] == "transfer" || element['parsed']['type'] == "transferChecked") {
            temp1.push(element)
          }
        }
      }

      const swapInfo: any = [
        {
          tokenAta: temp1[0].parsed.info.source,
          tokenAmount: temp1[0].parsed.info.amount == undefined ? temp1[0].parsed.info.tokenAmount.amount : temp1[0].parsed.info.amount
        },
        {
          tokenAta: temp1[temp1.length - 1].parsed.info.destination,
          tokenAmount: temp1[temp1.length - 1].parsed.info.amount == undefined ? temp1[temp1.length - 1].parsed.info.tokenAmount.amount : temp1[temp1.length - 1].parsed.info.amount
        },
      ]

      console.log(1);
      let inputMsg: any = [];
      for (let i = 0; i < 2; i++) {
        const ele = swapInfo[i];
        let mintAddress;
        let temp
        try {
          temp = setTimeout(() => {
            throw new Error("NATIVE TOKEN")
          }, 3000)
          const ataAccountInfo = await getAccount(connection, new PublicKey(ele.tokenAta));
          mintAddress = ataAccountInfo.mint;
        } catch (error) {
          mintAddress = NATIVE_MINT
        }

        console.log(2);
        clearTimeout(temp)

        const mintAccountInfo = await getMint(connection, mintAddress);
        const { decimals, supply } = mintAccountInfo;

        console.log(2);
        const {
          tokenName,
          tokenSymbol,
          tokenLogo,
        } = await getMetaData(mintAddress.toBase58())

        inputMsg.push({
          ...ele,
          tokenName: tokenName,
          tokenSymbol: tokenSymbol,
          tokenLogo: tokenLogo,
          mint: mintAddress.toBase58(),
          decimals: Number(decimals),
          uiAmount: Number(parseInt(ele.tokenAmount) / (10 ** decimals)),
          supply: Number(supply),
        })
      }

      if (messageStr.includes("Buy") || messageStr.includes("Sell")) {

        if (messageStr.includes("Buy")) {
          const amount: number = messageObj.params.result.transaction.meta.innerInstructions[0].instructions[1].parsed.info.lamports;
          new PublicKey(inputMsg[0].mint);

          const tokenInfo = await getPoolState(new PublicKey(inputMsg[0].mint), connection);
          //  @ts-ignore
          await buy(keyPair, new PublicKey(inputMsg[0].mint), amount / 10 ** 9, 100, connection, tokenInfo.virtualSolReserves!, tokenInfo.virtualTokenReserves)
        } else {

          console.log(messageStr);
          const tokenInfo = await getPoolState(new PublicKey(inputMsg[1].mint), connection);

          console.log(inputMsg[1] , inputMsg[0]);
          const tokenAccountAddress = getAssociatedTokenAddressSync(new PublicKey(inputMsg[1].mint) , keyPair.publicKey)

          console.log(tokenAccountAddress);
          //  @ts-ignore
          await sell(keyPair, new PublicKey(inputMsg[1].mint), new BN(inputMsg[1].tokenAmount), 0.25, connection , tokenAccountAddress , tokenInfo.virtualSolReserves!, tokenInfo.virtualTokenReserves)
        }
      } else {
        // ** General Swap
        console.log("inputMsg : ", inputMsg);
        const baseToken = inputMsg[0];
        const quoteToken = inputMsg[1];

        console.log(`https://quote-api.jup.ag/v6/quote?inputMint=${baseToken.mint}&outputMint=${quoteToken.mint}&amount=${baseToken.tokenAmount}&slippageBps=1000`);
        const quoteResponse = await (
          await fetch(
            `https://quote-api.jup.ag/v6/quote?inputMint=${baseToken.mint}&outputMint=${quoteToken.mint}&amount=${baseToken.tokenAmount}&slippageBps=1000`
          )
        ).json();
        console.log("🚀 ~ getBuyTxWithJupiter ~ quoteResponse:", quoteResponse)
        // get serialized transactions for the swap

        // deserialize the transaction
        const swapTransactionBuf = Buffer.from(swapTransaction, "base64");
        var transaction = VersionedTransaction.deserialize(swapTransactionBuf);
        // sign the transaction
        console.log("Result: ", tokenTx);
      }
    } else {
      console.log("this is not");
    }
  } catch (e) { }
});

export async function sendRequest(inputpubkey: string) {
  const temp: any = [];

  const pubkey: any = await getAtaList(connection, inputpubkey);

  for (let i = 0; i < pubkey.length; i++) {
    if (!geyserList.includes(pubkey[i])) {
      geyserList.push(pubkey[i]);
      temp.push(pubkey[i]);
    }
  }

  const tokenAccounts = await connection.getTokenAccountsByOwner(
    keyPair.publicKey,
    {
      programId: TOKEN_PROGRAM_ID,
    },
    "confirmed"
  );
  console.log("🚀 ~ sendRequest ~ tokenAccounts:", tokenAccounts);

  const request = {
    jsonrpc: "2.0",
    id: 420,
    method: "transactionSubscribe",
    params: [
      {
        failed: false,
        accountInclude: temp,
      },
      {
        commitment: "finalized",
        encoding: "jsonParsed",
        transactionDetails: "full",
        maxSupportedTransactionVersion: 0,
      },
    ],
  };

  if (temp.length > 0) {
    ws.send(JSON.stringify(request));
  }
}

export const buy = async (
  keypair: Keypair,
  mint: PublicKey,
  solIn: number,
  slippageDecimal: number = 0.01,
  connection: Connection,
  virtualSolReserves: BN,
  virtualTokenReserves: BN
) => {
  console.time("tx");
  const buyerKeypair = keypair;
  const buyerWallet = buyerKeypair.publicKey;
  const tokenMint = mint;
  const buyerAta = await getAssociatedTokenAddress(tokenMint, buyerWallet);

  try {
    const ixs: TransactionInstruction[] = [
      // Increase compute budget to prioritize transaction
      ComputeBudgetProgram.setComputeUnitPrice({ microLamports: 1_000_000 }),
      ComputeBudgetProgram.setComputeUnitLimit({ units: 100_000 }),
    ];
    // Math.floor(txFee * 10 ** 10 / computeUnit * 10 ** 6)
    // Attempt to retrieve token account, otherwise create associated token account

    try {
      const buyerTokenAccountInfo = await connection.getAccountInfo(buyerAta);

      if (!buyerTokenAccountInfo) {
        ixs.push(
          createAssociatedTokenAccountInstruction(
            buyerWallet,
            buyerAta,
            buyerWallet,
            tokenMint
          )
        );
      }
    } catch (error) {
      console.log("Creating token account error => ", error);
      return;
    }

    const solInLamports = solIn * LAMPORTS_PER_SOL;
    const tokenOut = Math.round(
      solInLamports * virtualTokenReserves.div(virtualSolReserves).toNumber()
    );
    const ATA_USER = buyerAta;
    const USER = buyerWallet;
    // Build account key list
    const keys = [
      { pubkey: GLOBAL, isSigner: false, isWritable: false },
      { pubkey: FEE_RECIPIENT, isSigner: false, isWritable: true },
      { pubkey: tokenMint, isSigner: false, isWritable: false },
      { pubkey: bonding, isSigner: false, isWritable: true },
      { pubkey: assoc_bonding_addr, isSigner: false, isWritable: true },
      { pubkey: ATA_USER, isSigner: false, isWritable: true },
      { pubkey: USER, isSigner: true, isWritable: true },
      { pubkey: SYSTEM_PROGRAM_ID, isSigner: false, isWritable: false },
      { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
      { pubkey: RENT, isSigner: false, isWritable: false },
      { pubkey: PUMP_FUN_ACCOUNT, isSigner: false, isWritable: false },
      { pubkey: PUMP_FUN_PROGRAM, isSigner: false, isWritable: false },
    ];

    // Slippage calculation
    const calc_slippage_up = (sol_amount: number, slippage: number): number => {
      const lamports = sol_amount * LAMPORTS_PER_SOL;
      return Math.round(lamports * (1 + slippage));
    };

    const instruction_buf = Buffer.from("66063d1201daebea", "hex");
    const token_amount_buf = Buffer.alloc(8);
    token_amount_buf.writeBigUInt64LE(BigInt(tokenOut), 0);
    const slippage_buf = Buffer.alloc(8);
    slippage_buf.writeBigUInt64LE(
      BigInt(calc_slippage_up(solInLamports, slippageDecimal)),
      0
    );
    const data = Buffer.concat([
      instruction_buf,
      token_amount_buf,
      slippage_buf,
    ]);
    const swapInstruction = new TransactionInstruction({
      keys: keys,
      programId: PUMP_FUN_PROGRAM,
      data: data,
    });
    const blockhash = await connection.getLatestBlockhash();
    ixs.push(swapInstruction);
    const legacyTransaction = new Transaction().add(...ixs);
    legacyTransaction.recentBlockhash = blockhash.blockhash;
    legacyTransaction.feePayer = buyerKeypair.publicKey;
    console.timeEnd("tx");
    console.log("buying token");
    console.time("buy");
    console.log("confirming transaction");
    const sig = await sendAndConfirmTransaction(
      connection,
      legacyTransaction,
      [buyerKeypair],
      { skipPreflight: true, preflightCommitment: "processed" }
    );
    console.log("Buy signature: ", `https://solscan.io/tx/${sig}`);
    console.timeEnd("buy");
    return sig;
  } catch (e) {
    console.log(`Failed to buy token, ${mint}`);
    console.log("buying token error => ", e);
    return false;
  }
};

export const sell = async (
  payerKeypair: Keypair,
  mint: PublicKey,
  tokenBalance: number,
  slippageDecimal: number = 0.25,
  connection: Connection,
  tokenAccountAddress: PublicKey,
  virtualSolReserves: BN,
  virtualTokenReserves: BN
) => {
  try {
    console.log(1);
    const owner = payerKeypair;
    console.log(2);
    const txBuilder = new Transaction();
    console.log(3);
    // Calculate the sell price
    const tokenAccount = tokenAccountAddress;
    console.log(4);
    console.log(
      tokenBalance,
      slippageDecimal,
      virtualSolReserves,
      virtualTokenReserves
    );
    const minSolOutput = Math.floor(
      tokenBalance *
        virtualSolReserves.mul(new BN(1)).div(virtualTokenReserves).toNumber()
    );
    console.log("minSolOut: ", minSolOutput);
    const keys = [
      { pubkey: GLOBAL, isSigner: false, isWritable: false },
      { pubkey: FEE_RECIPIENT, isSigner: false, isWritable: true },
      { pubkey: mint, isSigner: false, isWritable: false },
      { pubkey: bonding, isSigner: false, isWritable: true },
      { pubkey: assoc_bonding_addr, isSigner: false, isWritable: true },
      { pubkey: tokenAccount, isSigner: false, isWritable: true },
      { pubkey: owner.publicKey, isSigner: false, isWritable: true },
      { pubkey: SYSTEM_PROGRAM, isSigner: false, isWritable: false },
      { pubkey: ASSOC_TOKEN_ACC_PROG, isSigner: false, isWritable: false },
      { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
      { pubkey: PUMP_FUN_ACCOUNT, isSigner: false, isWritable: false },
      { pubkey: PUMP_FUN_PROGRAM, isSigner: false, isWritable: false },
    ];
    const data = Buffer.concat([
      bufferFromUInt64("12502976635542562355"),
      bufferFromUInt64(tokenBalance),
      bufferFromUInt64(minSolOutput),
    ]);

    const ixs: TransactionInstruction[] = [
      // Increase compute budget to prioritize transaction
      ComputeBudgetProgram.setComputeUnitPrice({ microLamports: 1_000_000 }),
      ComputeBudgetProgram.setComputeUnitLimit({ units: 100_000 }),
    ];

    txBuilder.add(...ixs);
    const instruction = new TransactionInstruction({
      keys: keys,
      programId: PUMP_FUN_PROGRAM,
      data: data,
    });
    txBuilder.add(instruction);
    txBuilder.feePayer = owner.publicKey;
    txBuilder.recentBlockhash = (
      await connection.getLatestBlockhash()
    ).blockhash;
    // console.log(transaction);
    console.log(await connection.simulateTransaction(txBuilder));
    const signature = await sendAndConfirmTransaction(
      connection,
      txBuilder,
      [owner],
      { skipPreflight: true, preflightCommitment: "processed" }
    );

    if (signature) {
      console.log("Sell transaction confirmed:", signature);
    }
  } catch (error) {
    console.log(error);
  }
};
