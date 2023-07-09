// External imports
import { parseUnits } from "@hashgraph/hethers/lib/utils";
import { hethers, Wallet } from "@hashgraph/hethers";
import { config } from "dotenv"; config();
// Local imports
import { XPNftHts__factory } from "../factories/XPNftHts__factory";
import { XPNftHtsClaims__factory } from "../factories/XPNftHtsClaims__factory";
import { ERC721RoyaltiesCollection__factory } from "../ERC721RoyaltiesCollection__factory";


// GLOBALS (constants & variables)
const CONTRACTS = {
    XPNftHts: XPNftHts__factory,
    XPNftHtsClaims: XPNftHtsClaims__factory,
    ERC721RoyaltiesCollection: ERC721RoyaltiesCollection__factory
};

async function deploy<T extends unknown[]>(
    contractType: keyof typeof CONTRACTS,
    wallet: Wallet,
    ...args: T
): Promise<any> {
    const cf = CONTRACTS[contractType];
    const Contract = new hethers.ContractFactory(cf.abi, cf.bytecode, wallet);

    console.log(`Deploying ${contractType}..`);
    const contract = await Contract.deploy(...args, {
        gasLimit: 1000000,
    });

    await contract.deployed();
    console.log(`${contractType} deployed to: ${contract.address} TX hash: ${contract.deployTransaction.hash}`);

    return contract;
}
