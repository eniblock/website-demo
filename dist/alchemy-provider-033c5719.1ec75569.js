var e;(0,(e=globalThis.parcelRequire94c2).register)("bq21X",function(t,r){Object.defineProperty(t.exports,"AlchemyProvider",{get:()=>c,set:void 0,enumerable:!0,configurable:!0});var i=e("07xSV"),s=e("kYIxw"),n=e("i7Wzi"),o=e("e4bE7");e("kyCZa");/**
 * Internal class to enqueue requests and automatically send/process batches.
 *
 * The underlying batching mechanism is loosely based on ethers.js's
 * `JsonRpcBatchProvider`.
 *
 * @internal
 */class h{constructor(e,t=100){this.sendBatchFn=e,this.maxBatchSize=t,/**
         * Array of enqueued requests along with the constructed promise handlers for
         * each request.
         */this.pendingBatch=[]}/**
     * Enqueues the provided request. The batch is immediately sent if the maximum
     * batch size is reached. Otherwise, the request is enqueued onto a batch that
     * is sent after 10ms.
     *
     * Returns a promise that resolves with the result of the request.
     */enqueueRequest(e){return(0,i._)(this,void 0,void 0,function*(){let t={request:e,resolve:void 0,reject:void 0},r=new Promise((e,r)=>{t.resolve=e,t.reject=r});return this.pendingBatch.push(t),this.pendingBatch.length===this.maxBatchSize?this.sendBatchRequest():this.pendingBatchTimer||(this.pendingBatchTimer=setTimeout(()=>this.sendBatchRequest(),10)),r})}/**
     * Sends the currently queued batches and resets the batch and timer. Processes
     * the batched response results back to the original promises.
     */sendBatchRequest(){return(0,i._)(this,void 0,void 0,function*(){// Get the current batch and clear it, so new requests
// go into the next batch
let e=this.pendingBatch;this.pendingBatch=[],this.pendingBatchTimer&&(clearTimeout(this.pendingBatchTimer),this.pendingBatchTimer=void 0);// Get the request as an array of requests
let t=e.map(e=>e.request);return this.sendBatchFn(t).then(t=>{// For each result, feed it to the correct Promise, depending
// on whether it was a success or error
e.forEach((e,r)=>{let i=t[r];if(i.error){let t=Error(i.error.message);t.code=i.error.code,t.data=i.error.data,e.reject(t)}else e.resolve(i.result)})},t=>{e.forEach(e=>{e.reject(t)})})})}}/**
 * SDK's custom implementation of ethers.js's 'AlchemyProvider'.
 *
 * Do not call this constructor directly. Instead, instantiate an instance of
 * {@link Alchemy} and call {@link Alchemy.config.getProvider()}.
 *
 * @public
 */class c extends n.JsonRpcProvider{/** @internal */constructor(e){// Normalize the API Key to a string.
let t=c.getApiKey(e.apiKey),r=c.getAlchemyNetwork(e.network),s=c.getAlchemyConnectionInfo(r,t,"http");void 0!==e.url&&(s.url=e.url),s.throttleLimit=e.maxRetries;// Normalize the Alchemy named network input to the network names used by
// ethers. This allows the parent super constructor in JsonRpcProvider to
// correctly set the network.
let n=i.E[r];super(s,n),this.apiKey=e.apiKey,this.maxRetries=e.maxRetries,this.batchRequests=e.batchRequests;// TODO: support individual headers when calling batch
let a=Object.assign(Object.assign({},this.connection),{headers:Object.assign(Object.assign({},this.connection.headers),{"Alchemy-Ethers-Sdk-Method":"batchSend"})});this.batcher=new h(e=>(0,o.fetchJson)(a,JSON.stringify(e))),this.modifyFormatter()}/**
     * Overrides the `UrlJsonRpcProvider.getApiKey` method as implemented by
     * ethers.js. Returns the API key for an Alchemy provider.
     *
     * @internal
     * @override
     */static getApiKey(e){if(null==e)return i.D;if(e&&"string"!=typeof e)throw Error(`Invalid apiKey '${e}' provided. apiKey must be a string.`);return e}/**
     * Overrides the `BaseProvider.getNetwork` method as implemented by ethers.js.
     *
     * This override allows the SDK to set the provider's network to values not
     * yet supported by ethers.js.
     *
     * @internal
     * @override
     */static getNetwork(e){return"string"==typeof e&&e in i.C?i.C[e]:(0,s.getNetwork)(e)}/**
     * Converts the `Networkish` input to the network enum used by Alchemy.
     *
     * @internal
     */static getAlchemyNetwork(e){if(void 0===e)return i.a;if("number"==typeof e)throw Error(`Invalid network '${e}' provided. Network must be a string.`);// Guaranteed that `typeof network === 'string`.
let t=Object.values(i.N).includes(e);if(!t)throw Error(`Invalid network '${e}' provided. Network must be one of: ${Object.values(i.N).join(", ")}.`);return e}/**
     * Returns a {@link ConnectionInfo} object compatible with ethers that contains
     * the correct URLs for Alchemy.
     *
     * @internal
     */static getAlchemyConnectionInfo(e,t,r){let s="http"===r?(0,i.g)(e,t):(0,i.b)(e,t);return{headers:i.I?{"Alchemy-Ethers-Sdk-Version":i.V}:{"Alchemy-Ethers-Sdk-Version":i.V,"Accept-Encoding":"gzip"},allowGzip:!0,url:s}}/**
     * Overrides the method in ethers.js's `StaticJsonRpcProvider` class. This
     * method is called when calling methods on the parent class `BaseProvider`.
     *
     * @override
     */detectNetwork(){let e=Object.create(null,{detectNetwork:{get:()=>super.detectNetwork}});return(0,i._)(this,void 0,void 0,function*(){let t=this.network;if(null==t&&!(t=yield e.detectNetwork.call(this)))throw Error("No network detected");return t})}_startPending(){(0,i.l)("WARNING: Alchemy Provider does not support pending filters")}/**
     * Overrides the ether's `isCommunityResource()` method. Returns true if the
     * current api key is the default key.
     *
     * @override
     */isCommunityResource(){return this.apiKey===i.D}/**
     * Overrides the base {@link JsonRpcProvider.send} method to implement custom
     * logic for sending requests to Alchemy.
     *
     * @param method The method name to use for the request.
     * @param params The parameters to use for the request.
     * @override
     * @public
     */// TODO: Add headers for `perform()` override.
send(e,t){return this._send(e,t,"send")}/**
     * DO NOT MODIFY.
     *
     * Original code copied over from ether.js's `JsonRpcProvider.send()`.
     *
     * This method is copied over directly in order to implement custom headers
     *
     * @internal
     */_send(e,t,r,s=!1){let n={method:e,params:t,id:this._nextId++,jsonrpc:"2.0"},h=Object.assign({},this.connection);if(h.headers["Alchemy-Ethers-Sdk-Method"]=r,this.batchRequests||s)return this.batcher.enqueueRequest(n);// END MODIFIED CODE
this.emit("debug",{action:"request",request:(0,i.d)(n),provider:this});// We can expand this in the future to any call, but for now these
// are the biggest wins and do not require any serializing parameters.
let c=["eth_chainId","eth_blockNumber"].indexOf(e)>=0;if(c&&this._cache[e])return this._cache[e];let d=(0,o.fetchJson)(this.connection,JSON.stringify(n),a).then(e=>(this.emit("debug",{action:"response",request:n,response:e,provider:this}),e),e=>{throw this.emit("debug",{action:"response",error:e,request:n,provider:this}),e});return c&&(this._cache[e]=d,setTimeout(()=>{// @ts-ignore - This is done by ethers.
this._cache[e]=null},0)),d}/**
     * Overrides the base `Formatter` class inherited from ethers to support
     * returning custom fields in Ethers response types.
     *
     * For context, ethers has a `Formatter` class that is used to format the
     * response from a JSON-RPC request. Any fields that are not defined in the
     * `Formatter` class are removed from the returned response. By modifying the
     * `Formatter` class in this method, we can add support for fields that are
     * not defined in ethers.
     */modifyFormatter(){this.formatter.formats.receiptLog.removed=e=>{if("boolean"==typeof e)return e}}}/**
 * DO NOT MODIFY.
 *
 * Original code copied over from ether.js's
 * `@ethersproject/web/src.ts/index.ts`. Used to support
 * {@link AlchemyProvider._send}, which is also copied over.
 */function a(e){if(e.error){let t=Error(e.error.message);throw t.code=e.error.code,t.data=e.error.data,t}return e.result}});//# sourceMappingURL=alchemy-provider-033c5719.1ec75569.js.map

//# sourceMappingURL=alchemy-provider-033c5719.1ec75569.js.map
