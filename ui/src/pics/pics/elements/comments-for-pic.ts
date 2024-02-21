import {
  hashProperty,
  renderAsyncStatus,
  sharedStyles,
  wrapPathInSvg,
} from '@holochain-open-dev/elements';
import '@holochain-open-dev/elements/dist/elements/display-error.js';
import { pipe, subscribe } from '@holochain-open-dev/stores';
import { EntryRecord, slice } from '@holochain-open-dev/utils';
import { ActionHash, AgentPubKey, EntryHash, Record } from '@holochain/client';
import { consume } from '@lit/context';
import { localized, msg } from '@lit/localize';
import { mdiInformationOutline } from '@mdi/js';
import '@shoelace-style/shoelace/dist/components/icon/icon.js';
import '@shoelace-style/shoelace/dist/components/spinner/spinner.js';
import { LitElement, html } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';

import { picsStoreContext } from '../context.js';
import { PicsStore } from '../pics-store.js';
import { Comment } from '../types.js';
import './comment-summary.js';

/**
 * @element comments-for-pic
 */
@localized()
@customElement('comments-for-pic')
export class CommentsForPic extends LitElement {
  // REQUIRED. The PicHash for which the Comments should be fetched
  @property(hashProperty('pic-hash'))
  picHash!: ActionHash;

  /**
   * @internal
   */
  @consume({ context: picsStoreContext, subscribe: true })
  picsStore!: PicsStore;

  renderList(hashes: Array<ActionHash>) {
    if (hashes.length === 0)
      return html` <div class="column center-content" style="gap: 16px;">
        <sl-icon
          style="color: grey; height: 64px; width: 64px;"
          .src=${wrapPathInSvg(mdiInformationOutline)}
        ></sl-icon>
        <span class="placeholder"
          >${msg('No comments found for this pic')}</span
        >
      </div>`;

    return html`
      <div style="display: flex; flex-direction: column">
        ${hashes.map(
          hash => html`<comment-summary .commentHash=${hash}></comment-summary>`
        )}
      </div>
    `;
  }

  render() {
    return html`${subscribe(
      this.picsStore.pics.get(this.picHash).comments.live,
      renderAsyncStatus({
        complete: map => this.renderList(Array.from(map.keys())),
        pending: () => html`<div
          style="display: flex; flex-direction: column; align-items: center; justify-content: center; flex: 1;"
        >
          <sl-spinner style="font-size: 2rem;"></sl-spinner>
        </div>`,
        error: e => html`<display-error
          .headline=${msg('Error fetching the comments')}
          .error=${e}
        ></display-error>`,
      })
    )}`;
  }

  static styles = [sharedStyles];
}
