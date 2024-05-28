const { ethers } = require('ethers');

// Replace with the appropriate RPC URL
const L1_RPC_URL = 'https://mainnet.infura.io/v3/aadc22162a4e489a9fe14555f592888d';
const L2_RPC_URL = 'https://linea.infura.io/v3/aadc22162a4e489a9fe14555f592888d';

// Initialize providers
const l1Provider = new ethers.providers.JsonRpcProvider(L1_RPC_URL);
const l2Provider = new ethers.providers.JsonRpcProvider(L2_RPC_URL);

// Transaction hash to investigate (replace with actual hash, not URL)
const txHash = '0x2060c69f0c5ce096a8025ca158551c856d2d8ee3b0b51646264c10b43776e8bf';

async function getMessageFromTransfer() {
    try {
        // Fetch the transaction receipt from L1
        const receipt = await l1Provider.getTransactionReceipt(txHash);

        if (!receipt) {
            console.error('Transaction receipt not found');
            return;
        }

        // ABI for the MessageSent event
        const iface = new ethers.utils.Interface([
            "event MessageSent(address indexed sender, address indexed destination, uint256 fee, uint256 value, uint256 messageNonce, bytes calldata, bytes32 messageHash)"
        ]);

        // Filter logs for MessageSent event
        const messageSentEvent = receipt.logs.map(log => {
            try {
                return iface.parseLog(log);
            } catch (error) {
                return null;
            }
        }).find(parsedLog => parsedLog && parsedLog.name === 'MessageSent');

        if (!messageSentEvent) {
            console.error('MessageSent event not found in transaction receipt');
            return;
        }

        // Extract event parameters
        const { sender, destination, fee, value, messageNonce, calldata, messageHash } = messageSentEvent.args;

        // Log the extracted information
        console.log('Sender:', sender);
        console.log('Destination:', destination);
        console.log('Fee:', ethers.utils.formatEther(fee));
        console.log('Value:', ethers.utils.formatEther(value));
        console.log('MessageNonce:', messageNonce.toString());
        console.log('Calldata:', calldata);
        console.log('MessageHash:', messageHash);
    } catch (error) {
        console.error('Error:', error);
    }
}

getMessageFromTransfer().catch(console.error);
