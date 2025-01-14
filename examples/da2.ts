import { EasyCelestia } from "../src";
import { celeniumListBlobsArgs } from "../src";

const celenium = new EasyCelestia({
  network: 'mocha',
  nodeEndpoint: process.env.CELESTIA_NODE_ENDPOINT!,
  nodeApiKey: process.env.CELESTIA_NODE_API_KEY!,
  celeniumApiKey: process.env.CELENIUM_API_KEY!,
});

async function run() {
  console.log("--------------------------------------------\n\n\n\n")
/*
  const data = await celenium.celeniumNamespace('0000000000000000000000000000000000000000b32b8afff6f3dabb');
  console.log(data[0]);

  console.log("\n\n\n\n--------------------------------------------\n\n\n\n")

  const data2 = await celenium.celeniumListBlobsWithFilters(1, 2);
  console.log(data2);

  console.log("\n\n\n\n--------------------------------------------\n\n\n\n")
*/
  //const namespace = "0000000000000000000000000000000000009c22ff5f21f0b81b113e"
  //const id = "iFQ+AAAAAAATzrxPAM+HuXQ23Nc5RUGUIVZEVeRzOfE9Yx8nEHf1/Q==";
  //const idhex = "88543e000000000013cebc4f00cf87b97436dcd73945419421564455e47339f13d631f271077f5fd"
  //const height = 4084872
  //const heightHex = 3e5488
  const commitment = "E868TwDPh7l0NtzXOUVBlCFWRFXkcznxPWMfJxB39f0="
  const commitmentHex = "13cebc4f00cf87b97436dcd73945419421564455e47339f13d631f271077f5fd"
  //const msstring = "test";
  //const data3 = await celenium.get(msstring, id)

  //const data3 = await celenium.celeniumListBlobsWithFiltersFetchBody(10, undefined, "desc", "time", commitment);
  //const data3 = await celenium.celeniumListBlobsWithFiltersFetchBody(10);
  //const data3 = await celenium.celeniumListBlobsWithFiltersFetchBody(10, undefined, undefined, undefined, undefined, undefined, undefined, "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAgFQ=");
  
  const args : celeniumListBlobsArgs = {
    limit: 10
  }

  const data3 = await celenium.celeniumListBlobsWithFilters(args);
  
  
  
  console.log(data3);

  console.log("\n\n\n\n--------------------------------------------")
}

run().catch((err) => {
  console.trace(err);
  process.exit(1);
});
