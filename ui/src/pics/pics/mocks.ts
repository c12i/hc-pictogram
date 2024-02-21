import { Pic } from './types.js';

import {
  AgentPubKeyMap,
  decodeEntry,
  fakeEntry,
  fakeCreateAction,
  fakeUpdateEntry,
  fakeDeleteEntry,
  fakeRecord,
  pickBy,
  ZomeMock,
  RecordBag,
  entryState,
  HoloHashMap,
  HashType,
  hash
} from "@holochain-open-dev/utils";
import {
  decodeHashFromBase64,
  NewEntryAction,
  AgentPubKey,
  ActionHash,
  EntryHash,
  Delete,
  AppAgentClient,
  fakeAgentPubKey,
  fakeDnaHash,
  Link,
  fakeActionHash,
  SignedActionHashed,
  fakeEntryHash,
  Record,
} from "@holochain/client";
import { PicsClient } from './pics-client.js'

export class PicsZomeMock extends ZomeMock implements AppAgentClient {
  constructor(
    myPubKey?: AgentPubKey
  ) {
    super("pics_test", "pics", myPubKey);
  }
  /** Pic */
  pics = new HoloHashMap<ActionHash, {
    deletes: Array<SignedActionHashed<Delete>>;
    revisions: Array<Record>;
  }>();

  async create_pic(pic: Pic): Promise<Record> {
    const entryHash = hash(pic, HashType.ENTRY);
    const record = await fakeRecord(await fakeCreateAction(entryHash), fakeEntry(pic));
    
    this.pics.set(record.signed_action.hashed.hash, {
      deletes: [],
      revisions: [record]
    });
  

    return record;
  }
  
  async get_pic(picHash: ActionHash): Promise<Record | undefined> {
    const pic = this.pics.get(picHash);
    return pic ? pic.revisions[0] : undefined;
  }
  
  async get_all_deletes_for_pic(picHash: ActionHash): Promise<Array<SignedActionHashed<Delete>> | undefined> {
    const pic = this.pics.get(picHash);
    return pic ? pic.deletes : undefined;
  }

  async get_oldest_delete_for_pic(picHash: ActionHash): Promise<SignedActionHashed<Delete> | undefined> {
    const pic = this.pics.get(picHash);
    return pic ? pic.deletes[0] : undefined;
  }
  async delete_pic(original_pic_hash: ActionHash): Promise<ActionHash> {
    const record = await fakeRecord(await fakeDeleteEntry(original_pic_hash));
    
    this.pics.get(original_pic_hash).deletes.push(record.signed_action as SignedActionHashed<Delete>);
    
    return record.signed_action.hashed.hash;
  }

  

}

export async function samplePic(client: PicsClient, partialPic: Partial<Pic> = {}): Promise<Pic> {
    return {
        ...{
          image: (await fakeEntryHash()),
          story: "Lorem ipsum 2",
        },
        ...partialPic
    };
}
