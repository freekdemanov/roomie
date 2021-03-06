/* eslint-disable no-param-reassign */
import Vue from 'vue';
import Vuex from 'vuex';
import { DateTime } from 'luxon';
import 'whatwg-fetch';

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    free: true,
    busy: true,
    search: null,
    recurring: false,
    date: DateTime.local().toISODate(),
    rooms: new Map()
  },

  mutations: {
    setFree(state, value) { state.free = value; },
    setBusy(state, value) { state.busy = value; },
    setSearch(state, value) { state.search = value; },
    setRecurring(state, value) { state.recurring = value; },
    setDate(state, value) { state.date = value; },
    setRoom(state, { key, room }) { state.rooms.set(key, room); }
  },

  actions: {
    setDate({ commit }, value) {
      const date = value ? DateTime.fromISO(value) : DateTime.local();
      if (date.isValid) commit('setDate', date.toISODate());
    },

    async getRoom({ state, commit }, { id, date }) {
      const key = `${id} ${date}`;
      if (state.rooms.has(key)) {
        return state.rooms.get(key);
      }

      const response = await fetch(`/api/room/${encodeURIComponent(id)}/${date}`, { credentials: 'same-origin' });

      if (!response.ok) {
        const message = await response.text() || response.statusText;
        const error = new Error(message);
        error.code = response.status;
        throw error;
      }

      const room = Object.freeze(await response.json());
      commit('setRoom', { key, room });

      return room;
    }
  }
});
