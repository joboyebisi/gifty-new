const hre = require("hardhat");

async function main() {
    const arcTestnetUsdc = "0x3600000000000000000000000000000000000000";
    console.log("Deploying EphemeralNotes...");

    const EphemeralNotes = await hre.ethers.getContractFactory("EphemeralNotes");
    const notes = await EphemeralNotes.deploy(arcTestnetUsdc);

    await notes.waitForDeployment();
    const address = await notes.getAddress();

    console.log("EphemeralNotes deployed successfully to:", address);
}

main().catch((error) => {
    console.error("Deployment failed:", error);
    process.exitCode = 1;
});
