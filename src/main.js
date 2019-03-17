const Vue = require("vue/dist/vue.js");
const App = require('./app.vue');
const router = require('./router.js');

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')