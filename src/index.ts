import keccak256 from "keccak256";
import { CeleniumClient } from "./clients/celenium";
import { CelestiaNodeClient } from "./clients/celestia";
import { CelestiaRPCClient } from "./clients/rpc";
import { EasyCelestiaChain, EasyCelestiaOptions } from "./types/EasyCelestia";
import { toBytes } from "./utils";
import { json } from "stream/consumers";
require('dotenv').config()

const DEFAULT_RPC: Record<EasyCelestiaChain, string> = {
  mainnet: "https://rpc.celestia.pops.one",
  mocha: "https://rpc-mocha.pops.one",
};

const DEFAULT_CELENIUM_ENDPOINT: Record<EasyCelestiaChain, string> = {
  mainnet: "https://api-mainnet.celenium.io/v1",
  mocha: "https://api-mocha.celenium.io/v1",
};

export enum sortOrder {
  asc = "asc",
  desc = "desc",
}
export enum sortField {
  time = "time",
  size = "size",
}

export interface CeleniumListBlobsArgs {
  limit?: number
  offset?: number
  sort?: sortOrder, 
  sort_by?: sortField,
  commitment?: string,
  from?: number,
  to?: number, 
  namespaces?: string | string[],
  signers?: string | string[],
  cursor?: number
}

export class EasyCelestia {
  nodeClient: CelestiaNodeClient;
  rpcClient: CelestiaRPCClient;
  celeniumClient: CeleniumClient;

  constructor(options: EasyCelestiaOptions) {
    const network = options.network || "mocha";
    this.nodeClient = new CelestiaNodeClient(
      options.nodeEndpoint,
      options.nodeApiKey
    );
    this.rpcClient = new CelestiaRPCClient(
      options.rpcEndpoint || DEFAULT_RPC[network]
    );
    this.celeniumClient = new CeleniumClient(
      options.celeniumEndpoint || DEFAULT_CELENIUM_ENDPOINT[network], options.celeniumApiKey
    );
  }

  namespace(namespace: string | Uint8Array): Buffer {
    if (typeof namespace === "string") {
      if (namespace.startsWith("0x")) {
        return Buffer.from(toBytes(namespace));
      } else {
        const ns = new Uint8Array(29);
        const hash = Uint8Array.prototype.slice.call(keccak256(namespace), 0, 10);
        ns.set(hash, 29 - hash.length);
        return Buffer.from(ns)
      }
    } else {
      return Buffer.from(namespace);
    }
  }

  printEnvVars(){
    const vars : string[] = [process.env.CELESTIA_NODE_ENDPOINT!, 
      process.env.CELESTIA_NODE_API_KEY!,
      process.env.CELENIUM_API_KEY!];
    return vars;
  }

  /**
   * Retrieves the info from the given namespace.
   * @param namespace - The namespace under which the blob exists.
   * @returns - JSON object of the namespace info.
   */
  async celeniumNamespace(namespace: string | Uint8Array){
    return await this.celeniumClient.get("/namespace/"+namespace);
  }

  /**
   * Retrieves blobs based on the params (a celeniumListBlobsArgs object).
   * @param limit - The number of blobs to return.
   * @param offset - The offset
   * @param sort - The sort order (asc/desc)
   * @param sort_by - The sort field (time/size). If empty, internal id is used
   * @param commitment - Commitment value in URLbase64 format
   * @param from - Time from in unix timestamp
   * @param to - Time to in unix timestamp
   * @param namespaces - Comma-separated celestia namespaces
   * @param signers - Comma-separated celestia addresses
   * @param cursor - Last entity id which is used for cursor pagination
   * @returns - JSON object containing a list of the returned blobs.
   */
  async celeniumListBlobsWithFilters(params: CeleniumListBlobsArgs){
    //if there exists some namespace argument
    if(params.namespaces && params.namespaces.length > 0){
      //initialise "ns"
      let ns = "";
      //is our arg array or string?
      if(!Array.isArray(params.namespaces)){
        //string
        ns = params.namespaces;
      } else {
        //array = 1
        ns = params.namespaces[0];
        //array > 1
        if(params.namespaces.length > 1){
          for(let i=1; i<params.namespaces.length; i++){
            ns+=(","+[params.namespaces[i]])
          }
        }
      }
    }

    //if there exists some signer argument
    if(params.signers && params.signers.length > 0){
      //initialise "si"
      let si = "";
      //is our arg array or string?
      if(!Array.isArray(params.signers)){
        //string
        si = params.signers;
      } else {
        //array = 1
        si = params.signers[0];
        //array > 1
        if(params.signers.length > 1){
          for(let i=1; i<params.signers.length; i++){
            si+=(","+[params.signers[i]])
          }
        }
      }
    }

    //console.log(params.namespaces);
    //console.log(params.signers);

    //Add filters to record
    var intermediary = [];
    for(let key in params) intermediary.push([key, (params as any)[key]])
    var filtersRecord : Record<string, string> = Object.fromEntries(intermediary);

    //console.log(filtersRecord);

    //Return result
    return await this.celeniumClient.get("/blob", filtersRecord); //todo add args
  }

