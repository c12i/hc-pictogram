import { LitElement, html } from 'lit';
import { state, property, customElement } from 'lit/decorators.js';
import { EntryHash, Record, ActionHash } from '@holochain/client';
import { EntryRecord } from '@holochain-open-dev/utils';
import { subscribe } from '@holochain-open-dev/stores';
import { renderAsyncStatus, hashProperty, sharedStyles } from '@holochain-open-dev/elements';
import { consume } from '@lit/context';

import { localized, msg } from '@lit/localize';

import '@holochain-open-dev/file-storage/dist/elements/show-image.js';

import '@shoelace-style/shoelace/dist/components/spinner/spinner.js';
import '@holochain-open-dev/elements/dist/elements/display-error.js';
import '@shoelace-style/shoelace/dist/components/card/card.js';
import { PicsStore } from '../pics-store.js';
import { picsStoreContext } from '../context.js';
import { Pic } from '../types.js';

/**
 * @element pic-summary
 * @fires pic-selected: detail will contain { picHash }
 */
@localized()
@customElement('pic-summary')
export class PicSummary extends LitElement {

  // REQUIRED. The hash of the Pic to show
  @property(hashProperty('pic-hash'))
  picHash!: ActionHash;

  /**
   * @internal
   */
  @consume({ context: picsStoreContext, subscribe: true })
  picsStore!: PicsStore;

  renderSummary(entryRecord: EntryRecord<Pic>) {
    return html`
      <div class="column" style="gap: 16px;">

          <div class="column" style="gap: 8px">
	        <span><strong>${msg("Image")}</strong></span>
 	        <span style="white-space: pre-line"><show-image .imageHash=${ entryRecord.entry.image } style="width: 300px; height: 200px"></show-image></span>
	  </div>

          <div class="column" style="gap: 8px">
	        <span><strong>${msg("Story")}</strong></span>
 	        <span style="white-space: pre-line">${ entryRecord.entry.story }</span>
	  </div>

      </div>
    `;
  }
  
  renderPic() {
    return html`${subscribe(this.picsStore.pics.get(this.picHash).entry,
      renderAsyncStatus({
        complete: pic => this.renderSummary(pic),
        pending: () => html`<div
          style="display: flex; flex-direction: column; align-items: center; justify-content: center; flex: 1;"
        >
          <sl-spinner style="font-size: 2rem;"></sl-spinner>
        </div>`,
        error: e => html`<display-error
          .headline=${msg("Error fetching the pic")}
          .error=${e}
        ></display-error>`
      })
    )}`;
  }
  
  render() {
    return html`<sl-card style="flex: 1; cursor: grab;" @click=${() => this.dispatchEvent(new CustomEvent('pic-selected', {
          composed: true,
          bubbles: true,
          detail: {
            picHash: this.picHash
          }
        }))}>
        ${this.renderPic()}
    </sl-card>`;
  }

  
  static styles = [sharedStyles];
}
