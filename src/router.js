const Vue = require("vue/dist/vue.js");
const Router = require('vue-router/dist/vue-router.min.js');
const Dashboard = require('./components/Dashboard.vue');
const BuiltSets = require('./components/BuiltSets.vue');
const Orders = require('./components/Orders.vue');
const Options = require('./components/Options.vue');
const Option = require('./components/Option.vue');
const Config = require('./components/Config.vue');

Vue.use(Router);

module.exports = new Router({
	mode: 'history',
  base: process.env.BASE_URL,
  routes: [
    {path: '/', name: 'dashboard', component: Dashboard},
    {path: '/built-sets', name: 'built-sets', component: BuiltSets},
    {path: '/orders', name: 'orders', component: Orders},
    {path: '/options', name: 'options', component: Options},
    {path: '/option/:id', name: 'option', component: Option},
    {path: '/config', name: 'config', component: Config}
  ]
});