  /**
   * Retrieves blob bodies based on the params (a CeleniumListBlobsArgs object).
   * @param limit - The number of blobs to return.
   * @param offset - The offset
   * @param sort - The sort order (asc/desc)
   * @param sort_by - The sort field (time/size). If empty, internal id is used
   * @param commitment - Commitment value in URLbase64 format
   * @param from - Time from in unix timestamp
   * @param to - Time to in unix timestamp
   * @param namespaces - Comma-separated celestia namespaces
   * @param signers - Comma-separated celestia addresses
   * @param cursor - Last entity id which is used for cursor pagination
   * @returns - JSON object containing a list of the returned blobs.
   */
  async celeniumListBlobsWithFiltersFetchBody( params: CeleniumListBlobsArgs /*...rawArgs: any[]*/){

    //if there exists some namespace argument
    if(params.namespaces && params.namespaces.length > 0){
      //initialise "ns"
      let ns = "";
      //is our arg array or string?
      if(!Array.isArray(params.namespaces)){
        //string
        ns = params.namespaces;
      } else {
        //array = 1
        ns = params.namespaces[0];
        //array > 1
        if(params.namespaces.length > 1){
          for(let i=1; i<params.namespaces.length; i++){
            ns+=(","+[params.namespaces[i]])
          }
        }
      }
    }

    //if there exists some signer argument
    if(params.signers && params.signers.length > 0){
      //initialise "si"
      let si = "";
      //is our arg array or string?
      if(!Array.isArray(params.signers)){
        //string
        si = params.signers;
      } else {
        //array = 1
        si = params.signers[0];
        //array > 1
        if(params.signers.length > 1){
          for(let i=1; i<params.signers.length; i++){
            si+=(","+[params.signers[i]])
          }
        }
      }
    }

    //console.log(params.namespaces);
    //console.log(params.signers);

    //Add filters to record
    var intermediary = [];
    for(let key in params) intermediary.push([key, params[key as keyof CeleniumListBlobsArgs]])
    var filtersRecord : Record<string, string> = Object.fromEntries(intermediary);

    //console.log(filtersRecord);

    //Get blob details
    const blobs =  await this.celeniumClient.get("/blob", filtersRecord); //todo add args
    var results = [];

    //Get blob contents for each blob
    for(var index in blobs){
      ///
      //console.log("Blob "+index+": ");
      //console.log(blobs[index]);

      //Namespace needs to be in hex from base64, but we need to add an 0x at the start for the namespace func.
      let rawNamespace = blobs[index].namespace;
      //console.log("rawNamespace: "+rawNamespace);

      let bufferNamespace = Buffer.from(rawNamespace, 'base64');
      let namespace = "0x" + bufferNamespace.toString('hex');
      //console.log("namespace: "+namespace);

      //Height needs to be in hex.
      let height = blobs[index].height.toString(16);
      //console.log("height: "+height);

      //replace last N bytes with reversed height bytes
      let padding = ("0000000000000000")
      padding = padding.substring(0, (16 - height.length))
      //console.log("Height length: "+height.length)
      //console.log("Padding :" +padding);

      let heightPadded = padding + height;
      //console.log("heightPadded: "+heightPadded);

      //reverse the height bytes.
      let h1 = heightPadded.match(/.{1,2}/g)!
      //console.log(h1);
      let h2 = [];
      for(let i=(h1.length - 1); i>=0; i--){
        h2.push(h1[i]);
      }
      //console.log(h2);
      let formattedHeight = h2.join("");
      //console.log("formattedHeight: "+formattedHeight);

      //Commitment should be in hex, currently it's in base64.
      let rawCommitment = blobs[index].commitment;
      //console.log("rawCommitment: "+rawCommitment);

      let bufferCommitment = Buffer.from(rawCommitment, 'base64');
      let commitment = bufferCommitment.toString('hex');
      //console.log("commitment: "+commitment);

      //ID is the formatted height added to the commitment.
      let idHex = formattedHeight + commitment;
      //console.log("idHex: "+idHex);

      let bufferId = Buffer.from(idHex, 'hex');
      let id = bufferId.toString('base64');
      //console.log("id: "+id);

      //Invoke getter for the blob contents, and add to array.
      //results.push(await this.get(namespace, id));
      
      if(blobs[index].content_type === 'application/json' ||
      blobs[index].content_type === 'text/plain; charset=utf-8') {
        results.push(await this.get(namespace, id));

      } else if(blobs[index].content_type === 'application/octet-stream' ){
        // If it’s an octet-stream then decode base64 to Uint8Array hex
        const base64Results = await this.getRaw(namespace, id);
        let output = base64Results.map(result => (Buffer.from(result, 'base64')));
        results.push(output);
      } 
      else results.push(await this.getRaw(namespace, id));
       
    }
    return results;
  }

