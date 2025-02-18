use solana_copytrading_bot::{
    common::{config::Config, constants::RUN_MSG},
    engine::monitor::copytrader,
};

#[tokio::main]
async fn main() {
    /* Initial Settings */
    let config = Config::new().await;

    /* Running Bot */
    let run_msg = RUN_MSG;
    println!("{}", run_msg);

    copytrader(
        &config.rpc_wss,
        config.app_state,
        config.swap_config,
    )
    .await;
}
