var Vue = require("vue/dist/vue.js");
let App = require('./app.vue');

new Vue({
  render: h => h(App)
}).$mount('#app')