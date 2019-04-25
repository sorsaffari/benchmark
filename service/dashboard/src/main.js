import Vue from 'vue';
import App from './App.vue';
// import ECharts from 'vue-echarts';
// import 'echarts/lib/chart/line';
// import 'echarts/lib/component/tooltip';

import router from './router';
import { store } from './store';
import './plugins/element';
import './util/filters';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';

Vue.component('font-awesome-icon', FontAwesomeIcon);
// Vue.component('v-chart', ECharts);

Vue.config.productionTip = false;

new Vue({
  router,
  store,
  render: h => h(App),
}).$mount('#app');
