import { ethers } from "hardhat";

async function main() {
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
