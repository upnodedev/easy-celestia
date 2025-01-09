import { EasyCelestia } from "../src";

const celenium = new EasyCelestia({
  network: 'mocha',
  nodeEndpoint: process.env.CELESTIA_NODE_ENDPOINT!,
  nodeApiKey: process.env.CELESTIA_NODE_API_KEY!,
  celeniumApiKey: 'IT7mVwPbldtBYM6ij63avJUXUXiCSVtT',
});

async function run() {
  let ret = celenium.celeniumNamespace('0000000000000000000000000000000000000000b32b8afff6f3dabb');
  console.log(ret);
}

run().catch((err) => {
  console.trace(err);
  process.exit(1);
});
