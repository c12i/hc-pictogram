import {
  AgentPubKeyMap,
  HashType,
  HoloHashMap,
  RecordBag,
  ZomeMock,
  decodeEntry,
  entryState,
  fakeCreateAction,
  fakeDeleteEntry,
  fakeEntry,
  fakeRecord,
  fakeUpdateEntry,
  hash,
  pickBy,
} from '@holochain-open-dev/utils';
import {
  ActionHash,
  AgentPubKey,
  AppAgentClient,
  Delete,
  EntryHash,
  Link,
  NewEntryAction,
  Record,
  SignedActionHashed,
  decodeHashFromBase64,
  fakeActionHash,
  fakeAgentPubKey,
  fakeDnaHash,
  fakeEntryHash,
} from '@holochain/client';

import { PicsClient } from './pics-client.js';
import { Comment } from './types.js';
import { Pic } from './types.js';

export class PicsZomeMock extends ZomeMock implements AppAgentClient {
  constructor(myPubKey?: AgentPubKey) {
    super('pics_test', 'pics', myPubKey);
  }

  /** Pic */
  pics = new HoloHashMap<
    ActionHash,
    {
      deletes: Array<SignedActionHashed<Delete>>;
      revisions: Array<Record>;
    }
  >();

  async create_pic(pic: Pic): Promise<Record> {
    const entryHash = hash(pic, HashType.ENTRY);
    const record = await fakeRecord(
      await fakeCreateAction(entryHash),
      fakeEntry(pic)
    );

    this.pics.set(record.signed_action.hashed.hash, {
      deletes: [],
      revisions: [record],
    });

    return record;
  }

  async get_pic(picHash: ActionHash): Promise<Record | undefined> {
    const pic = this.pics.get(picHash);
    return pic ? pic.revisions[0] : undefined;
  }

  async get_all_deletes_for_pic(
    picHash: ActionHash
  ): Promise<Array<SignedActionHashed<Delete>> | undefined> {
    const pic = this.pics.get(picHash);
    return pic ? pic.deletes : undefined;
  }

  async get_oldest_delete_for_pic(
    picHash: ActionHash
  ): Promise<SignedActionHashed<Delete> | undefined> {
    const pic = this.pics.get(picHash);
    return pic ? pic.deletes[0] : undefined;
  }

  async delete_pic(original_pic_hash: ActionHash): Promise<ActionHash> {
    const record = await fakeRecord(await fakeDeleteEntry(original_pic_hash));

    this.pics
      .get(original_pic_hash)
      .deletes.push(record.signed_action as SignedActionHashed<Delete>);

    return record.signed_action.hashed.hash;
  }

  /** Comment */
  comments = new HoloHashMap<
    ActionHash,
    {
      deletes: Array<SignedActionHashed<Delete>>;
      revisions: Array<Record>;
    }
  >();

  commentsForPic = new HoloHashMap<ActionHash, Link[]>();

  async create_comment(comment: Comment): Promise<Record> {
    const entryHash = hash(comment, HashType.ENTRY);
    const record = await fakeRecord(
      await fakeCreateAction(entryHash),
      fakeEntry(comment)
    );

    this.comments.set(record.signed_action.hashed.hash, {
      deletes: [],
      revisions: [record],
    });

    const existingPicHash = this.commentsForPic.get(comment.pic_hash) || [];
    this.commentsForPic.set(comment.pic_hash, [
      ...existingPicHash,
      {
        target: record.signed_action.hashed.hash,
        author: this.myPubKey,
        timestamp: Date.now() * 1000,
        zome_index: 0,
        link_type: 0,
        tag: new Uint8Array(),
        create_link_hash: await fakeActionHash(),
      },
    ]);

    return record;
  }

  async get_comment(commentHash: ActionHash): Promise<Record | undefined> {
    const comment = this.comments.get(commentHash);
    return comment ? comment.revisions[0] : undefined;
  }

  async get_all_deletes_for_comment(
    commentHash: ActionHash
  ): Promise<Array<SignedActionHashed<Delete>> | undefined> {
    const comment = this.comments.get(commentHash);
    return comment ? comment.deletes : undefined;
  }

  async get_oldest_delete_for_comment(
    commentHash: ActionHash
  ): Promise<SignedActionHashed<Delete> | undefined> {
    const comment = this.comments.get(commentHash);
    return comment ? comment.deletes[0] : undefined;
  }

  async delete_comment(original_comment_hash: ActionHash): Promise<ActionHash> {
    const record = await fakeRecord(
      await fakeDeleteEntry(original_comment_hash)
    );

    this.comments
      .get(original_comment_hash)
      .deletes.push(record.signed_action as SignedActionHashed<Delete>);

    return record.signed_action.hashed.hash;
  }

  async get_comments_for_pic(picHash: ActionHash): Promise<Array<Link>> {
    return this.commentsForPic.get(picHash) || [];
  }

  async get_my_pics(author: AgentPubKey): Promise<Array<Link>> {
    const records: Record[] = Array.from(this.pics.values())
      .map(r => r.revisions[r.revisions.length - 1])
      .filter(
        r =>
          r.signed_action.hashed.content.author.toString() === author.toString()
      );
    return Promise.all(
      records.map(async record => ({
        target: record.signed_action.hashed.hash,
        author: record.signed_action.hashed.content.author,
        timestamp: record.signed_action.hashed.content.timestamp,
        zome_index: 0,
        link_type: 0,
        tag: new Uint8Array(),
        create_link_hash: await fakeActionHash(),
      }))
    );
  }
}

export async function samplePic(
  client: PicsClient,
  partialPic: Partial<Pic> = {}
): Promise<Pic> {
  return {
    ...{
      image: await fakeEntryHash(),
      story: 'Lorem ipsum 2',
    },
    ...partialPic,
  };
}

export async function sampleComment(
  client: PicsClient,
  partialComment: Partial<Comment> = {}
): Promise<Comment> {
  return {
    ...{
      pic_hash:
        partialComment.pic_hash ||
        (await client.createPic(await samplePic(client))).actionHash,
      text: 'Lorem ipsum 2',
    },
    ...partialComment,
  };
}
