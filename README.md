# Telegrab_BOT4

This repository contains an example dApp demonstrating encrypted computation on Ethereum using the **FHEVM** protocol. The `encrypted-adder` folder holds a Hardhat project with the `EncryptedAdder` smart contract.

## Quick start

1. Install Node.js (v20 recommended) and run the dependency installation:

```bash
cd encrypted-adder
npm install
```

2. Create `.env` inside `encrypted-adder` with the following variables:

```ini
MNEMONIC=<your hd wallet mnemonic or leave empty and use PRIVATE_KEY>
PRIVATE_KEY=<private key if mnemonic not used>
INFURA_API_KEY=<Infura project key for Sepolia RPC>
ETHERSCAN_API_KEY=<optional, for contract verification>
KMS_ADDRESS=<Zama KMS contract address for Sepolia>
RELAYER_URI=<Zama relayer URL, e.g. https://relayer.dev.zama.ai>
CONTRACT_ADDRESS=<address of the deployed EncryptedAdder>
```

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
