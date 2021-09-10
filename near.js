const homedir = require("os").homedir();
const fs = require("fs");
const path = require("path");
const nearApi = require('near-api-js');
const {getConfig} = require('./config');

const nearConfig = getConfig(process.env.NODE_ENV || 'development');
const accountId = process.env.NEAR_ACCOUNT_ID || 'your_name.testnet';
const CREDENTIALS_DIR = ".near-credentials/testnet/";

module.exports = {
  NearView: async function (contract, operation, parameters) {
    const nearRpc = new nearApi.providers.JsonRpcProvider(nearConfig.nodeUrl);
    const account = new nearApi.Account({ provider: nearRpc });

    const view = await account.viewFunction(
      contract,
      operation,
      parameters
    );

    return view;
  },

  NearCall: async function (contract, operation, parameters) {
    const privateKey = await GetPrivateKey(accountId);

    const keyPair = nearApi.utils.KeyPair.fromString(privateKey);
    const keyStore = new nearApi.keyStores.InMemoryKeyStore();
    keyStore.setKey("default", accountId, keyPair);

    const near = await nearApi.connect({
      networkId: "default",
      deps: {keyStore},
      masterAccount: accountId,
      nodeUrl: nearConfig.nodeUrl
    });

    const account = await near.account(accountId);

    const call = await account.functionCall({
      contractId: contract,
      methodName: operation,
      args: parameters,
      gas: '10000000000000',
      attachedDeposit: '0'
    });

    try {
      if (call["status"].hasOwnProperty("SuccessValue")) {
        let logs = [];
        call["receipts_outcome"].map(receipts_outcome => {
          if (receipts_outcome["outcome"]["logs"].length)
            receipts_outcome["outcome"]["logs"].map(log => logs.push(log))
        });
        return `Successful operation: ${operation}!\n\r${logs.join("\n\r")}`;
      } else {
        return `Failed operation: ${operation}`;
      }
    } catch (e) {
      return "Call processed with unknown result";
    }
  }
};

const GetPrivateKey = async function (accountId) {
  const credentialsPath = path.join(homedir, CREDENTIALS_DIR);
  const keyPath = credentialsPath + accountId + '.json';
  try {
    const credentials = JSON.parse(fs.readFileSync(keyPath));
    return (credentials.private_key);
  } catch (e) {
    throw new Error("Key not found for account " + keyPath + ". Error: " + e.message);
  }
};
