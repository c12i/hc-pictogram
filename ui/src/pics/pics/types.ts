import { 
  Record, 
  ActionHash, 
  DnaHash,
  SignedActionHashed,
  EntryHash, 
  AgentPubKey,
  Create,
  Update,
  Delete,
  CreateLink,
  DeleteLink
} from '@holochain/client';
import { ActionCommittedSignal } from '@holochain-open-dev/utils';

export type PicsSignal = ActionCommittedSignal<EntryTypes, LinkTypes>;

export type EntryTypes =
 | ({ type: 'Comment'; } & Comment)
 | ({  type: 'Pic'; } & Pic);

export type LinkTypes = string;



export interface Pic { 
  image: EntryHash;

  story: string;
}




export interface Comment { 
  pic_hash: ActionHash;

  text: string;
}

