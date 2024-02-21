import { assert, test } from "vitest";

import { runScenario, dhtSync } from '@holochain/tryorama';
import { ActionHash, SignedActionHashed, Delete, Record } from '@holochain/client';
import { decode } from '@msgpack/msgpack';
import { EntryRecord } from '@holochain-open-dev/utils';
import { cleanNodeDecoding } from '@holochain-open-dev/utils/dist/clean-node-decoding.js';
import { toPromise } from '@holochain-open-dev/stores';

import { Pic } from '../../../../ui/src/pics/pics/types.js';
import { samplePic } from '../../../../ui/src/pics/pics/mocks.js';
import { setup } from './setup.js';

test('create Pic', async () => {
  await runScenario(async scenario => {
    const { alice, bob } = await setup(scenario);

    // Alice creates a Pic
    const pic: EntryRecord<Pic> = await alice.store.client.createPic(await samplePic(alice.store.client));
    assert.ok(pic);
  });
});

test('create and read Pic', async () => {
  await runScenario(async scenario => {
    const { alice, bob } = await setup(scenario);

    const sample = await samplePic(alice.store.client);

    // Alice creates a Pic
    const pic: EntryRecord<Pic> = await alice.store.client.createPic(sample);
    assert.ok(pic);

    // Wait for the created entry to be propagated to the other node.
    await dhtSync(
      [alice.player, bob.player],
      alice.player.cells[0].cell_id[0]
    );

    // Bob gets the created Pic
    const createReadOutput: EntryRecord<Pic> = await toPromise(bob.store.pics.get(pic.actionHash).entry);
    assert.deepEqual(sample, cleanNodeDecoding(createReadOutput.entry));
  });
});


test('create and delete Pic', async () => {
  await runScenario(async scenario => {
    const { alice, bob } = await setup(scenario);

    // Alice creates a Pic
    const pic: EntryRecord<Pic> = await alice.store.client.createPic(await samplePic(alice.store.client));
    assert.ok(pic);
        
    // Alice deletes the Pic
    const deleteActionHash = await alice.store.client.deletePic(pic.actionHash);
    assert.ok(deleteActionHash);

    // Wait for the created entry to be propagated to the other node.
    await dhtSync(
      [alice.player, bob.player],
      alice.player.cells[0].cell_id[0]
    );
        
    // Bob tries to get the deleted Pic
    const deletes: Array<SignedActionHashed<Delete>> = await toPromise(bob.store.pics.get(pic.actionHash).deletes);
    assert.equal(deletes.length, 1);
  });
});
