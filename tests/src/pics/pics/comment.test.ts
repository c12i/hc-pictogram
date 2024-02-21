import { assert, test } from "vitest";

import { runScenario, dhtSync } from '@holochain/tryorama';
import { ActionHash, SignedActionHashed, Delete, Record } from '@holochain/client';
import { decode } from '@msgpack/msgpack';
import { EntryRecord } from '@holochain-open-dev/utils';
import { cleanNodeDecoding } from '@holochain-open-dev/utils/dist/clean-node-decoding.js';
import { toPromise } from '@holochain-open-dev/stores';

import { Comment } from '../../../../ui/src/pics/pics/types.js';
import { sampleComment } from '../../../../ui/src/pics/pics/mocks.js';
import { setup } from './setup.js';

test('create Comment', async () => {
  await runScenario(async scenario => {
    const { alice, bob } = await setup(scenario);

    // Alice creates a Comment
    const comment: EntryRecord<Comment> = await alice.store.client.createComment(await sampleComment(alice.store.client));
    assert.ok(comment);
  });
});

test('create and read Comment', async () => {
  await runScenario(async scenario => {
    const { alice, bob } = await setup(scenario);

    const sample = await sampleComment(alice.store.client);

    // Alice creates a Comment
    const comment: EntryRecord<Comment> = await alice.store.client.createComment(sample);
    assert.ok(comment);

    // Wait for the created entry to be propagated to the other node.
    await dhtSync(
      [alice.player, bob.player],
      alice.player.cells[0].cell_id[0]
    );

    // Bob gets the created Comment
    const createReadOutput: EntryRecord<Comment> = await toPromise(bob.store.comments.get(comment.actionHash).entry);
    assert.deepEqual(sample, cleanNodeDecoding(createReadOutput.entry));
  });
});


test('create and delete Comment', async () => {
  await runScenario(async scenario => {
    const { alice, bob } = await setup(scenario);

    // Alice creates a Comment
    const comment: EntryRecord<Comment> = await alice.store.client.createComment(await sampleComment(alice.store.client));
    assert.ok(comment);
        
    // Alice deletes the Comment
    const deleteActionHash = await alice.store.client.deleteComment(comment.actionHash);
    assert.ok(deleteActionHash);

    // Wait for the created entry to be propagated to the other node.
    await dhtSync(
      [alice.player, bob.player],
      alice.player.cells[0].cell_id[0]
    );
        
    // Bob tries to get the deleted Comment
    const deletes: Array<SignedActionHashed<Delete>> = await toPromise(bob.store.comments.get(comment.actionHash).deletes);
    assert.equal(deletes.length, 1);
  });
});
