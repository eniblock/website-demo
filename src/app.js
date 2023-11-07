import { createAuth0Client } from '@auth0/auth0-spa-js';
import { Eniblock, UnsafeStorage, urlConfig } from '@eniblock/sdk';
import * as https from 'https'; 

const domain = window.location.hostname;
let auth0Client = null;
let sdk = null;
let auth0Domain, auth0ClientId, auth0CookieDomain, eniblockAppId, eniblockContract, eniblockTokenId, eniblockMintDomain;

switch (domain) {
  case 'eniblock.webflow.io':
    auth0Domain = 'testing-eniblock-sdk.eu.auth0.com';
    auth0ClientId = 'BpfQk1mCjnLak5e42iHX24feDnXRG1bq';
    auth0CookieDomain = '.eniblock.com';    

    urlConfig.API_BASE_URL = "https://testing.sdk.eniblock.com";

    eniblockAppId = 'intelligent-panini-1751'; 
    eniblockContract = '0x88D7275D31E55d6a71a516B49b3DcD3282eE8845';
    eniblockTokenId = '1';
    eniblockMintDomain = 'testing.demo.eniblock.com';
    break;

  default:
    auth0Domain = 'eniblock-sdk.eu.auth0.com';
    auth0ClientId = 'kQh2yBn9gIIvDmFJ2LIHoPgK7PcDPbXG';
    auth0CookieDomain = '.eniblock.com';    

    eniblockAppId = 'bold-rosalind-5706';
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

const mint = async () => {
  const loaderEl = document.getElementById("demo-loader");
  const descriptionEl = document.getElementById("demo-description");
  const textStartEl = document.getElementById("demo-text-start");
  const textEndEl = document.getElementById("demo-text-end");
  const linkEl = document.getElementById("demo-link");
  const buttonEl = document.getElementById("demo-button");

  descriptionEl.style.display = 'none';
  textStartEl.style.display = 'none';
  loaderEl.style.display = 'grid';

  const isAuthenticated = await auth0Client.isAuthenticated();

  if (!isAuthenticated) {
    await login();
  }

  let wallet, account;

  try {
    await sdk.wallet.destroy();
    wallet = await sdk.wallet.instantiate();
    account = await wallet.account.instantiate("My first account");
  } catch (error) {
    console.log(error);
  }

  const walletAddress = await account.getAddress();

  console.log(`Account Details:
  - Address: ${await account.getAddress()}
  - Alias: ${account.alias}
  - Balance: ${(await account.getNativeBalance()).balance}
  - Public Key: ${await account.getPublicKey()}
  - Creation Date: ${account.creationDate}`);

  var options = {
    host: eniblockMintDomain,
    port: 443,
    path: '/backend/functions/mint?contract=' + eniblockContract + '&to=' + walletAddress + '&tokenId=' + eniblockTokenId + '&amount=1',
    method: 'GET'
  };

  var req = https.request(options, function(res) {
    res.setEncoding('utf8');
    res.on('data', async function (chunk) {
      const hash = JSON.parse(JSON.parse(chunk).body).hash;

      console.log(hash);

      const provider = await sdk.getProvider();
      await provider.waitForTransaction(hash, 2);

      buttonEl.innerHTML = 'Learn more';
      buttonEl.href = urlConfig.API_BASE_URL + '/docs';
      linkEl.href = 'https://testnets.opensea.io/' + walletAddress;
      buttonEl.removeEventListener("click", mint);

      loaderEl.style.display = 'none';
      textEndEl.style.display = 'block';
      descriptionEl.style.display = 'grid';      
    });
  });

  req.on('error', error => {
    console.error(`Error on Get Request --> ${error}`)
  })
  
  req.end(); 
};