  async celeniumListBlobsWithFiltersFetchAll( params: CeleniumListBlobsArgs /*...rawArgs: any[]*/){

    //if there exists some namespace argument
    if(params.namespaces && params.namespaces.length > 0){
      //initialise "ns"
      let ns = "";
      //is our arg array or string?
      if(!Array.isArray(params.namespaces)){
        //string
        ns = params.namespaces;
      } else {
        //array = 1
        ns = params.namespaces[0];
        //array > 1
        if(params.namespaces.length > 1){
          for(let i=1; i<params.namespaces.length; i++){
            ns+=(","+[params.namespaces[i]])
          }
        }
      }
    }

    //if there exists some signer argument
    if(params.signers && params.signers.length > 0){
      //initialise "si"
      let si = "";
      //is our arg array or string?
      if(!Array.isArray(params.signers)){
        //string
        si = params.signers;
      } else {
        //array = 1
        si = params.signers[0];
        //array > 1
        if(params.signers.length > 1){
          for(let i=1; i<params.signers.length; i++){
            si+=(","+[params.signers[i]])
          }
        }
      }
    }

    //console.log(params.namespaces);
    //console.log(params.signers);

    //Add filters to record
    var intermediary = [];
    for(let key in params) intermediary.push([key, params[key as keyof CeleniumListBlobsArgs]])
    var filtersRecord : Record<string, string> = Object.fromEntries(intermediary);

    //console.log(filtersRecord);

    //Get blob details
    const blobs =  await this.celeniumClient.get("/blob", filtersRecord); //todo add args
    var results = [];

    //Get blob contents for each blob
    for(var index in blobs){
      ///
      //console.log("Blob "+index+": ");
      //console.log(blobs[index]);

      //Namespace needs to be in hex from base64, but we need to add an 0x at the start for the namespace func.
      let rawNamespace = blobs[index].namespace;
      //console.log("rawNamespace: "+rawNamespace);

      let bufferNamespace = Buffer.from(rawNamespace, 'base64');
      let namespace = "0x" + bufferNamespace.toString('hex');
      //console.log("namespace: "+namespace);

      //Height needs to be in hex.
      let height = blobs[index].height.toString(16);
      //console.log("height: "+height);

      //replace last N bytes with reversed height bytes
      let padding = ("0000000000000000")
      padding = padding.substring(0, (16 - height.length))
      //console.log("Height length: "+height.length)
      //console.log("Padding :" +padding);

      let heightPadded = padding + height;
      //console.log("heightPadded: "+heightPadded);

      //reverse the height bytes.
      let h1 = heightPadded.match(/.{1,2}/g)!
      //console.log(h1);
      let h2 = [];
      for(let i=(h1.length - 1); i>=0; i--){
        h2.push(h1[i]);
      }
      //console.log(h2);
      let formattedHeight = h2.join("");
      //console.log("formattedHeight: "+formattedHeight);

      //Commitment should be in hex, currently it's in base64.
      let rawCommitment = blobs[index].commitment;
      //console.log("rawCommitment: "+rawCommitment);

      let bufferCommitment = Buffer.from(rawCommitment, 'base64');
      let commitment = bufferCommitment.toString('hex');
      //console.log("commitment: "+commitment);

      //ID is the formatted height added to the commitment.
      let idHex = formattedHeight + commitment;
      //console.log("idHex: "+idHex);

      let bufferId = Buffer.from(idHex, 'hex');
      let id = bufferId.toString('base64');
      //console.log("id: "+id);

      //Invoke getter for the blob contents, and add to array.
      //results.push(await this.get(namespace, id));
      
      if(blobs[index].content_type === 'application/json' ||
      blobs[index].content_type === 'text/plain; charset=utf-8') {
        results.push(await this.get(namespace, id));

      } else if(blobs[index].content_type === 'application/octet-stream' ){
        // If it’s an octet-stream then decode base64 to Uint8Array hex
        const base64Results = await this.getRaw(namespace, id);
        let output = base64Results.map(result => (Buffer.from(result, 'base64')));
        results.push(output);
      } 
      else results.push(await this.getRaw(namespace, id));
       
    }
    return [blobs, results];
  }



