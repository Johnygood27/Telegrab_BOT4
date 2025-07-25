import express from 'express';
import cors from 'cors';
import { initSDK, createInstance, SepoliaConfig } from '@zama-fhe/relayer-sdk';
import { ethers } from 'ethers';
import dotenv from 'dotenv';

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

let instance: any;

async function init() {
  await initSDK();
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
  const { handleA, handleB, proof, signerPrivateKey } = req.body;
  try {
    const provider = new ethers.InfuraProvider('sepolia', process.env.INFURA_API_KEY);
    const wallet = new ethers.Wallet(signerPrivateKey, provider);
    const abi = require('./artifacts/contracts/EncryptedAdder.sol/EncryptedAdder.json').abi;
    const contract = new ethers.Contract(process.env.CONTRACT_ADDRESS!, abi, wallet);

    const tx1 = await contract.setInputs(handleA, handleB, proof);
    await tx1.wait();

    const tx2 = await contract.computeSum();
    await tx2.wait();

    const sumHandle = await contract.latestSum();
    res.json({ sumHandle });
  } catch (err: any) {
    res.status(500).json({ error: err.toString() });
  }
});

app.post('/decrypt', async (req, res) => {
  const { sumHandle, userAddress } = req.body;
  try {
    const keypair = instance.generateKeypair();
    const startTs = Math.floor(Date.now() / 1000);
    const durationDays = 365;
    const eip712 = instance.createEIP712(keypair.publicKey, [process.env.CONTRACT_ADDRESS], startTs, durationDays);
    const dummySignature = '0x';

    const result = await instance.userDecrypt(
      [{ handle: sumHandle, contractAddress: process.env.CONTRACT_ADDRESS }],
      keypair.privateKey,
      keypair.publicKey,
      dummySignature,
      [process.env.CONTRACT_ADDRESS],
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
