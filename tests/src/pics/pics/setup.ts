import { 
  AgentPubKey,
  EntryHash,
  NewEntryAction,
  ActionHash,
  Record,
  AppBundleSource,
  fakeActionHash,
  fakeAgentPubKey,
  fakeEntryHash,
  fakeDnaHash,
  AppAgentCallZomeRequest,
  AppAgentWebsocket,
  encodeHashToBase64 
} from '@holochain/client';
import { encode } from '@msgpack/msgpack';
import { Scenario } from '@holochain/tryorama';
import { EntryRecord } from '@holochain-open-dev/utils';
import { dirname } from 'path';
import { fileURLToPath } from 'url';
import { appPath } from '../../app-path.js';
import { PicsClient } from '../../../../ui/src/pics/pics/pics-client.js';
import { PicsStore } from '../../../../ui/src//pics/pics/pics-store.js';

export async function setup(scenario: Scenario) {
  // Add 2 players with the test hApp to the Scenario. The returned players
  // can be destructured.
  const [alice, bob] = await scenario.addPlayersWithApps([
    { appBundleSource: { path: appPath } },
    { appBundleSource: { path: appPath } },
  ]);

  // Shortcut peer discovery through gossip and register all agents in every
  // conductor of the scenario.
  await scenario.shareAllAgents();

  const aliceStore = new PicsStore(
    new PicsClient(alice.appAgentWs as any, 'pics', 'pics')
  );

  const bobStore = new PicsStore(
    new PicsClient(bob.appAgentWs as any, 'pics', 'pics')
  );

  // Shortcut peer discovery through gossip and register all agents in every
  // conductor of the scenario.
  await scenario.shareAllAgents();

  return {
    alice: {
      player: alice,
      store: aliceStore,
    },
    bob: {
      player: bob,
      store: bobStore,
    },
  };
}

