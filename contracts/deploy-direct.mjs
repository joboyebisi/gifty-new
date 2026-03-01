import fs from 'fs';
import path from 'path';
import solc from 'solc';
import { ethers } from 'ethers';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function compileContracts() {
    console.log("Compiling RWA Contracts...");

    const fractionalPath = path.join(__dirname, 'src', 'FractionalProperty.sol');
    const savingsPath = path.join(__dirname, 'src', 'SavingsVault.sol');

    const fractionalSource = fs.readFileSync(fractionalPath, 'utf8');
    const savingsSource = fs.readFileSync(savingsPath, 'utf8');

    const input = {
        language: 'Solidity',
        sources: {
            'FractionalProperty.sol': { content: fractionalSource },
            'SavingsVault.sol': { content: savingsSource }
        },
        settings: {
            outputSelection: {
                '*': {
                    '*': ['abi', 'evm.bytecode']
                }
            },
            optimizer: {
                enabled: true,
                runs: 200
            }
        }
    };

    function findImports(importPath) {
        try {
            if (importPath.startsWith('@openzeppelin')) {
                const fullPath = path.resolve(__dirname, 'node_modules', importPath);
                return { contents: fs.readFileSync(fullPath, 'utf8') };
            }
            // Handle common internal OpenZeppelin dependencies:
            if (importPath.includes('Context.sol')) {
                return { contents: fs.readFileSync(path.resolve(__dirname, 'node_modules/@openzeppelin/contracts/utils/Context.sol'), 'utf8') };
            }
            if (importPath.includes('IERC20.sol')) {
                return { contents: fs.readFileSync(path.resolve(__dirname, 'node_modules/@openzeppelin/contracts/token/ERC20/IERC20.sol'), 'utf8') };
            }
            if (importPath.includes('IERC1155.sol') || importPath.includes('IERC165.sol')) {
                // Return empty string for simplistic resolution, or recursively build OpenZeppelin's entire tree.
                // For now, let's just attempt direct read if it falls back here:
                const prefix = path.resolve(__dirname, 'node_modules');
                return { contents: fs.readFileSync(path.join(prefix, importPath), 'utf8') }
            }
            return { error: 'File not found' };
        } catch (e) {
            console.error("Missing import:", importPath)
            return { error: 'File not found: ' + e.message };
        }
    }

    const outputRaw = solc.compile(JSON.stringify(input), { import: findImports });
    const output = JSON.parse(outputRaw);

    if (output.errors) {
        const hasError = output.errors.some(e => e.severity === 'error');
        if (hasError) {
            output.errors.forEach(err => console.error(err.formattedMessage));
            console.error("Compilation failed.");
            process.exit(1);
        }
    }

    return output.contracts;
}

async function main() {
    const contracts = compileContracts();
    console.log("Compilation successful!");

    const FractionalPropertyDef = contracts['FractionalProperty.sol']['FractionalProperty'];
    const SavingsVaultDef = contracts['SavingsVault.sol']['SavingsVault'];

    const provider = new ethers.JsonRpcProvider("https://rpc.testnet.arc.network");

    let rawKey = process.env.PRIVATE_KEY || "";
    const hexMatch = rawKey.match(/[a-fA-F0-9]{64}/);
    if (!hexMatch) {
        console.error("CRITICAL ERROR: Invalid PRIVATE_KEY"); process.exit(1);
    }
    const wallet = new ethers.Wallet("0x" + hexMatch[0], provider);
    const arcTestnetUsdc = "0x3600000000000000000000000000000000000000";

    console.log(`Deploying from account: ${wallet.address}`);

    // 1. Deploy FractionalProperty
    console.log("Deploying FractionalProperty...");
    const fracFactory = new ethers.ContractFactory(FractionalPropertyDef.abi, FractionalPropertyDef.evm.bytecode.object, wallet);
    const fracContract = await fracFactory.deploy(arcTestnetUsdc);
    await fracContract.waitForDeployment();
    const fracAddress = await fracContract.getAddress();
    console.log("✅ FractionalProperty deployed to:", fracAddress);

    // 2. Deploy SavingsVault
    console.log("Deploying SavingsVault...");
    const savingsFactory = new ethers.ContractFactory(SavingsVaultDef.abi, SavingsVaultDef.evm.bytecode.object, wallet);
    const savingsContract = await savingsFactory.deploy(arcTestnetUsdc);
    await savingsContract.waitForDeployment();
    const savingsAddress = await savingsContract.getAddress();
    console.log("✅ SavingsVault deployed to:", savingsAddress);

}

main().catch(console.error);
