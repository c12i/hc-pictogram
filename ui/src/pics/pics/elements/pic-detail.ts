import {
  hashProperty,
  notifyError,
  renderAsyncStatus,
  sharedStyles,
  wrapPathInSvg,
} from '@holochain-open-dev/elements';
import '@holochain-open-dev/elements/dist/elements/display-error.js';
import '@holochain-open-dev/file-storage/dist/elements/show-image.js';
import { subscribe } from '@holochain-open-dev/stores';
import { EntryRecord } from '@holochain-open-dev/utils';
import { ActionHash, EntryHash, Record } from '@holochain/client';
import { consume } from '@lit/context';
import { localized, msg } from '@lit/localize';
import { mdiAlertCircleOutline, mdiDelete, mdiPencil } from '@mdi/js';
import SlAlert from '@shoelace-style/shoelace/dist/components/alert/alert.js';
import '@shoelace-style/shoelace/dist/components/alert/alert.js';
import '@shoelace-style/shoelace/dist/components/button/button.js';
import '@shoelace-style/shoelace/dist/components/card/card.js';
import '@shoelace-style/shoelace/dist/components/icon-button/icon-button.js';
import '@shoelace-style/shoelace/dist/components/spinner/spinner.js';
import { LitElement, html } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';

import { picsStoreContext } from '../context.js';
import { PicsStore } from '../pics-store.js';
import { Pic } from '../types.js';

/**
 * @element pic-detail
 * @fires pic-deleted: detail will contain { picHash }
 */
@localized()
@customElement('pic-detail')
export class PicDetail extends LitElement {
  // REQUIRED. The hash of the Pic to show
  @property(hashProperty('pic-hash'))
  picHash!: ActionHash;

  /**
   * @internal
   */
  @consume({ context: picsStoreContext, subscribe: true })
  picsStore!: PicsStore;

  async deletePic() {
    try {
      await this.picsStore.client.deletePic(this.picHash);

      this.dispatchEvent(
        new CustomEvent('pic-deleted', {
          bubbles: true,
          composed: true,
          detail: {
            picHash: this.picHash,
          },
        })
      );
    } catch (e: any) {
      console.error(e);
      notifyError(msg('Error deleting the pic'));
    }
  }

  renderDetail(entryRecord: EntryRecord<Pic>) {
    return html`
      <sl-card>
        <div slot="header" class="row" style="gap: 8px">
          <span style="font-size: 18px; flex: 1;">${msg('Pic')}</span>

          <sl-icon-button
            .src=${wrapPathInSvg(mdiDelete)}
            @click=${() => this.deletePic()}
          ></sl-icon-button>
        </div>

        <div class="column" style="gap: 16px;">
          <div class="column" style="gap: 8px;">
            <span><strong>${msg('Image')}</strong></span>
            <span style="white-space: pre-line"
              ><show-image
                .imageHash=${entryRecord.entry.image}
                style="width: 300px; height: 200px"
              ></show-image
            ></span>
          </div>

          <div class="column" style="gap: 8px;">
            <span><strong>${msg('Story')}</strong></span>
            <span style="white-space: pre-line"
              >${entryRecord.entry.story}</span
            >
          </div>
        </div>
      </sl-card>
    `;
  }

  render() {
    return html`${subscribe(
      this.picsStore.pics.get(this.picHash).entry,
      renderAsyncStatus({
        complete: pic => this.renderDetail(pic),
        pending: () => html`<div
          style="display: flex; flex-direction: column; align-items: center; justify-content: center; flex: 1;"
        >
          <sl-spinner style="font-size: 2rem;"></sl-spinner>
        </div>`,
        error: e => html`<display-error
          .headline=${msg('Error fetching the pic')}
          .error=${e}
        ></display-error>`,
      })
    )}`;
  }

  static styles = [sharedStyles];
}
