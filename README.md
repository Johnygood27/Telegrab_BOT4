# Telegrab_BOT4

This repository contains an example dApp demonstrating encrypted computation on Ethereum using the **FHEVM** protocol. The `encrypted-adder` folder holds a Hardhat project with the `EncryptedAdder` smart contract.

## Quick start

1. Install **Node.js 20 LTS** and run the dependency installation:

```bash
cd encrypted-adder
npm install
```

2. Create `.env` inside `encrypted-adder` (you can start from `.env.example`) and define:

```ini
MNEMONIC=<wallet mnemonic (server side)>
PRIVATE_KEY=<private key if mnemonic not used>
INFURA_API_KEY=<your Infura project key for Sepolia>
ETHERSCAN_API_KEY=<optional, for contract verification>
KMS_ADDRESS=<Sepolia KMS contract address from Zama docs>
RELAYER_URI=<Relayer URL provided by Zama>
CONTRACT_ADDRESS=<address printed after deploy>
PORT=<server port, e.g. 3001>
```

If Hardhat reports `Invalid mnemonic`, either provide a valid 12 or 24 word
phrase in `MNEMONIC` or delete the variable and use `PRIVATE_KEY` instead.

| Variable | Where to get it |
| --- | --- |
| **MNEMONIC/PRIVATE_KEY** | Export from the wallet that will send transactions on behalf of the server |
| **INFURA_API_KEY** | Create a project at [Infura](https://infura.io/) and copy the key |
| **KMS_ADDRESS** | Address of the Zama KMS contract for Sepolia (see Zama docs) |
| **RELAYER_URI** | URL of the Zama relayer service (e.g. `https://relayer.dev.zama.ai`) |
| **CONTRACT_ADDRESS** | Printed after running the deploy script |
| **ETHERSCAN_API_KEY** | (Optional) API key from [Etherscan](https://etherscan.io/) for verification |
| **PORT** | Port for the Express server |

**Important:** the server uses the mnemonic or private key to sign transactions.
Never commit these credentials to version control or expose them in the
frontend.

3. Compile and test the project:

```bash
npx hardhat compile
npx hardhat test
```

If network restrictions block downloading the Solidity compiler, install `solc` 0.8.24 locally and set the path in `hardhat.config.ts`.

4. Deploy to Sepolia:

```bash
npx hardhat run scripts/deploy.ts --network sepolia
```

Save the printed contract address in `.env` as `CONTRACT_ADDRESS`.

The `test/EncryptedAdder.ts` file demonstrates how to encrypt inputs, call the contract and decrypt the result using the Hardhat FHEVM plugin. For production, a simple backend and frontend are provided in `encrypted-adder/server.ts` and `encrypted-adder/frontend/index.html`.

Run the server with:

```bash
npm run start:server
```

Then open `encrypted-adder/frontend/index.html` in a browser to try the dApp.

## Usage

The demo frontend shows progress through four stages:

1. **Encrypting** – numbers are encrypted in the browser.
2. **Computing** – encrypted values are sent to the contract and the sum is computed.
3. **Decrypting** – the result handle is decrypted via the Relayer service.
4. **Done** – the plaintext sum is displayed.

The *Compute Sum* button becomes disabled during processing to avoid duplicate requests.

You can also perform the same workflow from the command line:

```bash
npm run cli -- 7 5 <yourWalletAddress>
```

The script `scripts/cliCompute.ts` uses the credentials from `.env` to send the
transactions and prints the decrypted sum.

Ensure the following variables are configured in `encrypted-adder/.env`:

```
MNEMONIC or PRIVATE_KEY  – wallet used for transactions and signing
INFURA_API_KEY           – RPC access to Sepolia
KMS_ADDRESS              – Zama KMS contract address
RELAYER_URI              – URL of the Zama relayer
CONTRACT_ADDRESS         – address of the deployed EncryptedAdder
PORT                     – port for the backend server
```

Only the account that calls `computeSum` receives decryption rights because the
contract executes `FHE.allow(latestSum, msg.sender)`. Another user will not be
able to decrypt unless you call `FHE.allow` for their address.
