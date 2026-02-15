// scripts/deploy.js
const hre = require("hardhat");

async function main() {
    const groupId = 1;

    // 1. Deploy Semaphore Verifier (Mocking if not available or using real one)
    // const SemaphoreVerifier = await hre.ethers.getContractFactory("SemaphoreVerifier");
    // const semaphoreVerifier = await SemaphoreVerifier.deploy();
    // await semaphoreVerifier.waitForDeployment();
    // console.log(`SemaphoreVerifier deployed to ${semaphoreVerifier.target}`);

    // 2. Deploy Semaphore (Mocking address for Amoy Testnet usually)
    // For now, we assume we deploy a new Semaphore.sol or use existing address.
    // Amoy Semaphore Address: 0x... (Look up or deploy mock)
    const semaphoreAddress = "0x1e0d7CCf25b4e1425282Bb339C21bbb286940d96"; // Example Amoy Address

    // 3. Deploy Feedback Contract
    const Feedback = await hre.ethers.getContractFactory("Feedback");
    const feedback = await Feedback.deploy(semaphoreAddress, groupId);

    await feedback.waitForDeployment();

    console.log(`Feedback Contract deployed to ${feedback.target}`);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
