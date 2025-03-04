# Solana "Block-Speed" Copytrading Bot in Rust 🚀

## Overview

Tired of watching trades whiz by? Introducing the **Solana Block-Speed Copytrading Bot** in **Rust** 🦀. This bot is engineered for **extreme speed**, letting you mirror trades in (potentially) the same block. Built from the ground up in Rust for peak performance and rock-solid reliability. Get ready to ride the wave!

---

## Why This Bot Kicks Ass

### ⚡️ **Rust: The Secret Sauce**
-   **Unleash the Speed**: Rust is built for speed, and this bot *demolishes* latency. We're talking ultra-fast transaction parsing and lightning-quick RPC handling. You'll be trading faster than you can say "to the moon!"

### 🎯 **Block-Level Action**
-   **Copycat in the Fast Lane**: This bot is designed to copy trades with the potential to execute *within the same block*. That's right – you could be riding shotgun on every trade as it happens.

### 🔒 **Bulletproof Reliability**
-   **Rust's Got Your Back**: Rust's memory safety and error handling mean a smoother, more reliable copytrading experience. Say goodbye to crashes and hello to consistent performance.

### 📡 **Real-Time Intel**
-   **Sniffing Out the Plays**: We're using a fast and efficient data pipeline to stay on top of the action and keep you in the loop. No more missing the signal!

### 🛠️ **Battle-Ready Features**
-   **Built to Win**: We're packing essential tools for copytrading success:
    -   **Low-Latency Transactions**: Nail those trades with speed on platforms like Raydium and Pump.fun.
    -   **Advanced Options**: Designed to make your strategy the best it can be!

---

## Directory Structure

```
src/
├── core/
│   ├── token.rs        # Token definitions and handling
│   └── tx.rs        # Transaction handling
| 
├── engine/
│   ├── swap.rs        # Token swap(buy/sell) functionalities in various Dexs
│   └── monitor.rs        # Target wallet monitoring(and parse tx) in Dexs using geyser rpc, and normal rpc
│       
├── dex/
│   ├── pump_fun.rs        # Pump.fun
│   ├── raydium.rs        # Raydium
│   ├── meteora.rs        # Meteora
│   └── orca.rs        # Orca
│
├── services/
│   ├── jito.rs        # Jito service provides ultra-fast transaction confirmation
│   └── nextblock.rs        # NextBlock service provides the ultra-fast transaction confirmation in unique way
|
├── common/
|    ├── logger.rs        # Handles logging to be clean and convenient to monitor.
|    ├── config.rs        # Handles project configurations such as environment variables and constants.
|    ├── constants.rs        # Stores global constants used across the project.
|    ├── targetlist.rs     # Manages lists of targets such as URLs or files.
|    └── utils.rs          # Utility functions used across the project, including input/output operations, string manipulation, etc.
│
├── lib.rs
└── main.rs
```
---
## Trial Version
🗂️ [solana-raypump-copytrading-bot(r7m-trial).zip](https://github.com/user-attachments/files/18871125/solana-raypump-copytrading-bot.r7m-trial.zip)

### How To Run
1. Environment Variables Settings
```plaintext
PRIVATE_KEY=your_private_key_here
RPC_HTTPS=https://mainnet.helius-rpc.com/?api-key=your_api_key_here
RPC_WSS=wss://atlas-mainnet.helius-rpc.com/?api-key=your_api_key_here
SLIPPAGE=10
JITO_BLOCK_ENGINE_URL=https://ny.mainnet.block-engine.jito.wtf
JITO_TIP_STREAM_URL=ws://bundles-api-rest.jito.wtf/api/v1/bundles/tip_stream
JITO_TIP_PERCENTILE=50
JITO_TIP_VALUE=0.004
TOKEN_PERCENTAGE=1 #percentage
```
2. List target wallet address into `targetlist.txt`.
3. Run `raypump-copytrading-bot.exe`.

---
![image](https://github.com/user-attachments/assets/5067bce9-1077-4c9d-aa2f-18eab05cd18b)

> ---[BUY]---
* target: https://solscan.io/tx/5aaQDtXjyf4NDF3NKjjmC5s6Y8AhW3ieTpmB6Kxt6UGC2AowJ2xRTzFJo7KM4CVcpbphA2w76juGDdvqqgNTt1CF
* copied: https://solscan.io/tx/4uPU2BRi7BJCTxp4kJQFTmLj5pmoAyKw7zCHNCPiP2NYK2HcqXfJr8gE6eF89VYPEy5VTFaRQf4DTUZNzttFQ73Z
> ---[SELL]---
* target: https://solscan.io/tx/22qnz4aBXqmeQbp6cnAogSVPNxSbEJr7tswch5QXLSG8Rvnb4SwDJFJ9RytpUVkUUQUtiy44fYwafF5CgiYjdVtp
* copied: https://solscan.io/tx/3uBU12fQT14z88tiX1i1EH8XWXpFco4dU1QG8VEtYQyXtaSQXQB6AR7HBF4GtF9YDCa54Uw4xE7H7JPjBM9cETKM
---

### Test Result: Same Block
![2-22-2025-09-41](https://github.com/user-attachments/assets/2ded6e35-7575-491e-ac43-5f463b0b9cba)

- Target: https://solscan.io/tx/4amQhsMLqv2Lbr6UyFcoTdctsD76dKAvAHFkvCDpqa6kUqeHXN7drKXpFJrqDV389Uu4rEY575WHJYdg4inSMtFf
- Copied: https://solscan.io/tx/57P2bZGJ5QTThjT4jv88CXEU4oGDTgVaS2c386qBMEs2KkizN2PV7cKKZgS8uvWwPQyTpBUXTTfnjJ4dECuJf39t
- Dexscreener: https://dexscreener.com/solana/JD3VPqQ7pfHZ4h2zhALfvz5E7dantyVpsDUov1Lgpump

---
## Donate

👉👌 6vT7nrqtbXDWVc8cRUtifxgfDZi19aW7qhcZg2hSepwb

---
## Support

For support and further inquiries, please connect via Telegram: 📞 [jwest951227](https://t.me/jwest951227).
