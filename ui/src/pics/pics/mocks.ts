import { Comment } from './types.js';

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
  /** Comment */
  comments = new HoloHashMap<ActionHash, {
    deletes: Array<SignedActionHashed<Delete>>;
    revisions: Array<Record>;
  }>();
  commentsForPic = new HoloHashMap<ActionHash, Link[]>();

  async create_comment(comment: Comment): Promise<Record> {
    const entryHash = hash(comment, HashType.ENTRY);
    const record = await fakeRecord(await fakeCreateAction(entryHash), fakeEntry(comment));
    
    this.comments.set(record.signed_action.hashed.hash, {
      deletes: [],
      revisions: [record]
    });
  
    const existingPicHash = this.commentsForPic.get(comment.pic_hash) || [];
    this.commentsForPic.set(comment.pic_hash, [...existingPicHash, { 
      target: record.signed_action.hashed.hash, 
      author: this.myPubKey,
      timestamp: Date.now() * 1000,
      zome_index: 0,
      link_type: 0,
      tag: new Uint8Array(),
      create_link_hash: await fakeActionHash()
    }]);

    return record;
  }
  
  async get_comment(commentHash: ActionHash): Promise<Record | undefined> {
    const comment = this.comments.get(commentHash);
    return comment ? comment.revisions[0] : undefined;
  }
  
  async get_all_deletes_for_comment(commentHash: ActionHash): Promise<Array<SignedActionHashed<Delete>> | undefined> {
    const comment = this.comments.get(commentHash);
    return comment ? comment.deletes : undefined;
  }

  async get_oldest_delete_for_comment(commentHash: ActionHash): Promise<SignedActionHashed<Delete> | undefined> {
    const comment = this.comments.get(commentHash);
    return comment ? comment.deletes[0] : undefined;
  }
  async delete_comment(original_comment_hash: ActionHash): Promise<ActionHash> {
    const record = await fakeRecord(await fakeDeleteEntry(original_comment_hash));
    
    this.comments.get(original_comment_hash).deletes.push(record.signed_action as SignedActionHashed<Delete>);
    
    return record.signed_action.hashed.hash;
  }

  
  async get_comments_for_pic(picHash: ActionHash): Promise<Array<Link>> {
    return this.commentsForPic.get(picHash) || [];
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

export async function sampleComment(client: PicsClient, partialComment: Partial<Comment> = {}): Promise<Comment> {
    return {
        ...{
          pic_hash: partialComment.pic_hash || (await client.createPic(await samplePic(client))).actionHash,
          text: "Lorem ipsum 2",
        },
        ...partialComment
    };
}
