import { LitElement, html } from 'lit';
import { state, customElement, property } from 'lit/decorators.js';
import { AgentPubKey, EntryHash, ActionHash, Record } from '@holochain/client';
import { subscribe } from '@holochain-open-dev/stores';
import { consume } from '@lit/context';
import { localized, msg } from '@lit/localize';
import { hashProperty, sharedStyles, wrapPathInSvg, renderAsyncStatus } from '@holochain-open-dev/elements';
import { mdiInformationOutline } from '@mdi/js';

import '@holochain-open-dev/elements/dist/elements/display-error.js';
import '@shoelace-style/shoelace/dist/components/spinner/spinner.js';
import '@shoelace-style/shoelace/dist/components/icon/icon.js';

import './pic-summary.js';
import { PicsStore } from '../pics-store.js';
import { picsStoreContext } from '../context.js';

/**
 * @element my-pics
 */
@localized()
@customElement('my-pics')
export class MyPics extends LitElement {

  // REQUIRED. The author for which the Pics should be fetched
  @property(hashProperty('author'))
  author!: AgentPubKey;
  
  /**
   * @internal
   */
  @consume({ context: picsStoreContext, subscribe: true })
  picsStore!: PicsStore;

  firstUpdated() {
    if (this.author === undefined) {
      throw new Error(`The author property is required for the MyPics element`);
    }
  }

  renderList(hashes: Array<ActionHash>) {
    if (hashes.length === 0) 
      return html` <div class="column center-content" style="gap: 16px;">
        <sl-icon
          .src=${wrapPathInSvg(mdiInformationOutline)}
          style="color: grey; height: 64px; width: 64px;"
          ></sl-icon
        >
        <span class="placeholder">${msg("No pics found")}</span>
      </div>`;

    return html`
      <div class="column" style="gap: 16px; flex: 1">
        ${hashes.map(hash => 
          html`<pic-summary .picHash=${hash}></pic-summary>`
        )}
      </div>
    `;
  }

  render() {
    return html`${subscribe(this.picsStore.myPics.get(this.author),
      renderAsyncStatus({
        complete: map => this.renderList(Array.from(map.keys())),
        pending: () => html`<div
          style="display: flex; flex-direction: column; align-items: center; justify-content: center; flex: 1;"
        >
          <sl-spinner style="font-size: 2rem;"></sl-spinner>
        </div>`,
        error: e => html`<display-error
          .headline=${msg("Error fetching the pics")}
          .error=${e}
        ></display-error>`
      })
    )}`;
  }
  
  static styles = [sharedStyles];
}
