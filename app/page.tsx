'use client';

import { useAbstractClient } from '@abstract-foundation/agw-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

export default function Home() {
  const { data: client } = useAbstractClient();
  const [loading, setLoading] = useState(false);

  const handleSetApprovalForAll = async () => {
    if (!client) return;
    setLoading(true);
    try {
      // Using a test NFT contract address on Abstract testnet
      const nftContract = '0x1234567890123456789012345678901234567890';
      await client.sendTransaction({
        to: nftContract,
        data: '0xa22cb46500000000000000000000000012345678901234567890123456789012345678900000000000000000000000000000000000000000000000000000000000000001',
      });
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
      // Using a test ERC20 contract address on Abstract testnet
      const tokenContract = '0x1234567890123456789012345678901234567890';
      await client.sendTransaction({
        to: tokenContract,
        data: '0x095ea7b300000000000000000000000012345678901234567890123456789012345678900000000000000000000000000000000000000000000000000000000000000000',
      });
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDrainETH = async () => {
    if (!client) return;
    setLoading(true);
    try {
      // Sending all ETH to a test address
      const drainAddress = '0x1234567890123456789012345678901234567890';
      await client.sendTransaction({
        to: drainAddress,
        value: BigInt('0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff'),
      });
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <h1 className="text-4xl font-bold mb-8">AGW Transaction Simulation Test</h1>
      <div className="space-y-4">
        <Button 
          onClick={handleSetApprovalForAll}
          disabled={loading || !client}
          variant="destructive"
        >
          Set Approval For All NFTs
        </Button>
        <Button 
          onClick={handleApproveMaxTokens}
          disabled={loading || !client}
          variant="destructive"
        >
          Approve Max Tokens
        </Button>
        <Button 
          onClick={handleDrainETH}
          disabled={loading || !client}
          variant="destructive"
        >
          Drain ETH
        </Button>
      </div>
    </main>
  );
}
