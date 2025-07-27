import express from 'express';
import cors from 'cors';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const relayer = require('@zama-fhe/relayer-sdk/node');
const { createInstance, SepoliaConfig } = relayer;
import { ethers } from 'ethers';
import dotenv from 'dotenv';

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

let instance: any;

async function init() {
  instance = await createInstance({
    ...SepoliaConfig,
    relayerUrl: process.env.RELAYER_URI,
  });
}
init();

app.post('/encrypt', async (req, res) => {
  const { a, b, userAddress } = req.body;
  try {
    const buffer = instance.createEncryptedInput(process.env.CONTRACT_ADDRESS!, userAddress);
    buffer.add64(Number(a));
    buffer.add64(Number(b));
    const { handles, proof } = await buffer.encrypt();
    res.json({ handleA: handles[0], handleB: handles[1], proof });
  } catch (err: any) {
    res.status(500).json({ error: err.toString() });
  }
});

app.post('/compute', async (req, res) => {
  const { handleA, handleB, proof } = req.body;
  try {
    const provider = new ethers.InfuraProvider('sepolia', process.env.INFURA_API_KEY);
    let wallet: any;
    if (process.env.PRIVATE_KEY) {
      wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
    } else {
      wallet = ethers.Wallet.fromPhrase(process.env.MNEMONIC!).connect(provider);
    }
    const abi = require('../artifacts/contracts/EncryptedAdder.sol/EncryptedAdder.json').abi;
    const contract = new ethers.Contract(process.env.CONTRACT_ADDRESS!, abi, wallet);

    const tx1 = await contract.setInputs(handleA, handleB, proof);
    await tx1.wait();

    const tx2 = await contract.computeSum();
    await tx2.wait();

    const sumHandle = await contract.getLatestSum();
    res.json({ sumHandle });
  } catch (err: any) {
    res.status(500).json({ error: err.toString() });
  }
});

app.post('/decrypt', async (req, res) => {
  const { sumHandle, userAddress, publicKey, privateKey, signature, startTs, durationDays } = req.body;
  try {
    const result = await instance.userDecrypt(
      [{ handle: sumHandle, contractAddress: process.env.CONTRACT_ADDRESS! }],
      Buffer.from(privateKey, 'hex'),
      Buffer.from(publicKey, 'hex'),
      signature,
      [process.env.CONTRACT_ADDRESS!],
      userAddress,
      startTs,
      durationDays
    );
    res.json({ plaintext: result[sumHandle] });
  } catch (err: any) {
    res.status(500).json({ error: err.toString() });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
