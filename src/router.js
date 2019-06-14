const Vue = require("vue/dist/vue.js");
const Router = require('vue-router/dist/vue-router.min.js');
const BuiltSets = require('./components/BuiltSets.vue');
const Options = require('./components/Options.vue');
const Option = require('./components/Option.vue');
const Config = require('./components/Config.vue');

Vue.use(Router);

module.exports = new Router({
	mode: 'history',
  base: process.env.BASE_URL,
  routes: [
    {path: '/', name: 'built-sets', component: BuiltSets},
    {path: '/options', name: 'options', component: Options},
    {path: '/option/:id', name: 'option', component: Option},
    {path: '/config', name: 'config', component: Config}
  ]
});
