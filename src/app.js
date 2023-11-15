import { createAuth0Client } from '@auth0/auth0-spa-js';
import { Eniblock, UnsafeStorage, urlConfig } from '@eniblock/sdk';
import * as https from 'https'; 

const domain = window.location.hostname;
let auth0Client = sdk = null;
let wallet, account;
let auth0Domain, auth0ClientId, auth0CookieDomain, eniblockAppId, eniblockContract, eniblockTokenId, eniblockMintDomain;

switch (domain) {
  case 'eniblock.webflow.io':
    auth0Domain = 'testing-eniblock-sdk.eu.auth0.com';
    auth0ClientId = 'BpfQk1mCjnLak5e42iHX24feDnXRG1bq';
    auth0CookieDomain = '.eniblock.com';    

    urlConfig.API_BASE_URL = "https://testing.sdk.eniblock.com";

    eniblockAppId = 'eniblock-website'; 
    eniblockContract = '0x88D7275D31E55d6a71a516B49b3DcD3282eE8845';
    eniblockTokenId = '1';
    eniblockMintDomain = 'testing.demo.eniblock.com';
    break;

  default:
    auth0Domain = 'eniblock-sdk.eu.auth0.com';
    auth0ClientId = 'kQh2yBn9gIIvDmFJ2LIHoPgK7PcDPbXG';
    auth0CookieDomain = '.eniblock.com';    

    eniblockAppId = 'eniblock-website';
    eniblockContract = '0x88D7275D31E55d6a71a516B49b3DcD3282eE8845';
    eniblockTokenId = '1';
    eniblockMintDomain = 'demo.eniblock.com';
    break;
}

const configureClient = async () => {
  auth0Client = await createAuth0Client({
    domain: auth0Domain,
    clientId: auth0ClientId,
  	cookieDomain: auth0CookieDomain
  });
};

window.onload = async () => {
  await configureClient();

  sdk = new Eniblock({
    appId: eniblockAppId,
    accessTokenProvider: async () => { 
      const token = await auth0Client.getTokenSilently({detailedResponse: true});

      return token.id_token;      
     },
    storageItems: [{ alias: "UnsafeStorage", storage: new UnsafeStorage() }],    
  });

  const buttonEl = document.getElementById("demo-button");  
  buttonEl.addEventListener("click", mint);    
}

const login = async () => {
  await auth0Client.loginWithPopup({
    authorizationParams: {
      redirect_uri: window.location.origin
    }
  });
};

const createWallet = async () => {
  wallet = await sdk.wallet.instantiate();
  account = await wallet.account.instantiate("My first account");
}

const mint = async () => {  
  var start = window.performance.now();

  const loaderEl = document.getElementById("demo-loader");
  const textEl = document.getElementById("demo-text");
  const buttonEl = document.getElementById("demo-button");
  const buttonTextEl = document.getElementById("demo-button-text");

  buttonEl.removeEventListener("click", mint);
  buttonTextEl.style.display = 'none';
  loaderEl.style.display = 'flex';

  const isAuthenticated = await auth0Client.isAuthenticated();

  if (!isAuthenticated) {
    await login();
  }

  textEl.innerHTML = 'Creating your wallet in progress...';

  var startWallet = window.performance.now();

  try {
    await createWallet();
  } catch (error) {
    await sdk.wallet.destroy();
    await createWallet();
  }

  const walletAddress = await account.getAddress();

  console.log(walletAddress);

  var endWallet = window.performance.now();
  var timeWallet = endWallet - startWallet;

  console.log(timeWallet);

  textEl.innerHTML = 'Wallet created !<br />Minting in progress...';

  var options = {
    host: eniblockMintDomain,
    port: 443,
    path: '/backend/functions/mint?contract=' + eniblockContract + '&to=' + walletAddress + '&tokenId=' + eniblockTokenId + '&amount=1',
    method: 'GET'
  };

  var startMint = window.performance.now();

  var req = https.request(options, function(res) {
    res.setEncoding('utf8');
    res.on('data', async function (chunk) {
      const hash = JSON.parse(JSON.parse(chunk).body).hash;

      console.log(hash);

      const provider = await sdk.getProvider();
      await provider.waitForTransaction(hash);

      buttonTextEl.innerHTML = 'Learn more';
      buttonEl.href = urlConfig.API_BASE_URL + '/docs';
      const link = 'https://testnets.opensea.io/assets/mumbai/' + eniblockContract + '/' + eniblockTokenId;

      loaderEl.style.display = 'none';
      buttonTextEl.style.display = 'flex';  
      
      var endMint = window.performance.now();
      var timeMint = endMint - startMint;

      console.log(timeMint);

      var end = window.performance.now();
      var time = end - start;
      
      console.log(time);

      textEl.innerHTML = '<a href="' + link + '" target="_blank">Your wallet is ready!<br />Check your <span class="text-gradient__teal">NFT</span></a>.';
    });
  });

  req.on('error', error => {
    console.error(`Error on Get Request --> ${error}`)
  })
  
  req.end(); 
};