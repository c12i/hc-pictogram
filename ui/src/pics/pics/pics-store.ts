import {
  AsyncReadable,
  allRevisionsOfEntryStore,
  collectionStore,
  deletedLinksStore,
  deletesForEntryStore,
  immutableEntryStore,
  latestVersionOfEntryStore,
  liveLinksStore,
  pipe,
} from '@holochain-open-dev/stores';
import {
  EntryRecord,
  HashType,
  LazyHoloHashMap,
  retype,
  slice,
} from '@holochain-open-dev/utils';
import {
  ActionHash,
  AgentPubKey,
  EntryHash,
  NewEntryAction,
  Record,
} from '@holochain/client';

import { PicsClient } from './pics-client.js';
import { Comment } from './types.js';
import { Pic } from './types.js';

export class PicsStore {
  constructor(public client: PicsClient) {}

  /** Pic */

  pics = new LazyHoloHashMap((picHash: ActionHash) => ({
    entry: immutableEntryStore(() => this.client.getPic(picHash)),
    deletes: deletesForEntryStore(this.client, picHash, () =>
      this.client.getAllDeletesForPic(picHash)
    ),
    comments: {
      live: pipe(
        liveLinksStore(
          this.client,
          picHash,
          () => this.client.getCommentsForPic(picHash),
          'PicToComments'
        ),
        links =>
          slice(
            this.comments,
            links.map(l => l.target)
          )
      ),
      deleted: pipe(
        deletedLinksStore(
          this.client,
          picHash,
          () => this.client.getDeletedCommentsForPic(picHash),
          'PicToComments'
        ),
        links =>
          slice(
            this.comments,
            links.map(l => l[0].hashed.content.target_address)
          )
      ),
    },
  }));

  /** Comment */

  comments = new LazyHoloHashMap((commentHash: ActionHash) => ({
    entry: immutableEntryStore(() => this.client.getComment(commentHash)),
    deletes: deletesForEntryStore(this.client, commentHash, () =>
      this.client.getAllDeletesForComment(commentHash)
    ),
  }));

  /** My Pics */

  myPics = new LazyHoloHashMap((author: AgentPubKey) =>
    pipe(
      collectionStore(
        this.client,
        () => this.client.getMyPics(author),
        'MyPics'
      ),
      myPics =>
        slice(
          this.pics,
          myPics.map(l => l.target)
        )
    )
  );
}
