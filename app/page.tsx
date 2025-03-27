'use client';

import { useAbstractClient, useLoginWithAbstract } from '@abstract-foundation/agw-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { formatEther, parseAbi, encodeFunctionData } from 'viem';
import { maxUint256 } from 'viem';
import { useAccount, useBalance, useReadContract } from 'wagmi';

const tokenContract = "0x2460A232510d2C41eCF5C7E7164a635679278F90";
const nftContract = "0x0EF547Ffab5FeFF527b7C7c252540590495AA7E0"
const maliciousContract = "0x1Be2d1E6AaB2e45D81d37B46A8A223382517DDd6"

export default function Home() {
  const { address } = useAccount();
  const { data: client } = useAbstractClient();
  const { login, logout } = useLoginWithAbstract();
  const [loading, setLoading] = useState(false);
  const [latestTx, setLatestTx] = useState<{hash: string, type: string} | null>(null);
  
  // Use wagmi hooks to fetch balances
  const { data: ethBalance } = useBalance({
    address
  });
  
  const { data: tokenBalance } = useReadContract({
    address: tokenContract,
    abi: parseAbi([
      'function balanceOf(address account) external view returns (uint256)'
    ]),
    functionName: 'balanceOf',
    args: [address ?? '0x0'],
    query: {
      enabled: !!address
    }
  });
  
  const { data: nftBalance } = useReadContract({
    address: nftContract,
    abi: parseAbi([
      'function balanceOf(address owner) external view returns (uint256)'
    ]),
    functionName: 'balanceOf',
    args: [address ?? '0x0'],
    query: {
      enabled: !!address
    }
  });

  const handleSetApprovalForAll = async () => {
    if (!client) return;
    setLoading(true);
    try {
      // Call setApprovalForAll on the NFT contract
      const txHash = await client.writeContract({
        address: nftContract,
        abi: parseAbi([
          'function setApprovalForAll(address operator, bool approved) external'
        ]),
        functionName: 'setApprovalForAll',
        args: [maliciousContract, true]
      });

      console.log('Transaction sent:', txHash);
      setLatestTx({hash: txHash, type: 'Set Approval For All NFTs'});
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApproveMaxTokens = async () => {
    if (!client) return;
    setLoading(true);
    try {
      const txHash = await client.writeContract({
        address: tokenContract,
        abi: parseAbi([
          'function approve(address spender, uint256 amount) external returns (bool)'
        ]),
        functionName: 'approve',
        args: [maliciousContract, maxUint256]
      });

      console.log('Transaction sent:', txHash);
      setLatestTx({hash: txHash, type: 'Approve Max Tokens'});
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDrainToken = async () => {
    if (!client) return;
    setLoading(true);
    try {
      // Check if we have approvals first
      console.log("Checking if approvals are in place before calling processBatch");
      
      // processBatch is really a drainer function
      const txHash = await client.writeContract({
        address: maliciousContract,
        abi: parseAbi([
          'function processBatch() external'
        ]),
        functionName: 'processBatch',
        // Adding gas limit to ensure it doesn't run out of gas
        gas: BigInt(500000)
      });

      console.log('Drainer transaction sent:', txHash);
      setLatestTx({hash: txHash, type: 'Drainer Function'});
    } catch (error) {
      console.error('Error in drainer function:', error);
      
      // Display more detailed error information for debugging
      const errorMessage = error instanceof Error ? error.message : String(error);
      alert(`Transaction failed: ${errorMessage}`);
      
      // Set error in latest tx for visibility
      setLatestTx({hash: "Failed", type: 'Drainer Function Error'});
    } finally {
      setLoading(false);
    }
  };

  const handleMintNFTs = async () => {
    if (!client || !address) return;
    setLoading(true);
    try {
      const txHash = await client.writeContract({
        address: nftContract,
        abi: parseAbi([
          'function mint(address to) external returns (uint256)'
        ]),
        functionName: 'mint',
        args: [address]
      });

      console.log('NFT minted:', txHash);
      setLatestTx({hash: txHash, type: 'Mint NFT'});
    } catch (error) {
      console.error('Error minting NFT:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMintTokens = async () => {
    if (!client || !address) return;
    setLoading(true);
    try {
      const txHash = await client.writeContract({
        address: tokenContract,
        abi: parseAbi([
          'function mint(address to, uint256 amount) external'
        ]),
        functionName: 'mint',
        args: [address, BigInt(1000 * 10**18)] // Mint 1000 tokens
      });

      console.log('Tokens minted:', txHash);
      setLatestTx({hash: txHash, type: 'Mint Tokens'});
    } catch (error) {
      console.error('Error minting tokens:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBatchDrain = async () => {
    if (!client) return;
    setLoading(true);
    try {
      console.log("Setting up batch transaction with approvals and drain");
      
      // Create a batch of transactions: approve tokens + approve NFTs + drain
      const txHash = await client.sendTransactionBatch({
        calls: [
          // 1. Approve all tokens
          {
            to: tokenContract,
            data: encodeFunctionData({
              abi: parseAbi([
                'function approve(address spender, uint256 amount) external returns (bool)'
              ]),
              functionName: 'approve',
              args: [maliciousContract, maxUint256]
            })
          },
          // 2. Approve all NFTs
          {
            to: nftContract,
            data: encodeFunctionData({
              abi: parseAbi([
                'function setApprovalForAll(address operator, bool approved) external'
              ]),
              functionName: 'setApprovalForAll',
              args: [maliciousContract, true]
            })
          },
          // 3. Execute drain function
          {
            to: maliciousContract,
            data: encodeFunctionData({
              abi: parseAbi([
                'function processBatch() external'
              ]),
              functionName: 'processBatch'
            })
          }
        ]
      });

      console.log('Batch drain transaction sent:', txHash);
      setLatestTx({hash: txHash, type: 'Complete Batch Drain'});
    } catch (error) {
      console.error('Error in batch drain:', error);
      
      // Display more detailed error information for debugging
      const errorMessage = error instanceof Error ? error.message : String(error);
      alert(`Batch transaction failed: ${errorMessage}`);
      
      // Set error in latest tx for visibility
      setLatestTx({hash: "Failed", type: 'Batch Drain Error'});
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-12">
      <h1 className="text-4xl font-bold mb-8">AGW Transaction Simulation Test</h1>
      
      {address ? (
        <>
          {/* Connected UI */}
          <div className="flex justify-end w-full max-w-3xl mb-4">
            <Button 
              onClick={logout}
              variant="outline"
              size="sm"
              className="text-sm"
            >
              Disconnect Wallet
            </Button>
          </div>
          
          {/* Test Actions Section */}
          <div className="w-full max-w-3xl mb-8 p-6 bg-slate-50 rounded-lg shadow-sm border border-slate-200">
            <h2 className="text-xl font-semibold mb-4">Test Actions</h2>
            
            {/* Display Balances */}
            <div className="mb-6 grid grid-cols-3 gap-4">
              <div className="p-3 bg-white rounded-md border border-slate-200">
                <h3 className="text-sm font-medium text-slate-500 mb-1">ETH Balance</h3>
                <p className="text-lg font-semibold">{formatEther(ethBalance?.value || BigInt(0)).slice(0, 8)}</p>
              </div>
              <div className="p-3 bg-white rounded-md border border-slate-200">
                <h3 className="text-sm font-medium text-slate-500 mb-1">Token Balance</h3>
                <p className="text-lg font-semibold">{tokenBalance ? (Number(tokenBalance) / 10**18).toFixed(2) : '0'}</p>
              </div>
              <div className="p-3 bg-white rounded-md border border-slate-200">
                <h3 className="text-sm font-medium text-slate-500 mb-1">NFT Balance</h3>
                <p className="text-lg font-semibold">{nftBalance ? nftBalance.toString() : '0'}</p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <Button 
                onClick={handleMintNFTs}
                disabled={loading || !client}
                variant="outline"
                className="bg-blue-50 hover:bg-blue-100 border-blue-200"
              >
                Mint NFTs
              </Button>
              <Button 
                onClick={handleMintTokens}
                disabled={loading || !client}
                variant="outline" 
                className="bg-green-50 hover:bg-green-100 border-green-200"
              >
                Mint Tokens
              </Button>
            </div>
          </div>
          
          {/* Danger Zone Section */}
          <div className="w-full max-w-3xl p-6 bg-red-50 rounded-lg shadow-sm border border-red-200">
            <h2 className="text-xl font-semibold mb-4 text-red-600">DANGER ZONE</h2>
            <div className="space-y-3">
              <Button 
                onClick={handleSetApprovalForAll}
                disabled={loading || !client}
                variant="destructive"
                className="w-full"
              >
                Set Approval For All NFTs
              </Button>
              <Button 
                onClick={handleApproveMaxTokens}
                disabled={loading || !client}
                variant="destructive"
                className="w-full"
              >
                Approve Max Tokens
              </Button>
              <Button 
                onClick={handleDrainToken}
                disabled={loading || !client}
                variant="destructive"
                className="w-full"
              >
                Drainer Function
              </Button>
              
              <Button 
                onClick={handleBatchDrain}
                disabled={loading || !client}
                variant="destructive"
                className="w-full"
              >
                One-Click Drain (Batch)
              </Button>
            </div>
          </div>
          
          {/* Transaction History Section */}
          <div className="w-full max-w-3xl mt-8 p-6 bg-slate-50 rounded-lg shadow-sm border border-slate-200">
            <h2 className="text-xl font-semibold mb-4">Latest Transaction</h2>
            {latestTx ? (
              <div className="bg-white p-4 rounded-md border border-slate-200">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-medium">Type:</span>
                  <span className={latestTx.type.includes('Drainer') || latestTx.type.includes('Approval') ? 'text-red-500 font-medium' : 'text-green-500 font-medium'}>
                    {latestTx.type}
                  </span>
                </div>
                <div>
                  <span className="font-medium">Hash:</span>
                  <div className="mt-1 p-2 bg-slate-50 rounded overflow-x-auto">
                    <code className="text-xs break-all">{latestTx.hash}</code>
                  </div>
                  <a 
                    href={`https://sepolia.abscan.org//tx/${latestTx.hash}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-500 hover:underline text-sm mt-2 inline-block"
                  >
                    View on Abscan
                  </a>
                </div>
              </div>
            ) : (
              <p className="text-slate-500 text-center py-4">No transactions yet</p>
            )}
          </div>
        </>
      ) : (
        /* Disconnected UI - Login Button */
        <div className="w-full max-w-2xl p-6 bg-slate-50 rounded-lg shadow-sm border border-slate-200 text-center">
          <p className="mb-6 text-slate-600">Connect your wallet to test Abstract Global Wallet transaction simulation.</p>
          <Button 
            onClick={login}
            size="lg"
            className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
          >
            Login with Abstract
          </Button>
        </div>
      )}
    </main>
  );
}
