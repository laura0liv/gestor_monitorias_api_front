// src/lib/stores/user.js
import { writable } from 'svelte/store';

function createUsuarioStore() {
  const { subscribe, set, update } = writable(null);

  return {
    subscribe,
    set: (val) => {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem('usuario', JSON.stringify(val));
      }
      set(val);
    },
    logout: () => {
      if (typeof localStorage !== 'undefined') {
        localStorage.removeItem('usuario');
      }
      set(null);
    },
    init: () => {
      if (typeof localStorage !== 'undefined') {
        const stored = localStorage.getItem('usuario');
        if (stored) set(JSON.parse(stored));
      }
    }
  };
}

export const usuario = createUsuarioStore();