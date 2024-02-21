import { Comment } from './types.js';

import { Pic } from './types.js';

import { 
  SignedActionHashed,
  CreateLink,
  Link,
  DeleteLink,
  Delete,
  AppAgentClient, 
  Record, 
  ActionHash, 
  EntryHash, 
  AgentPubKey,
} from '@holochain/client';
import { isSignalFromCellWithRole, EntryRecord, ZomeClient } from '@holochain-open-dev/utils';

import { PicsSignal } from './types.js';

export class PicsClient extends ZomeClient<PicsSignal> {
  constructor(public client: AppAgentClient, public roleName: string, public zomeName = 'pics') {
    super(client, roleName, zomeName);
  }
  /** Pic */

  async createPic(pic: Pic): Promise<EntryRecord<Pic>> {
    const record: Record = await this.callZome('create_pic', pic);
    return new EntryRecord(record);
  }
  
  async getPic(picHash: ActionHash): Promise<EntryRecord<Pic> | undefined> {
    const record: Record = await this.callZome('get_pic', picHash);
    return record ? new EntryRecord(record) : undefined;
  }

  deletePic(originalPicHash: ActionHash): Promise<ActionHash> {
    return this.callZome('delete_pic', originalPicHash);
  }

  getAllDeletesForPic(originalPicHash: ActionHash): Promise<Array<SignedActionHashed<Delete>>> {
    return this.callZome('get_all_deletes_for_pic', originalPicHash);
  }

  getOldestDeleteForPic(originalPicHash: ActionHash): Promise<SignedActionHashed<Delete> | undefined> {
    return this.callZome('get_oldest_delete_for_pic', originalPicHash);
  }
  /** Comment */

  async createComment(comment: Comment): Promise<EntryRecord<Comment>> {
    const record: Record = await this.callZome('create_comment', comment);
    return new EntryRecord(record);
  }
  
  async getComment(commentHash: ActionHash): Promise<EntryRecord<Comment> | undefined> {
    const record: Record = await this.callZome('get_comment', commentHash);
    return record ? new EntryRecord(record) : undefined;
  }

  deleteComment(originalCommentHash: ActionHash): Promise<ActionHash> {
    return this.callZome('delete_comment', originalCommentHash);
  }

  getAllDeletesForComment(originalCommentHash: ActionHash): Promise<Array<SignedActionHashed<Delete>>> {
    return this.callZome('get_all_deletes_for_comment', originalCommentHash);
  }

  getOldestDeleteForComment(originalCommentHash: ActionHash): Promise<SignedActionHashed<Delete> | undefined> {
    return this.callZome('get_oldest_delete_for_comment', originalCommentHash);
  }
  
  async getCommentsForPic(picHash: ActionHash): Promise<Array<Link>> {
    return this.callZome('get_comments_for_pic', picHash);
  }

  async getDeletedCommentsForPic(picHash: ActionHash): Promise<Array<[SignedActionHashed<CreateLink>, SignedActionHashed<DeleteLink>[]]>> {
    return this.callZome('get_deleted_comments_for_pic', picHash);
  }

  /** My Pics */

  async getMyPics(author: AgentPubKey): Promise<Array<Link>> {
    return this.callZome('get_my_pics', author);
  }

}
