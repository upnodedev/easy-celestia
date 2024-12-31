import { EasyCelestia } from "../src";

const celestia = new EasyCelestia({
  network: 'mocha',
  nodeEndpoint: process.env.CELESTIA_NODE_ENDPOINT!,
  nodeApiKey: process.env.CELESTIA_NODE_API_KEY!,
});

async function run() {
  console.log('Namespace:', celestia.namespace('test').toString('hex'))

  const id = await celestia.submit("test", { hello: "world" });
  console.log('ID:', id)

  {
    const data = await celestia.get('test', id)
    console.log(data[0])
  }

  const ids = await celestia.submitBatch("test", [
    { hello: 1 },
    { hello: 2 },
    { hello: 3 },
  ]);
  console.log('Batch IDs:', ids)

  {
    const data = await celestia.get('test', ids)
    console.log(data)
  }
}

run().catch((err) => {
  console.trace(err);
  process.exit(1);
});
