import { ActionCommittedSignal } from '@holochain-open-dev/utils';
import {
  ActionHash,
  AgentPubKey,
  Create,
  CreateLink,
  Delete,
  DeleteLink,
  DnaHash,
  EntryHash,
  Record,
  SignedActionHashed,
  Update,
} from '@holochain/client';

export type PicsSignal = ActionCommittedSignal<EntryTypes, LinkTypes>;

export type EntryTypes =
  | ({ type: 'Comment' } & Comment)
  | ({ type: 'Pic' } & Pic);

export type LinkTypes = string;

export interface Pic {
  image: EntryHash;

  story: string;
}

export interface Comment {
  pic_hash: ActionHash;

  text: string;
}
