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
}
