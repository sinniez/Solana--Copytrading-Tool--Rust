use std::{env, sync::Arc, time::Duration};

use anyhow::Result;
use jito_json_rpc_client::jsonrpc_client::rpc_client::RpcClient as JitoRpcClient;
use solana_client::rpc_client::RpcClient;
use solana_sdk::{
    hash::Hash,
    instruction::Instruction,
    signature::Keypair,
    signer::Signer,
    system_transaction,
    transaction::{Transaction, VersionedTransaction},
};
use spl_token::ui_amount_to_amount;

use std::str::FromStr;
use tokio::time::Instant;

use crate::{
    common::utils::log_message,
    services::jito::{
        self, get_tip_account, get_tip_value, init_tip_accounts, wait_for_bundle_confirmation,
    },
};

// prioritization fee = UNIT_PRICE * UNIT_LIMIT
fn get_unit_price() -> u64 {
    env::var("UNIT_PRICE")
        .ok()
        .and_then(|v| u64::from_str(&v).ok())
        .unwrap_or(1)
}

fn get_unit_limit() -> u32 {
    env::var("UNIT_LIMIT")
        .ok()
        .and_then(|v| u32::from_str(&v).ok())
        .unwrap_or(300_000)
}
pub async fn jito_confirm(
    keypair: &Keypair,
    version_tx: VersionedTransaction,
    recent_block_hash: &Hash,
) {
    init_tip_accounts().await.unwrap();
    let tip_account = get_tip_account().await.unwrap();
    let jito_client = Arc::new(JitoRpcClient::new(format!(
        "{}/api/v1/bundles",
        *jito::BLOCK_ENGINE_URL
    )));
    // jito tip, the upper limit is 0.1
    let mut tip = get_tip_value().await.unwrap();
    tip = tip.min(0.1);
    let tip_lamports = ui_amount_to_amount(tip, spl_token::native_mint::DECIMALS);
    // tip tx
    let bundle: Vec<VersionedTransaction> = vec![
        version_tx,
        VersionedTransaction::from(system_transaction::transfer(
            keypair,
            &tip_account,
            tip_lamports,
            recent_block_hash.clone(),
        )),
    ];
    let bundle_id = jito_client.send_bundle(&bundle).await.unwrap();

    let _txs = match wait_for_bundle_confirmation(
        move |id: String| {
            let client = Arc::clone(&jito_client);
            async move {
                let response = client.get_bundle_statuses(&[id]).await;
                let statuses = response.inspect_err(|err| {
                    println!("Error fetching bundle status: {:?}", err);
                })?;
                Ok(statuses.value)
            }
        },
        bundle_id,
        Duration::from_millis(1000),
        Duration::from_secs(10),
    )
    .await
    {
        Ok(data) => {
            let msg = "Copy Wallet: ".to_string()
                + &keypair.pubkey().to_string()
                + "  https://solscan.io/tx/"
                + &data[0]
                + "\n"
                + "Rusult: Success"
                + "\n";
            let _ = log_message(&msg).await;
        }
        Err(e) => {
            let _ = log_message("Failed: Loop exceeded 10s, breaking out\n").await;
        }
    };
}

pub async fn new_signed_and_send(
    client: &RpcClient,
    keypair: &Keypair,
    mut instructions: Vec<Instruction>,
    use_jito: bool,
) -> Result<Vec<String>> {
    let start_time = Instant::now();
    let unit_price = get_unit_price();
    let unit_limit = get_unit_limit();
    // If not using Jito, manually set the compute unit price and limit

    let recent_blockhash = client.get_latest_blockhash()?;
    let txn = Transaction::new_signed_with_payer(
        &instructions,
        Some(&keypair.pubkey()),
        &vec![keypair],
        recent_blockhash,
    );

    let mut txs = vec![];

    // jito
    init_tip_accounts().await;
    let tip_account = get_tip_account().await?;
    let jito_client = Arc::new(JitoRpcClient::new(format!(
        "{}/api/v1/bundles",
        *jito::BLOCK_ENGINE_URL
    )));
    // jito tip, the upper limit is 0.1
    let mut tip = get_tip_value().await?;
    tip = tip.min(0.1);
    let tip_lamports = ui_amount_to_amount(tip, spl_token::native_mint::DECIMALS);

    // let result = client.simulate_transaction(&txn);

    // println!("result: {:#?}", result);
    let bundle: Vec<VersionedTransaction> = vec![
        VersionedTransaction::from(txn),
        VersionedTransaction::from(system_transaction::transfer(
            keypair,
            &tip_account,
            tip_lamports,
            recent_blockhash,
        )),
    ];

    let bundle_id = jito_client.send_bundle(&bundle).await?;

    txs = wait_for_bundle_confirmation(
        move |id: String| {
            let client = Arc::clone(&jito_client);
            async move {
                let response = client.get_bundle_statuses(&[id]).await;
                let statuses = response.inspect_err(|err| {})?;
                Ok(statuses.value)
            }
        },
        bundle_id,
        Duration::from_millis(1000),
        Duration::from_secs(10),
    )
    .await?;
    let msg = "Copy Wallet: ".to_string()
        + &keypair.pubkey().to_string()
        + "  https://solscan.io/tx/"
        + &txs[0]
        + "\n"
        + "Rusult: Success"
        + "\n";
    let _ = log_message(&msg).await;
    Ok(txs)
}
