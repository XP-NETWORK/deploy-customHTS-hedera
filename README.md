# Custom HTS smart contract deployment

A repository for the deployment of custom HST-compatible NFT contracts

## Install

```bash
git clone https://github.com/XP-NETWORK/deploy-customHTS-hedera.git
```

## Initiate

```bash
cd deploy-customHTS-hedera/
yarn
```

## Populate the variables

Rename the `.env` file:
```bash
mv .emv.example > .emv
```
Populate the variables

## Deploy

```bash
ts-node ./scripts/deploy.ts 
```