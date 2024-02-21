import { 
  collectionStore, 
  liveLinksStore, 
  deletedLinksStore, 
  allRevisionsOfEntryStore,
  latestVersionOfEntryStore, 
  immutableEntryStore, 
  deletesForEntryStore, 
  AsyncReadable,
  pipe
} from "@holochain-open-dev/stores";
import { slice, HashType, retype, EntryRecord, LazyHoloHashMap } from "@holochain-open-dev/utils";
import { NewEntryAction, Record, ActionHash, EntryHash, AgentPubKey } from '@holochain/client';

import { PicsClient } from './pics-client.js';

export class PicsStore {

  constructor(public client: PicsClient) {}
  
}
