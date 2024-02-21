import { LitElement, html } from 'lit';
import { repeat } from "lit/directives/repeat.js";
import { state, property, query, customElement } from 'lit/decorators.js';
import { ActionHash, Record, DnaHash, AgentPubKey, EntryHash } from '@holochain/client';
import { EntryRecord } from '@holochain-open-dev/utils';
import { hashProperty, notifyError, hashState, sharedStyles, onSubmit, wrapPathInSvg } from '@holochain-open-dev/elements';
import { consume } from '@lit/context';
import { localized, msg } from '@lit/localize';
import { mdiAlertCircleOutline, mdiDelete } from "@mdi/js";

import '@shoelace-style/shoelace/dist/components/card/card.js';
import '@holochain-open-dev/elements/dist/elements/display-error.js';
import '@shoelace-style/shoelace/dist/components/icon/icon.js';
import '@holochain-open-dev/file-storage/dist/elements/upload-files.js';

import SlAlert from '@shoelace-style/shoelace/dist/components/alert/alert.js';
import '@shoelace-style/shoelace/dist/components/input/input.js';
import '@shoelace-style/shoelace/dist/components/button/button.js';
import '@shoelace-style/shoelace/dist/components/icon-button/icon-button.js';
import '@shoelace-style/shoelace/dist/components/alert/alert.js';
import { PicsStore } from '../pics-store.js';
import { picsStoreContext } from '../context.js';
import { Pic } from '../types.js';

/**
 * @element create-pic
 * @fires pic-created: detail will contain { picHash }
 */
@localized()
@customElement('create-pic')
export class CreatePic extends LitElement {

  /**
   * @internal
   */
  @consume({ context: picsStoreContext, subscribe: true })
  picsStore!: PicsStore;

  /**
   * @internal
   */
  @state()
  committing = false;

  /**
   * @internal
   */
  @query('#create-form')
  form!: HTMLFormElement;


  async createPic(fields: any) {
  
    const pic: Pic = {
      image: fields.image,
      story: fields.story,
    };

    try {
      this.committing = true;
      const record: EntryRecord<Pic> = await this.picsStore.client.createPic(pic);

      this.dispatchEvent(new CustomEvent('pic-created', {
        composed: true,
        bubbles: true,
        detail: {
          picHash: record.actionHash
        }
      }));
      
      this.form.reset();
    } catch (e: any) {
      console.error(e);
      notifyError(msg("Error creating the pic"));
    }
    this.committing = false;
  }

  render() {
    return html`
      <sl-card style="flex: 1;">
        <span slot="header">${msg("Create Pic")}</span>

        <form 
          id="create-form"
          class="column"
          style="flex: 1; gap: 16px;"
          ${onSubmit(fields => this.createPic(fields))}
        >  
          <div>
          <upload-files name="image" one-file accepted-files="image/jpeg,image/png,image/gif" required></upload-files>          </div>

          <div>
          <sl-input name="story" .label=${msg("Story")}  required></sl-input>          </div>


          <sl-button
            variant="primary"
            type="submit"
            .loading=${this.committing}
          >${msg("Create Pic")}</sl-button>
        </form> 
      </sl-card>`;
  }
  
  static styles = [sharedStyles];
}
