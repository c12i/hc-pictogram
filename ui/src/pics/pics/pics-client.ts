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
  
}
