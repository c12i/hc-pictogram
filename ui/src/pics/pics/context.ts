import { createContext } from '@lit/context';
import { PicsStore } from './pics-store.js';

export const picsStoreContext = createContext<PicsStore>(
  'hc_zome_pics/store'
);

