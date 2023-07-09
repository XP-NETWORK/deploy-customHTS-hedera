// External imports
import { parseUnits } from "@hashgraph/hethers/lib/utils";
import { hethers, Wallet } from "@hashgraph/hethers";
import { config } from "dotenv"; config();
// Local imports
import { XPNftHts__factory } from "../factories/XPNftHts__factory";
import { XPNftHtsClaims__factory } from "../factories/XPNftHtsClaims__factory";
import { ERC721RoyaltiesCollection__factory } from "../factories/ERC721RoyaltiesCollection__factory";


// GLOBALS (constants & variables)
const CONTRACTS = {
    XPNftHts: XPNftHts__factory,
    XPNftHtsClaims: XPNftHtsClaims__factory,
    ERC721RoyaltiesCollection: ERC721RoyaltiesCollection__factory
};

type ContractType = keyof typeof CONTRACTS;

/**
 * 
 * @param contractType "XPNftHts" | "XPNftHtsClaims" | "ERC721RoyaltiesCollection"
 * @param signer Hedera signer object
 * @param args constructor arguments
 * @returns deployed Hethers Contract
 */
async function deploy<T extends unknown[]>(
    contractType: ContractType,
    signer: Wallet,
    ...args: T
): Promise<hethers.Contract> {
    const cf = CONTRACTS[contractType];
    const Contract = new hethers.ContractFactory(cf.abi, cf.bytecode, signer);

    console.log(`Deploying ${contractType}...`);
    const contract = await Contract.deploy(...args, {
        gasLimit: 1000000,
    });

    await contract.deployed();
    console.log(`${contractType} deployed to: ${contract.address} TX hash: ${contract.deployTransaction.hash}`);

    return contract;
}

/**
 * Retrieved the .env variables
 * @returns Hedera signer object
 */
const getSigner = (): hethers.Wallet => {

    const provider = hethers.getDefaultProvider("mainnet");

    const signer = new Wallet(
        {
            privateKey: process.env.SK!,
            account: process.env.HEDERA_PK!,
            isED25519Type: true,
        } as any,
        provider,
    );

    return signer;
}

async function main(
    minterAddress: string,
    feeCollectoraddress: string,
    collectionName: string,
    symbol: string,
    baseUrl: string,
    royalty: number
) {
    const signer = getSigner();

    // 1. Deploy XPNFT
    const xpNftHts = await deploy("XPNftHts", signer);

    // 2. Deploy ClaimContract
    if (xpNftHts && xpNftHts.address) {
        const claimsContract = await deploy("XPNftHtsClaims", signer, xpNftHts.address);

        if (claimsContract && claimsContract.address) {
            // 3. Initiate XPNFT
            const res = await xpNftHts.functions.initialize(
                collectionName,         // collection name
                symbol,                 //symbol
                baseUrl,                //base url
                claimsContract.address, // claimables nfts records
                royalty,                // royalty fee numenator
                100,                    // royalty fee
                feeCollectoraddress,    // royalty fee collector
                royalty,                // fixed fee amount
                feeCollectoraddress,    // fixed fee collector
                {
                    gasLimit: 3000000,
                    value: parseUnits("50.0")
                }
            );
            console.log("initialized", await res?.wait());

            // 4. Pass ownership
            const res_ = await xpNftHts.functions.transferOwnership(minterAddress, { gasLimit: 3000000, });
            console.log("Ownership transfered", await res_?.wait());

        }else {
            console.error("Error: the claimsContract was not deployed properly");
            process.exit(2);
        }

    }else {
        console.error("Error: the XpNftHTS was not deployed properly");
        process.exit(1);
    }
}

(async () => {

    const bridgeAddress:string = process.env.BRIDGE!;
    const feeCollectoraddress:string = process.env.FEE_COLLECTOR!;

    const name:string = process.env.NAME!
    const symbol:string = process.env.SYMBOL!
    const baseUrl:string = process.env.BASE_URL!
    const royalty:number = parseInt(process.env.ROYALTY!)

    await main(
        bridgeAddress,
        feeCollectoraddress,
        name,
        symbol,
        baseUrl,
        royalty
    )
    process.exit(0);
})().catch(e => {
    console.error(e);
    process.exit(3);
});