var e,t;(t=(e=globalThis.parcelRequire94c2).register)("eRNs9",function(t,s){Object.defineProperty(t.exports,"AlchemyWebSocketProvider",{get:()=>p,set:void 0,enumerable:!0,configurable:!0});var n=e("07xSV"),i=e("5R2ui"),r=e("3HDBd"),o=e("kYIxw"),l=e("i7Wzi"),a=e("bq21X");e("kyCZa");var h=e("ibaza");/**
 * The WebsocketBackfiller fetches events that were sent since a provided block
 * number. This is used in the {@link AlchemyWebSocketProvider} to backfill
 * events that were transmitted while the websocket connection was down.
 *
 * The backfiller backfills two main eth_subscribe events: `logs` and `newHeads`.
 *
 * @internal
 */class c{constructor(e){this.provider=e,// TODO: Use HTTP provider to do backfill.
this.maxBackfillBlocks=120}/**
     * Runs backfill for `newHeads` events.
     *
     * @param isCancelled Whether the backfill request is cancelled.
     * @param previousHeads Previous head requests that were sent.
     * @param fromBlockNumber The block number to start backfilling from.
     * @returns A list of `newHeads` events that were sent since the last backfill.
     */getNewHeadsBackfill(e,t,s){return(0,n._)(this,void 0,void 0,function*(){m(e);let i=yield this.getBlockNumber();// If there are no previous heads to fetch, return new heads since
// `fromBlockNumber`, or up to maxBackfillBlocks from the current head.
if(m(e),0===t.length)return this.getHeadEventsInRange(Math.max(s,i-this.maxBackfillBlocks)+1,i+1);// If the last emitted event is too far back in the past, there's no need
// to backfill for reorgs. Just fetch the last `maxBackfillBlocks` worth of
// new heads.
let r=(0,n.f)(t[t.length-1].number),o=i-this.maxBackfillBlocks+1;if(r<=o)return this.getHeadEventsInRange(o,i+1);// To capture all `newHeads` events, return all head events from the last
// seen block number to current + any of the previous heads that were re-orged.
let l=yield this.getReorgHeads(e,t);m(e);let a=yield this.getHeadEventsInRange(r+1,i+1);return m(e),[...l,...a]})}/**
     * Runs backfill for `logs` events.
     *
     * @param isCancelled Whether the backfill request is cancelled.
     * @param filter The filter object that accompanies a logs subscription.
     * @param previousLogs Previous log requests that were sent.
     * @param fromBlockNumber The block number to start backfilling from.
     */getLogsBackfill(e,t,s,i){return(0,n._)(this,void 0,void 0,function*(){m(e);let r=yield this.getBlockNumber();// If there are no previous logs to fetch, return new logs since
// `fromBlockNumber`, or up to `maxBackfillBlocks` from the current head.
if(m(e),0===s.length)return this.getLogsInRange(t,Math.max(i,r-this.maxBackfillBlocks)+1,r+1);// If the last emitted log is too far back in the past, there's no need
// to backfill for removed logs. Just fetch the last `maxBackfillBlocks`
// worth of logs.
let o=(0,n.f)(s[s.length-1].blockNumber),l=r-this.maxBackfillBlocks+1;if(o<l)return this.getLogsInRange(t,l,r+1);// Return all log events that have happened along with log events that have
// been removed due to a chain reorg.
let a=yield this.getCommonAncestor(e,s);m(e);// All previous logs with a block number greater than the common ancestor
// were part of a re-org, so mark them as such.
let h=s.filter(e=>(0,n.f)(e.blockNumber)>a.blockNumber).map(e=>Object.assign(Object.assign({},e),{removed:!0})),c=a.blockNumber===Number.NEGATIVE_INFINITY?(0,n.f)(s[0].blockNumber):a.blockNumber,u=yield this.getLogsInRange(t,c,r+1);return(// De-dupe any logs that were already emitted.
u=u.filter(e=>e&&((0,n.f)(e.blockNumber)>a.blockNumber||(0,n.f)(e.logIndex)>a.logIndex)),m(e),[...h,...u])})}/**
     * Sets a new max backfill blocks. VISIBLE ONLY FOR TESTING.
     *
     * @internal
     */setMaxBackfillBlock(e){this.maxBackfillBlocks=e}/**
     * Gets the current block number as a number.
     *
     * @private
     */getBlockNumber(){return(0,n._)(this,void 0,void 0,function*(){let e=yield this.provider.send("eth_blockNumber");return(0,n.f)(e)})}/**
     * Gets all `newHead` events in the provided range. Note that the returned
     * heads do not include re-orged heads. Use {@link getReorgHeads} to find heads
     * that were part of a re-org.
     *
     * @private
     */getHeadEventsInRange(e,t){return(0,n._)(this,void 0,void 0,function*(){if(e>=t)return[];let s=[];for(let i=e;i<t;i++)s.push({method:"eth_getBlockByNumber",params:[(0,n.t)(i),!1]});// TODO: handle errors
let i=yield this.provider.sendBatch(s);return i.map(u)})}/**
     * Returns all heads that were part of a reorg event.
     *
     * @private
     */getReorgHeads(e,t){return(0,n._)(this,void 0,void 0,function*(){let s=[];// Iterate from the most recent head backwards in order to find the first
// block that was part of a re-org.
for(let i=t.length-1;i>=0;i--){let r=t[i],o=yield this.getBlockByNumber((0,n.f)(r.number));// If the hashes match, then current head in the iteration was not re-orged.
if(m(e),r.hash===o.hash)break;s.push(u(o))}return s.reverse()})}/**
     * Simple wrapper around `eth_getBlockByNumber` that returns the complete
     * block information for the provided block number.
     *
     * @private
     */getBlockByNumber(e){return(0,n._)(this,void 0,void 0,function*(){return this.provider.send("eth_getBlockByNumber",[(0,n.t)(e),!1])})}/**
     * Given a list of previous log events, finds the common block number from the
     * logs that matches the block head.
     *
     * This can be used to identify which logs are part of a re-org.
     *
     * Returns 1 less than the oldest log's block number if no common ancestor was found.
     *
     * @private
     */getCommonAncestor(e,t){return(0,n._)(this,void 0,void 0,function*(){// Iterate from the most recent head backwards in order to find the first
// block that was part of a re-org.
let s=yield this.getBlockByNumber((0,n.f)(t[t.length-1].blockNumber));m(e);for(let e=t.length-1;e>=0;e--){let i=t[e];// Since logs are ordered in ascending order, the first log that matches
// the hash should be the largest logIndex.
if(i.blockNumber!==s.number&&(s=yield this.getBlockByNumber((0,n.f)(i.blockNumber))),i.blockHash===s.hash)return{blockNumber:(0,n.f)(i.blockNumber),logIndex:(0,n.f)(i.logIndex)}}return{blockNumber:Number.NEGATIVE_INFINITY,logIndex:Number.NEGATIVE_INFINITY}})}/**
     * Gets all `logs` events in the provided range. Note that the returned logs
     * do not include removed logs.
     *
     * @private
     */getLogsInRange(e,t,s){return(0,n._)(this,void 0,void 0,function*(){if(t>=s)return[];let i=Object.assign(Object.assign({},e),{fromBlock:(0,n.t)(t),toBlock:(0,n.t)(s-1)});return this.provider.send("eth_getLogs",[i])})}}function u(e){let t=Object.assign({},e);return delete t.totalDifficulty,delete t.transactions,delete t.uncles,t}function d(e,t){let s=new Set,n=[];return e.forEach(e=>{let i=t(e);s.has(i)||(s.add(i),n.push(e))}),n}let f=Error("Cancelled");function m(e){if(e())throw f}/**
 * SDK's custom implementation fo the ethers.js's 'AlchemyWebSocketProvider'.
 *
 * Do not call this constructor directly. Instead, instantiate an instance of
 * {@link Alchemy} and call {@link Alchemy.config.getWebSocketProvider()}.
 *
 * @public
 */class p extends l.WebSocketProvider{/** @internal */constructor(t,s){var r;// Normalize the API Key to a string.
let o=(0,a.AlchemyProvider).getApiKey(t.apiKey),l=(0,a.AlchemyProvider).getAlchemyNetwork(t.network),u=(0,a.AlchemyProvider).getAlchemyConnectionInfo(l,o,"wss"),d=`alchemy-sdk-${n.V}`,f=new(i&&i.__esModule?i.default:i)(null!==(r=t.url)&&void 0!==r?r:u.url,d,{wsConstructor:null!=s?s:void 0!==h&&null!=h&&null!=h.versions&&null!=h.versions.node?e("9RaPq").w3cwebsocket:WebSocket}),m=n.E[l];super(f,m),this._events=[],// In the case of a WebSocket reconnection, all subscriptions are lost and we
// create new ones to replace them, but we want to create the illusion that
// the original subscriptions persist. Thus, maintain a mapping from the
// "virtual" subscription ids which are visible to the consumer to the
// "physical" subscription ids of the actual connections. This terminology is
// borrowed from virtual and physical memory, which has a similar mapping.
/** @internal */this.virtualSubscriptionsById=new Map,/** @internal */this.virtualIdsByPhysicalId=new Map,/**
         * The underlying ethers {@link WebSocketProvider} already handles and emits
         * messages. To allow backfilling, track all messages that are emitted.
         *
         * This is a field arrow function in order to preserve `this` context when
         * passing the method as an event listener.
         *
         * @internal
         */this.handleMessage=e=>{var t;let s=JSON.parse(e.data);if(Array.isArray(t=s)||"2.0"===t.jsonrpc&&void 0!==t.id)return;let n=s.params.subscription,i=this.virtualIdsByPhysicalId.get(n);if(!i)return;let r=this.virtualSubscriptionsById.get(i);if("eth_subscribe"===r.method)switch(r.params[0]){case"newHeads":{let{isBackfilling:e,backfillBuffer:t}=r,{result:o}=s.params;e?k(t,o,y):n!==i?// event, so the SDK has to.
this.emitAndRememberEvent(i,o,y):this.rememberEvent(i,o,y);break}case"logs":{let{isBackfilling:e,backfillBuffer:t}=r,{result:o}=s.params;e?k(t,o,g):i!==n?this.emitAndRememberEvent(i,o,g):this.rememberEvent(i,o,g);break}default:if(n!==i){// In the case of a re-opened subscription, ethers will not emit the
// event, so the SDK has to.
let{result:e}=s.params;this.emitEvent(i,e)}}},/**
         * When the websocket connection reopens:
         *
         * 1. Resubscribe to all existing subscriptions and start backfilling
         * 2. Restart heart beat.
         *
         * This is a field arrow function in order to preserve `this` context when
         * passing the method as an event listener.
         *
         * @internal
         */this.handleReopen=()=>{let e;this.virtualIdsByPhysicalId.clear();let{cancel:t,isCancelled:s}=(e=!1,{cancel:()=>e=!0,isCancelled:()=>e});for(let e of(this.cancelBackfill=t,this.virtualSubscriptionsById.values()))(0,n._)(this,void 0,void 0,function*(){try{yield this.resubscribeAndBackfill(s,e)}catch(t){s()||console.error(`Error while backfilling "${e.params[0]}" subscription. Some events may be missing.`,t)}});this.startHeartbeat()},/**
         * Cancels the heartbeat and any pending backfills being performed. This is
         * called when the websocket connection goes down or is disconnected.
         *
         * This is a field arrow function in order to preserve `this` context when
         * passing the method as an event listener.
         *
         * @internal
         */this.stopHeartbeatAndBackfill=()=>{null!=this.heartbeatIntervalId&&(clearInterval(this.heartbeatIntervalId),this.heartbeatIntervalId=void 0),this.cancelBackfill()},this.apiKey=o,// Start heartbeat and backfiller for the websocket connection.
this.backfiller=new c(this),this.addSocketListeners(),this.startHeartbeat(),this.cancelBackfill=n.n}/**
     * Overrides the `BaseProvider.getNetwork` method as implemented by ethers.js.
     *
     * This override allows the SDK to set the provider's network to values not
     * yet supported by ethers.js.
     *
     * @internal
     * @override
     */static getNetwork(e){return"string"==typeof e&&e in n.C?n.C[e]:(0,o.getNetwork)(e)}/**
     * Overridden implementation of ethers that includes Alchemy based subscriptions.
     *
     * @param eventName Event to subscribe to
     * @param listener The listener function to call when the event is triggered.
     * @override
     * @public
     */// TODO: Override `Listener` type to get type autocompletions.
on(e,t){return this._addEventListener(e,t,!1)}/**
     * Overridden implementation of ethers that includes Alchemy based
     * subscriptions. Adds a listener to the triggered for only the next
     * {@link eventName} event, after which it will be removed.
     *
     * @param eventName Event to subscribe to
     * @param listener The listener function to call when the event is triggered.
     * @override
     * @public
     */// TODO: Override `Listener` type to get type autocompletions.
once(e,t){return this._addEventListener(e,t,!0)}/**
     * Removes the provided {@link listener} for the {@link eventName} event. If no
     * listener is provided, all listeners for the event will be removed.
     *
     * @param eventName Event to unlisten to.
     * @param listener The listener function to remove.
     * @override
     * @public
     */off(e,t){return(0,n.i)(e)?this._off(e,t):super.off(e,t)}/**
     * Remove all listeners for the provided {@link eventName} event. If no event
     * is provided, all events and their listeners are removed.
     *
     * @param eventName The event to remove all listeners for.
     * @override
     * @public
     */removeAllListeners(e){return void 0!==e&&(0,n.i)(e)?this._removeAllListeners(e):super.removeAllListeners(e)}/**
     * Returns the number of listeners for the provided {@link eventName} event. If
     * no event is provided, the total number of listeners for all events is returned.
     *
     * @param eventName The event to get the number of listeners for.
     * @public
     * @override
     */listenerCount(e){return void 0!==e&&(0,n.i)(e)?this._listenerCount(e):super.listenerCount(e)}/**
     * Returns an array of listeners for the provided {@link eventName} event. If
     * no event is provided, all listeners will be included.
     *
     * @param eventName The event to get the listeners for.
     * @public
     * @override
     */listeners(e){return void 0!==e&&(0,n.i)(e)?this._listeners(e):super.listeners(e)}/**
     * Overrides the method in `BaseProvider` in order to properly format the
     * Alchemy subscription events.
     *
     * @internal
     * @override
     */_addEventListener(e,t,s){if(!(0,n.i)(e))return super._addEventListener(e,t,s);{(0,n.v)(e);let i=new n.c((0,n.e)(e),t,s);return this._events.push(i),this._startEvent(i),this}}/**
     * Overrides the `_startEvent()` method in ethers.js's
     * {@link WebSocketProvider} to include additional alchemy methods.
     *
     * @param event
     * @override
     * @internal
     */_startEvent(e){// Check if the event type is a custom Alchemy subscription.
let t=[...n.A,"block","filter"];t.includes(e.type)?this.customStartEvent(e):super._startEvent(e)}/**
     * Overridden from ethers.js's {@link WebSocketProvider}
     *
     * Modified in order to add mappings for backfilling.
     *
     * @internal
     * @override
     */_subscribe(e,t,s,i){return(0,n._)(this,void 0,void 0,function*(){let n=this._subIds[e],r=yield this.getBlockNumber();null==n&&(n=Promise.all(t).then(e=>this.send("eth_subscribe",e)),this._subIds[e]=n);let o=yield n,l=yield Promise.all(t);this.virtualSubscriptionsById.set(o,{event:i,method:"eth_subscribe",params:l,startingBlockNumber:r,virtualId:o,physicalId:o,sentEvents:[],isBackfilling:!1,backfillBuffer:[]}),this.virtualIdsByPhysicalId.set(o,o),// END MODIFIED CODE
this._subs[o]={tag:e,processFunc:s}})}/**
     * DO NOT MODIFY.
     *
     * Original code copied over from ether.js's `BaseProvider`.
     *
     * This method is copied over directly in order to implement Alchemy's unique
     * subscription types. The only difference is that this method calls
     * {@link getAlchemyEventTag} instead of the original `getEventTag()` method in
     * order to parse the Alchemy subscription event.
     *
     * @internal
     * @override
     */emit(e,...t){if(!(0,n.i)(e))return super.emit(e,...t);{let s=!1,i=[],r=(0,n.e)(e);return this._events=this._events.filter(e=>e.tag!==r||(setTimeout(()=>{e.listener.apply(this,t)},0),s=!0,!e.once||(i.push(e),!1))),i.forEach(e=>{this._stopEvent(e)}),s}}/** @internal */sendBatch(e){return(0,n._)(this,void 0,void 0,function*(){let t=0,s=e.map(({method:e,params:s})=>({method:e,params:s,jsonrpc:"2.0",id:`alchemy-sdk:${t++}`}));return this.sendBatchConcurrently(s)})}/** @override */destroy(){return this.removeSocketListeners(),this.stopHeartbeatAndBackfill(),super.destroy()}/**
     * Overrides the ether's `isCommunityResource()` method. Returns true if the
     * current api key is the default key.
     *
     * @override
     */isCommunityResource(){return this.apiKey===n.D}/**
     * DO NOT MODIFY.
     *
     * Original code copied over from ether.js's `WebSocketProvider._stopEvent()`.
     *
     * This method is copied over directly in order to support Alchemy's
     * subscription type by allowing the provider to properly stop Alchemy's
     * subscription events.
     *
     * @internal
     */_stopEvent(e){let t=e.tag;// START MODIFIED CODE
if((0,n.A).includes(e.type))// There are remaining pending transaction listeners.
{if(this._events.filter(e=>(0,n.A).includes(e.type)).length)return}else if("tx"===e.type){// There are remaining transaction event listeners
if(this._events.filter(e=>"tx"===e.type).length)return;t="tx"}else if(this.listenerCount(e.event))return;let s=this._subIds[t];s&&(delete this._subIds[t],s.then(e=>{this._subs[e]&&(delete this._subs[e],this.send("eth_unsubscribe",[e]))}))}/** @internal */addSocketListeners(){this._websocket.addEventListener("message",this.handleMessage),this._websocket.addEventListener("reopen",this.handleReopen),this._websocket.addEventListener("down",this.stopHeartbeatAndBackfill)}/** @internal */removeSocketListeners(){this._websocket.removeEventListener("message",this.handleMessage),this._websocket.removeEventListener("reopen",this.handleReopen),this._websocket.removeEventListener("down",this.stopHeartbeatAndBackfill)}/**
     * Reopens the backfill based on
     *
     * @param isCancelled
     * @param subscription
     * @internal
     */resubscribeAndBackfill(e,t){return(0,n._)(this,void 0,void 0,function*(){let{virtualId:s,method:n,params:i,sentEvents:r,backfillBuffer:o,startingBlockNumber:l}=t;t.isBackfilling=!0,o.length=0;try{var a,h;let c=yield this.send(n,i);switch(m(e),t.physicalId=c,this.virtualIdsByPhysicalId.set(c,s),i[0]){case"newHeads":{let t=yield b(()=>v(this.backfiller.getNewHeadsBackfill(e,r,l),6e4),5,()=>!e());m(e);let n=(a=[...t,...o],d(a,e=>e.hash));n.forEach(e=>this.emitNewHeadsEvent(s,e));break}case"logs":{let t=i[1]||{},n=yield b(()=>v(this.backfiller.getLogsBackfill(e,t,r,l),6e4),5,()=>!e());m(e);let a=(h=[...n,...o],d(h,e=>`${e.blockHash}/${e.logIndex}`));a.forEach(e=>this.emitLogsEvent(s,e))}}}finally{t.isBackfilling=!1,o.length=0}})}/** @internal */emitNewHeadsEvent(e,t){this.emitAndRememberEvent(e,t,y)}/** @internal */emitLogsEvent(e,t){this.emitAndRememberEvent(e,t,g)}/**
     * Emits an event to consumers, but also remembers it in its subscriptions's
     * `sentEvents` buffer so that we can detect re-orgs if the connection drops
     * and needs to be reconnected.
     *
     * @internal
     */emitAndRememberEvent(e,t,s){this.rememberEvent(e,t,s),this.emitEvent(e,t)}emitEvent(e,t){let s=this.virtualSubscriptionsById.get(e);s&&this.emitGenericEvent(s,t)}/** @internal */rememberEvent(e,t,s){let n=this.virtualSubscriptionsById.get(e);n&&// Web3 modifies these event objects once we pass them on (changing hex
// numbers to numbers). We want the original event, so make a defensive
// copy.
k(n.sentEvents,Object.assign({},t),s)}/** @internal */emitGenericEvent(e,t){let s=this.emitProcessFn(e.event);s(t)}/**
     * Starts a heartbeat that pings the websocket server periodically to ensure
     * that the connection stays open.
     *
     * @internal
     */startHeartbeat(){null==this.heartbeatIntervalId&&(this.heartbeatIntervalId=setInterval(()=>(0,n._)(this,void 0,void 0,function*(){try{yield v(this.send("net_version"),1e4)}catch(e){this._websocket.reconnect()}}),3e4))}/**
     * This method sends the batch concurrently as individual requests rather than
     * as a batch, which was the original implementation. The original batch logic
     * is preserved in this implementation in order for faster porting.
     *
     * @param payload
     * @internal
     */// TODO(cleanup): Refactor and remove usages of `sendBatch()`.
// TODO(errors): Use allSettled() once we have more error handling.
sendBatchConcurrently(e){return(0,n._)(this,void 0,void 0,function*(){return Promise.all(e.map(e=>this.send(e.method,e.params)))})}/** @internal */customStartEvent(e){if(e.type===n.h){let{fromAddress:t,toAddress:s,hashesOnly:i}=e;this._subscribe(e.tag,[n.j.PENDING_TRANSACTIONS,{fromAddress:t,toAddress:s,hashesOnly:i}],this.emitProcessFn(e),e)}else if(e.type===n.k){let{addresses:t,includeRemoved:s,hashesOnly:i}=e;this._subscribe(e.tag,[n.j.MINED_TRANSACTIONS,{addresses:t,includeRemoved:s,hashesOnly:i}],this.emitProcessFn(e),e)}else"block"===e.type?this._subscribe("block",["newHeads"],this.emitProcessFn(e),e):"filter"===e.type&&this._subscribe(e.tag,["logs",this._getFilter(e.filter)],this.emitProcessFn(e),e)}/** @internal */emitProcessFn(e){switch(e.type){case n.h:return t=>this.emit({method:n.j.PENDING_TRANSACTIONS,fromAddress:e.fromAddress,toAddress:e.toAddress,hashesOnly:e.hashesOnly},t);case n.k:return t=>this.emit({method:n.j.MINED_TRANSACTIONS,addresses:e.addresses,includeRemoved:e.includeRemoved,hashesOnly:e.hashesOnly},t);case"block":return e=>{let t=(0,r.BigNumber).from(e.number).toNumber();this._emitted.block=t,this.emit("block",t)};case"filter":return t=>{null==t.removed&&(t.removed=!1),this.emit(e.filter,this.formatter.filterLog(t))};default:throw Error("Invalid event type to `emitProcessFn()`")}}/**
     * DO NOT MODIFY.
     *
     * Original code copied over from ether.js's `BaseProvider.off()`.
     *
     * This method is copied over directly in order to implement Alchemy's unique
     * subscription types. The only difference is that this method calls
     * {@link getAlchemyEventTag} instead of the original `getEventTag()` method in
     * order to parse the Alchemy subscription event.
     *
     * @private
     */_off(e,t){if(null==t)return this.removeAllListeners(e);let s=[],i=!1,r=(0,n.e)(e);return this._events=this._events.filter(e=>e.tag!==r||e.listener!=t||!!i||(i=!0,s.push(e),!1)),s.forEach(e=>{this._stopEvent(e)}),this}/**
     * DO NOT MODIFY.
     *
     * Original code copied over from ether.js's `BaseProvider.removeAllListeners()`.
     *
     * This method is copied over directly in order to implement Alchemy's unique
     * subscription types. The only difference is that this method calls
     * {@link getAlchemyEventTag} instead of the original `getEventTag()` method in
     * order to parse the Alchemy subscription event.
     *
     * @private
     */_removeAllListeners(e){let t=[];if(null==e)t=this._events,this._events=[];else{let s=(0,n.e)(e);this._events=this._events.filter(e=>e.tag!==s||(t.push(e),!1))}return t.forEach(e=>{this._stopEvent(e)}),this}/**
     * DO NOT MODIFY.
     *
     * Original code copied over from ether.js's `BaseProvider.listenerCount()`.
     *
     * This method is copied over directly in order to implement Alchemy's unique
     * subscription types. The only difference is that this method calls
     * {@link getAlchemyEventTag} instead of the original `getEventTag()` method in
     * order to parse the Alchemy subscription event.
     *
     * @private
     */_listenerCount(e){if(!e)return this._events.length;let t=(0,n.e)(e);return this._events.filter(e=>e.tag===t).length}/**
     * DO NOT MODIFY.
     *
     * Original code copied over from ether.js's `BaseProvider.listeners()`.
     *
     * This method is copied over directly in order to implement Alchemy's unique
     * subscription types. The only difference is that this method calls
     * {@link getAlchemyEventTag} instead of the original `getEventTag()` method in
     * order to parse the Alchemy subscription event.
     *
     * @private
     */_listeners(e){if(null==e)return this._events.map(e=>e.listener);let t=(0,n.e)(e);return this._events.filter(e=>e.tag===t).map(e=>e.listener)}}function b(e,t,s=()=>!0){return(0,n._)(this,void 0,void 0,function*(){let n=0,i=0;for(;;)try{return yield e()}catch(e){if(++i>=t||!s(e)||(yield function(e){return new Promise(t=>setTimeout(t,e))}(n),!s(e)))throw e;n=0===n?1e3:Math.min(3e4,2*n)}})}function v(e,t){return Promise.race([e,new Promise((e,s)=>setTimeout(()=>s(Error("Timeout")),t))])}function y(e){return(0,n.f)(e.number)}function g(e){return(0,n.f)(e.blockNumber)}/**
 * Adds a new event to an array of events, evicting any events which are so old
 * that they will no longer feasibly be part of a reorg.
 */function k(e,t,s){let n=s(t),i=e.findIndex(e=>s(e)>n-10);-1===i?e.length=0:e.splice(0,i),e.push(t)}}),t("5R2ui",function(e,t){Object.defineProperty(e.exports,"__esModule",{value:!0});var s=/** @class */function(){function e(t,n,i){var r,o;if(void 0===i&&(i={}),this.url=t,this.onclose=null,this.onerror=null,this.onmessage=null,this.onopen=null,this.ondown=null,this.onreopen=null,this.CONNECTING=e.CONNECTING,this.OPEN=e.OPEN,this.CLOSING=e.CLOSING,this.CLOSED=e.CLOSED,this.hasBeenOpened=!1,this.isClosed=!1,this.messageBuffer=[],this.nextRetryTime=0,this.reconnectCount=0,this.lastKnownExtensions="",this.lastKnownProtocol="",this.listeners={},null==n||"string"==typeof n||Array.isArray(n)?this.protocols=n:i=n,this.options=(r=i,o={},Object.keys(s.DEFAULT_OPTIONS).forEach(function(e){var t=r[e];o[e]=void 0===t?s.DEFAULT_OPTIONS[e]:t}),o),!this.options.wsConstructor){if("undefined"!=typeof WebSocket)this.options.wsConstructor=WebSocket;else throw Error("WebSocket not present in global scope and no wsConstructor option was provided.")}this.openNewWebSocket()}return Object.defineProperty(e.prototype,"binaryType",{get:function(){return this.binaryTypeInternal||"blob"},set:function(e){this.binaryTypeInternal=e,this.ws&&(this.ws.binaryType=e)},enumerable:!0,configurable:!0}),Object.defineProperty(e.prototype,"bufferedAmount",{get:function(){var e=this.ws?this.ws.bufferedAmount:0,t=!1;return this.messageBuffer.forEach(function(s){var n="string"==typeof s?2*s.length:s instanceof ArrayBuffer?s.byteLength:s instanceof Blob?s.size:void 0;null!=n?e+=n:t=!0}),t&&this.debugLog("Some buffered data had unknown length. bufferedAmount() return value may be below the correct amount."),e},enumerable:!0,configurable:!0}),Object.defineProperty(e.prototype,"extensions",{get:function(){return this.ws?this.ws.extensions:this.lastKnownExtensions},enumerable:!0,configurable:!0}),Object.defineProperty(e.prototype,"protocol",{get:function(){return this.ws?this.ws.protocol:this.lastKnownProtocol},enumerable:!0,configurable:!0}),Object.defineProperty(e.prototype,"readyState",{get:function(){return this.isClosed?e.CLOSED:e.OPEN},enumerable:!0,configurable:!0}),e.prototype.close=function(e,t){this.disposeSocket(e,t),this.shutdown(),this.debugLog("WebSocket permanently closed by client.")},e.prototype.send=function(e){if(this.isClosed)throw Error("WebSocket is already in CLOSING or CLOSED state.");this.ws&&this.ws.readyState===this.OPEN?this.ws.send(e):this.messageBuffer.push(e)},e.prototype.reconnect=function(){if(this.isClosed)throw Error("Cannot call reconnect() on socket which is permanently closed.");this.disposeSocket(1e3,"Client requested reconnect."),this.handleClose(void 0)},e.prototype.addEventListener=function(e,t){this.listeners[e]||(this.listeners[e]=[]),this.listeners[e].push(t)},e.prototype.dispatchEvent=function(e){return this.dispatchEventOfType(e.type,e)},e.prototype.removeEventListener=function(e,t){this.listeners[e]&&(this.listeners[e]=this.listeners[e].filter(function(e){return e!==t}))},e.prototype.openNewWebSocket=function(){var e=this;if(!this.isClosed){var t=this.options,s=t.connectTimeout,n=t.wsConstructor;this.debugLog("Opening new WebSocket to "+this.url+".");var i=new n(this.url,this.protocols);i.onclose=function(t){return e.handleClose(t)},i.onerror=function(t){return e.handleError(t)},i.onmessage=function(t){return e.handleMessage(t)},i.onopen=function(t){return e.handleOpen(t)},this.connectTimeoutId=setTimeout(function(){// If this is running, we still haven't opened the websocket.
// Kill it so we can try again.
e.clearConnectTimeout(),e.disposeSocket(),e.handleClose(void 0)},s),this.ws=i}},e.prototype.handleOpen=function(e){var t=this;if(this.ws&&!this.isClosed){var s=this.options.allClearResetTime;this.debugLog("WebSocket opened."),null!=this.binaryTypeInternal?this.ws.binaryType=this.binaryTypeInternal:this.binaryTypeInternal=this.ws.binaryType,this.clearConnectTimeout(),this.hasBeenOpened?this.dispatchEventOfType("reopen",e):(this.dispatchEventOfType("open",e),this.hasBeenOpened=!0),this.messageBuffer.forEach(function(e){return t.send(e)}),this.messageBuffer=[],this.allClearTimeoutId=setTimeout(function(){t.clearAllClearTimeout(),t.nextRetryTime=0,t.reconnectCount=0,t.debugLog("WebSocket remained open for "+(s/1e3|0)+" seconds. Resetting retry time and count.")},s)}},e.prototype.handleMessage=function(e){this.isClosed||this.dispatchEventOfType("message",e)},e.prototype.handleClose=function(e){var t=this;if(!this.isClosed){var s=this.options,n=s.maxReconnectAttempts,i=s.shouldReconnect;if(this.clearConnectTimeout(),this.clearAllClearTimeout(),this.ws&&(this.lastKnownExtensions=this.ws.extensions,this.lastKnownProtocol=this.ws.protocol,this.disposeSocket()),this.dispatchEventOfType("down",e),this.reconnectCount>=n){this.stopReconnecting(e,this.getTooManyFailedReconnectsMessage());return}var r=!e||i(e);"boolean"==typeof r?this.handleWillReconnect(r,e,"Provided shouldReconnect() returned false. Closing permanently."):r.then(function(s){t.isClosed||t.handleWillReconnect(s,e,"Provided shouldReconnect() resolved to false. Closing permanently.")})}},e.prototype.handleError=function(e){this.dispatchEventOfType("error",e),this.debugLog("WebSocket encountered an error.")},e.prototype.handleWillReconnect=function(e,t,s){e?this.reestablishConnection():this.stopReconnecting(t,s)},e.prototype.reestablishConnection=function(){var e=this,t=this.options,s=t.minReconnectDelay,n=t.maxReconnectDelay,i=t.reconnectBackoffFactor;this.reconnectCount++;var r=this.nextRetryTime;this.nextRetryTime=Math.max(s,Math.min(this.nextRetryTime*i,n)),setTimeout(function(){return e.openNewWebSocket()},r),this.debugLog("WebSocket was closed. Re-opening in "+(r/1e3|0)+" seconds.")},e.prototype.stopReconnecting=function(e,t){this.debugLog(t),this.shutdown(),e&&this.dispatchEventOfType("close",e)},e.prototype.shutdown=function(){this.isClosed=!0,this.clearAllTimeouts(),this.messageBuffer=[],this.disposeSocket()},e.prototype.disposeSocket=function(e,t){this.ws&&(// Use noop handlers instead of null because some WebSocket
// implementations, such as the one from isomorphic-ws, raise a stink on
// unhandled events.
this.ws.onerror=n,this.ws.onclose=n,this.ws.onmessage=n,this.ws.onopen=n,this.ws.close(e,t),this.ws=void 0)},e.prototype.clearAllTimeouts=function(){this.clearConnectTimeout(),this.clearAllClearTimeout()},e.prototype.clearConnectTimeout=function(){null!=this.connectTimeoutId&&(clearTimeout(this.connectTimeoutId),this.connectTimeoutId=void 0)},e.prototype.clearAllClearTimeout=function(){null!=this.allClearTimeoutId&&(clearTimeout(this.allClearTimeoutId),this.allClearTimeoutId=void 0)},e.prototype.dispatchEventOfType=function(e,t){var s=this;switch(e){case"close":this.onclose&&this.onclose(t);break;case"error":this.onerror&&this.onerror(t);break;case"message":this.onmessage&&this.onmessage(t);break;case"open":this.onopen&&this.onopen(t);break;case"down":this.ondown&&this.ondown(t);break;case"reopen":this.onreopen&&this.onreopen(t)}return e in this.listeners&&this.listeners[e].slice().forEach(function(e){return s.callListener(e,t)}),!t||!t.defaultPrevented},e.prototype.callListener=function(e,t){"function"==typeof e?e.call(this,t):e.handleEvent.call(this,t)},e.prototype.debugLog=function(e){this.options.debug&&console.log(e)},e.prototype.getTooManyFailedReconnectsMessage=function(){var e,t=this.options.maxReconnectAttempts;return"Failed to reconnect after "+t+" "+(e="attempt",1===t?e:e+"s")+". Closing permanently."},e.DEFAULT_OPTIONS={allClearResetTime:5e3,connectTimeout:5e3,debug:!1,minReconnectDelay:1e3,maxReconnectDelay:3e4,maxReconnectAttempts:Number.POSITIVE_INFINITY,reconnectBackoffFactor:1.5,shouldReconnect:function(){return!0},wsConstructor:void 0},e.CONNECTING=0,e.OPEN=1,e.CLOSING=2,e.CLOSED=3,e}();function n(){// Nothing.
}e.exports.default=s});//# sourceMappingURL=alchemy-websocket-provider-a2f83072.b413acec.js.map

//# sourceMappingURL=alchemy-websocket-provider-a2f83072.b413acec.js.map
