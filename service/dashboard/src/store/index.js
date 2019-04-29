import Vue from 'vue';
import Vuex from 'vuex';
import _ from 'lodash';

Vue.use(Vuex);

// eslint-disable-next-line import/prefer-default-export
export const store = new Vuex.Store({
  state: {
    graphs: {
      financial: {
        chart: {
          loading: true,
        },
        selectedScale: 0,
        isInspected: false,
        selectedQuery: '',
      },
      road_network: {
        chart: {
          loading: true,
        },
        selectedScale: 0,
        isInspected: false,
        selectedQuery: '',
      },
      social_network: {
        chart: {
          loading: true,
        },
        selectedScale: 0,
        isInspected: false,
        selectedQuery: '',
      },
      generic_uniform_network: {
        chart: {
          loading: true,
        },
        selectedScale: 0,
        isInspected: false,
        selectedQuery: '',
      },
      biochemical_network: {
        chart: {
          loading: true,
        },
        selectedScale: 0,
        isInspected: false,
        selectedQuery: '',
      },
    },
  },
  mutations: {
    setLoading(state, payload) {
      const { stringPath, isLoading } = payload;
      _.set(state, `${stringPath}.loading`, isLoading); // TODO: Object.assign()
    },

    setInspectedGraph(state, payload) {
      const { inspectedGraph } = payload;
      Object.keys(state.graphs).forEach((graphName) => {
        state.graphs[graphName].isInspected = false;
      });
      state.graphs[inspectedGraph].isInspected = true;
    },

    setSelectedScale(state, payload) {
      const { graphName, selectedScale } = payload;
      state.graphs[graphName].selectedScale = selectedScale;
    },

    setSelectedQuery(state, payload) {
      const { graphName, selectedQuery } = payload;
      state.graphs[graphName].selectedQuery = selectedQuery;
    },
  },
  getters: {
    loading: state => stringPath => _.get(state, `${stringPath}.loading`), // TODO: find alternative

    inspectedGraph(state) {
      // retrieves and returns title of the only one graph that has its isInspected value set to true
      // existence of only one such graph is guaranteed by the mutaton's implementation
      // eslint-disable-next-line no-unused-vars
      return Object.keys(_.pickBy(state.graphs, (value, _key) => value.isInspected === true))[0];
    },

    selectedScale: state => graphName => state.graphs[graphName].selectedScale,

    selectedQuery: state => graphName => state.graphs[graphName].selectedQuery,
  },
});
