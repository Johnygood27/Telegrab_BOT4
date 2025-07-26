import { ethers } from "hardhat";

function checkInfura() {
  const key = process.env.INFURA_API_KEY || "";
  if (key.trim().length !== 32) {
    throw new Error("Invalid INFURA_API_KEY in .env");
  }
}

async function main() {
  checkInfura();
  const [deployer] = await ethers.getSigners();
  console.log("Deploying with account:", await deployer.getAddress());

  const factory = await ethers.getContractFactory("EncryptedAdder");
  const contract = await factory.deploy();
  await contract.waitForDeployment();

  console.log("EncryptedAdder deployed to:", await contract.getAddress());
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
