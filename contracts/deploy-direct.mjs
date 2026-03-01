import fs from 'fs';
import path from 'path';
import solc from 'solc';
import { ethers } from 'ethers';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function main() {
    console.log("Compiling EphemeralNotes.sol...");

    const contractPath = path.join(__dirname, 'src', 'EphemeralNotes.sol');
    const contractSource = fs.readFileSync(contractPath, 'utf8');

    // Configure solc input
    const input = {
        language: 'Solidity',
        sources: {
            'EphemeralNotes.sol': {
                content: contractSource,
            },
        },
        settings: {
            outputSelection: {
                '*': {
                    '*': ['abi', 'evm.bytecode'],
                },
            },
            optimizer: {
                enabled: true,
                runs: 200
            }
        },
    };

    // Import callback for resolving OpenZeppelin contracts
    function findImports(importPath) {
        try {
            if (importPath.startsWith('@openzeppelin')) {
                const fullPath = path.resolve(__dirname, 'node_modules', importPath);
                return { contents: fs.readFileSync(fullPath, 'utf8') };
            }
            // Handle relative imports from within OpenZeppelin (like Ownable importing Context)
            if (importPath.includes('Context.sol')) {
                const fullPath = path.resolve(__dirname, 'node_modules/@openzeppelin/contracts/utils/Context.sol');
                return { contents: fs.readFileSync(fullPath, 'utf8') };
            }
            return { error: 'File not found' };
        } catch (e) {
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

    const contractFile = output.contracts['EphemeralNotes.sol'];
    const EphemeralNotes = contractFile['EphemeralNotes'];

    const abi = EphemeralNotes.abi;
    const bytecode = EphemeralNotes.evm.bytecode.object;

    console.log("Compilation successful! Deploying to Circle Arc... this may take 10-20 seconds.");

    const provider = new ethers.JsonRpcProvider("https://rpc.testnet.arc.network");

    let rawKey = process.env.PRIVATE_KEY || "";
    const hexMatch = rawKey.match(/[a-fA-F0-9]{64}/);
    if (!hexMatch) {
        console.error("CRITICAL ERROR: No valid 64-character hex private key found in .env.");
        console.error("Please ensure the PRIVATE_KEY string contains the 64 hexadecimal characters.");
        process.exit(1);
    }
    rawKey = "0x" + hexMatch[0];

    const wallet = new ethers.Wallet(rawKey, provider);

    const factory = new ethers.ContractFactory(abi, bytecode, wallet);

    const arcTestnetUsdc = "0x3600000000000000000000000000000000000000";

    const contract = await factory.deploy(arcTestnetUsdc);
    await contract.waitForDeployment();

    const address = await contract.getAddress();
    console.log("==================================================");
    console.log("✅ EphemeralNotes deployed successfully to:", address);
    console.log("==================================================");
}

main().catch(console.error);
