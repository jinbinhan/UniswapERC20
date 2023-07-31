// This file stores web3 related constants such as addresses, token definitions, ETH currency references and ABI's

import {ChainId, Token } from '@uniswap/sdk-core'

// Addresses

export const POOL_FACTORY_CONTRACT_ADDRESS =
  '0x1bA25a297Ad287BA469Cf6A713D19Df981c75436'
export const QUOTER_CONTRACT_ADDRESS =
  '0x1caF4d20a873979AE44a448cE98578E1EeD1c7B0'
export const SWAP_ROUTER_ADDRESS = '0xE71CFbaCf079A470915aA96bF7236fC0c0C7B1f8'
export const WETH_CONTRACT_ADDRESS =
  '0x77e039B65216aFED16A6b0133D334e0C03eb439c'

// Currencies and Tokens

export const WETH_TOKEN = new Token(
  ChainId.MAINNET,
  '0xcF9A7ED0070A471A8e289328704B2a1F6A35DFd2',
  18,
  'LETH',
  'LinEther'
)

export const USDC_TOKEN = new Token(
  ChainId.MAINNET,
  '0xE71d0c41973Ec3f273Db135e3eeA2666f63a9cd3',
  18,
  'SETH',
  'SaitEther'
)

// ABI's

export const ERC20_ABI = [
  // Read-Only Functions
  'function balanceOf(address owner) view returns (uint256)',
  'function decimals() view returns (uint8)',
  'function symbol() view returns (string)',

  // Authenticated Functions
  'function transfer(address to, uint amount) returns (bool)',
  'function approve(address _spender, uint256 _value) returns (bool)',

  // Events
  'event Transfer(address indexed from, address indexed to, uint amount)',
]

export const WETH_ABI = [
  // Wrap ETH
  'function deposit() payable',

  // Unwrap ETH
  'function withdraw(uint wad) public',
]

// Transactions

export const MAX_FEE_PER_GAS = 100000000000
export const MAX_PRIORITY_FEE_PER_GAS = 100000000000
export const TOKEN_AMOUNT_TO_APPROVE_FOR_TRANSFER = 2000000000000000000