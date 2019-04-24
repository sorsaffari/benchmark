import Vue from 'vue';
import Vuex from 'vuex';

Vue.use(Vuex);

// eslint-disable-next-line import/prefer-default-export
export const store = new Vuex.Store({
  state: {
    pageTitle: '',
  },
  mutations: {
    setPageTitle(state, pageTitle) {
      state.pageTitle = pageTitle;
    },
  },
  getters: {
    pageTitle: state => state.pageTitle,
  },
});
