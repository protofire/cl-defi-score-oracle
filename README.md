# Chainlink: DefiScore Oracles
DefiScore is an Open Framework for Evaluating DeFi Protocols, a methodology for assessing risk in permissionless lending platforms.
Scores are relative and calculated from eight attributes across three categories: smart contract risk (50%), financial risk (35%), & regulatory risk (15%)

This MVP creates an External Adapter that returns the score of a given asset on a lending platform, and a Consumer smart contract which will request the score on demand.

Parameters:
- Assets: `dai` | `sai` | `usdc` | `eth` | `wbtc` | `rep` | `zrx` | `bat` | `tusd` | `usdt`
- Platform: `compund` | `dydx` | `fulcrom` | `nuo` | `ddex`

**Note:** The following steps require some basic knowledge about the Chainlink stack: how to run a Chainlink Node, create Jobs, Bridges and External Initiators in the node, and deploy External Adapter functions. It is advisable to start by reading the [Chainlink Docs](https://docs.chain.link).

### Prerequisites
- Running a Chainlink Node

### Steps for running this

#### 1. Deploy External Adapter function

  - Follow the steps from https://chainlinkadapters.com/guides/run-external-adapter-on-gcp for deploying the `external-adapter` as a Cloud Function in GCP.

#### 2. Create bridge for the External Adapter

  Reference docs: https://docs.chain.link/docs/node-operators

  External adapters are added to the Chainlink node by creating a bridge type. Bridges define the tasks' name and URL of the external adapter. When a task type is received, and it is not one of the core adapters, the node will search for a bridge type with that name, utilizing the bridge to your external adapter.

  **Note:** Bridge and task type names are case insensitive.

  To create a bridge on the node, you can navigate to the "Create Bridge" menu item in the GUI. From there, you will specify a Name, URL and, optionally, the number of Confirmations for the bridge.

  **Note:** Bridge Name should be unique to the local node and the Bridge URL should be the URL of your external adapter, whether local or on a separate machine.

#### 3. Create job which uses the bridge

Create a job in the node like the following

```javascript
  {
    "initiators": [
      { "type": "runLog" }
    ],
    "tasks": [
      { "type": "BRIDGE NAME FROM STEP 2" },
      { "type": "ethtx" }
    ]
  }
```

#### 4. Deploy Consumer Smart Contracts

Within the `oracle` directory:

```bash
npm i
```

Create a `.env` file, copy content of `.env.example` and update `RPC_URL` with your Infura PROJECT_ID, `PK` with your account private key, `ORACLE` with the address of the contract deployed on step #2 and `DEFI_SCORE_JOB_ID` with the one you got from step #3.

```bash
npm run migrate:kovan
```

Fund `DefiScore` contract using `https://kovan.chain.link/`

#### 5. Execute oracle method

- DefiScore contract
```bash
eth abi:add DefiScore PATH_TO_BUILD_FOLDER/contracts/DefiScore.json
eth contract:send --kovan DefiScore@DEFI_SCORE_CONTRACT_ADDRESS 'requestDefiScore("dydx", "eth")' --pk=YOUR_ADDRESS_PK
```

#### 6. Check out the results

`DefiScore` contract emits the event `DefiScore(bytes32 indexed requestId, uint256 timestamp, uint16 openSource, uint16 audited, uint16 verifyed, uint16 safe, uint16 score, uint16 iquidityIndex, uint16 collateralIndex)` when the request to the External Adapter is fulfilled so go to https://kovan.etherscan.io/address/DEFI_SCORE_CONTRACT_ADDRESS#events and check the event was emmited.