  /**
   * Retrieves the blob by ID under the given namespace..
   * @param namespace - The namespace under which the blob exists.
   * @param id - The id of the blob.
   * @returns A Promise resolving to the retrieved blob in base64 encoded form.
   */
  async getRaw(namespace: string | Uint8Array, id: string | string[]): Promise<string[]> {
    if (typeof id === 'string') id = [id]

    const nsBase64 = this.namespace(namespace).toString("base64");

    const jsonRequest: any = {
      id: 1,
      jsonrpc: "2.0",
      method: "da.Get",
      params: [id, nsBase64],
    };

    // Send the fetch request
    return await this.nodeClient.request(jsonRequest);
  }

  /**
   * Retrieves the blob by ID under the given namespace..
   * @param namespace - The namespace under which the blob exists.
   * @param id - The id of the blob.
   * @returns A Promise resolving to the retrieved blob.
   */
  async get<T>(namespace: string | Uint8Array, id: string | string[]): Promise<T[]> {
    const base64Results = await this.getRaw(namespace, id);
    return base64Results.map(result => JSON.parse(Buffer.from(result, 'base64').toString()));
  }

  /**
   * Submits a Blob and returns the submitted blob ID.
   * @param namespace - The namespace under which the blobs are submitted.
   * @param blob - The blob to be submitted.
   * @param gasPrice - The gas price for the submission.
   * @returns ID of the submitted blob on the celestia.
   */
  async submit<T>(
    namespace: string | Uint8Array,
    blob: T,
    gasPrice = 0.002
  ): Promise<string> {
    const nsBase64 = this.namespace(namespace).toString("base64");

    const dataJSON = JSON.stringify(blob);
    const dataBase64 = Buffer.from(dataJSON).toString("base64");

    const jsonRequest: any = {
      id: 1,
      jsonrpc: "2.0",
      method: "da.Submit",
      params: [[dataBase64], gasPrice, nsBase64],
    };

    // Send the fetch request
    return (await this.nodeClient.request(jsonRequest))[0];
  }

    /**
   * Submits Blobs and returns list of submitted blob IDs.
   * @param namespace - The namespace under which the blobs are submitted.
   * @param blobs - The blobs to be submitted.
   * @param gasPrice - The gas price for the submission.
   * @returns IDs of the submitted blobs on the celestia.
   */
  async submitBatch<T>(
    namespace: string | Uint8Array,
    blobs: T[],
    gasPrice = 0.002
  ): Promise<string[]> {
    const nsBase64 = this.namespace(namespace).toString("base64");
    const parsedBlobs = blobs.map(blob => Buffer.from(JSON.stringify(blob)).toString("base64"));

    const jsonRequest: any = {
      id: 1,
      jsonrpc: "2.0",
      method: "da.Submit",
      params: [parsedBlobs, gasPrice, nsBase64],
    };

    // Send the fetch request
    return (await this.nodeClient.request(jsonRequest));
  }
}
