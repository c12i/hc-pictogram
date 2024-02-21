import { assert, test } from "vitest";

import { runScenario, dhtSync } from '@holochain/tryorama';
import { ActionHash, Record, EntryHash } from '@holochain/client';
import { decode } from '@msgpack/msgpack';
import { EntryRecord } from '@holochain-open-dev/utils';
import { toPromise } from '@holochain-open-dev/stores';

import { Pic } from '../../../../ui/src/pics/pics/types.js';
import { samplePic } from '../../../../ui/src/pics/pics/mocks.js';
import { setup } from './setup.js';

test('create a Pic and get my pics', async () => {
  await runScenario(async scenario => {
    const { alice, bob } = await setup(scenario);

    // Bob gets my pics
    let collectionOutput = await toPromise(bob.store.myPics.get(alice.player.agentPubKey));
    assert.equal(collectionOutput.size, 0);

    // Alice creates a Pic
    const pic: EntryRecord<Pic> = await alice.store.client.createPic(await samplePic(alice.store.client));
    assert.ok(pic);
    
    await dhtSync(
      [alice.player, bob.player],
      alice.player.cells[0].cell_id[0]
    );
    
    // Bob gets my pics again
    collectionOutput = await toPromise(bob.store.myPics.get(alice.player.agentPubKey));
    assert.equal(collectionOutput.size, 1);
    assert.deepEqual(pic.actionHash, Array.from(collectionOutput.keys())[0]);    
  });
});

