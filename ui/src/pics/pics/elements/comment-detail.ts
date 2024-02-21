import { LitElement, html } from 'lit';
import { state, property, customElement } from 'lit/decorators.js';
import { EntryHash, Record, ActionHash } from '@holochain/client';
import { EntryRecord } from '@holochain-open-dev/utils';
import { subscribe } from '@holochain-open-dev/stores';
import { renderAsyncStatus, sharedStyles, hashProperty, wrapPathInSvg, notifyError } from '@holochain-open-dev/elements';
import { consume } from '@lit/context';
import { localized, msg } from '@lit/localize';
import { mdiAlertCircleOutline, mdiPencil, mdiDelete } from '@mdi/js';

import '@holochain-open-dev/elements/dist/elements/display-error.js';
import '@shoelace-style/shoelace/dist/components/card/card.js';
import '@shoelace-style/shoelace/dist/components/button/button.js';

import '@shoelace-style/shoelace/dist/components/icon-button/icon-button.js';
import '@shoelace-style/shoelace/dist/components/spinner/spinner.js';
import SlAlert from '@shoelace-style/shoelace/dist/components/alert/alert.js';
import '@shoelace-style/shoelace/dist/components/alert/alert.js';

import { PicsStore } from '../pics-store.js';
import { picsStoreContext } from '../context.js';
import { Comment } from '../types.js';

/**
 * @element comment-detail
 * @fires comment-deleted: detail will contain { commentHash }
 */
@localized()
@customElement('comment-detail')
export class CommentDetail extends LitElement {

  // REQUIRED. The hash of the Comment to show
  @property(hashProperty('comment-hash'))
  commentHash!: ActionHash;

  /**
   * @internal
   */
  @consume({ context: picsStoreContext, subscribe: true })
  picsStore!: PicsStore;


  async deleteComment() {
    try {
      await this.picsStore.client.deleteComment(this.commentHash);
 
      this.dispatchEvent(new CustomEvent('comment-deleted', {
        bubbles: true,
        composed: true,
        detail: {
          commentHash: this.commentHash
        }
      }));
    } catch (e: any) {
      console.error(e);
      notifyError(msg("Error deleting the comment"));
    }
  }

  renderDetail(entryRecord: EntryRecord<Comment>) {
    return html`
      <sl-card>
      	<div slot="header" class="row" style="gap: 8px">
          <span style="font-size: 18px; flex: 1;">${msg("Comment")}</span>

          <sl-icon-button .src=${wrapPathInSvg(mdiDelete)} @click=${() => this.deleteComment()}></sl-icon-button>
        </div>

        <div class="column" style="gap: 16px;">
  
          <div class="column" style="gap: 8px;">
	        <span><strong>${msg("Text")}</strong></span>
 	        <span style="white-space: pre-line">${ entryRecord.entry.text }</span>
	  </div>

      </div>
      </sl-card>
    `;
  }
  
  render() {
    return html`${subscribe(this.picsStore.comments.get(this.commentHash).entry,
      renderAsyncStatus({
        complete: comment => {
          return this.renderDetail(comment);
        },
        pending: () => html`<div
          style="display: flex; flex-direction: column; align-items: center; justify-content: center; flex: 1;"
        >
          <sl-spinner style="font-size: 2rem;"></sl-spinner>
        </div>`,
        error: e => html`<display-error
          .headline=${msg("Error fetching the comment")}
          .error=${e}
        ></display-error>`
      })
    )}`;
  }
  
  static styles = [sharedStyles];
}
