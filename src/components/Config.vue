<template>
	<div class="Config">
		<h1>Configure</h1>
    <div class="spinner" v-if="loading">loading...</div>
    <div v-else>
      <div class="Config__inputs">
        <h3>Side Bar</h3>
        <div class="configInput">
          <label>Title</label>
          <input type="text" v-model="editedConfig.title">
        </div>
        <div class="configInput">
          <label>Step 1</label>
          <input type="text" v-model="editedConfig.stepOneTitle">
        </div>
        <div class="configInput">
          <label>Step 2</label>
          <input type="text" v-model="editedConfig.stepTwoTitle">
        </div>
        <div class="configInput">
          <label>Step 3</label>
          <input type="text" v-model="editedConfig.stepThreeTitle">
        </div>
      </div>
      <div class="Config__inputs">
        <h3>Step 1</h3>
        <div class="configInput">
          <label>Title</label>
          <input type="text" v-model="editedConfig.stepOneText">
        </div>
        <div class="configInput">
          <label>Select option text</label>
          <input type="text" v-model="editedConfig.selectOptionText">
        </div>
        <div class="configInput">
          <label>Select color text</label>
          <input type="text" v-model="editedConfig.selectColorText">
        </div>
      </div>
      <div class="Config__inputs">
        <h3>Step 2</h3>
        <div class="configInput">
          <label>Title</label>
          <input type="text" v-model="editedConfig.selectItemsText">
        </div>
        <div class="configInput">
          <label>Select items text</label>
          <input type="text" v-model="editedConfig.stepTwoText">
        </div>
      </div>
      <div class="Config__inputs">
        <h3>Step 3</h3>
        <div class="configInput">
          <label>Title</label>
          <input type="text" v-model="editedConfig.stepThreeText">
        </div>
        <div class="configInput">
          <label>Textarea place holder</label>
          <input type="text" v-model="editedConfig.textareaPlaceholder">
        </div>
      </div>
      <div class="Config__inputs">
        <h3>Confirm</h3>
        <div class="configInput">
          <label>Title</label>
          <input type="text" v-model="editedConfig.confirmTitle">
        </div>
        <div class="configInput">
          <label>Text</label>
          <input type="text" v-model="editedConfig.comfirmText">
        </div>
      </div>
      <div class="Config__inputs">
        <h3>Discount Percentage</h3>
        <div class="configInput">
          <label>Percentage (%)</label>
          <input type="number" v-model="editedConfig.discountPercentage">
        </div>
      </div>
      <div class="Config__inputs">
        <h3>Add Bag</h3>
        <div class="configInput">
          <label>Price ($)</label>
          <input type="number" v-model="editedConfig.addBagPrice">
        </div>
        <div class="configInput">
          <label>Text</label>
          <input type="text" v-model="editedConfig.addBagText">
        </div>
      </div>
      <button @click="saveConfig()">Save</button>
    </div>
    <div class="savedNotification" :class="showSaved">Saved</div>
	</div>
</template>

<script type="text/javascript">
  const {getData, patchData} = require('./../utils/utils.js');

	module.exports = {
		data () {
      return {
        loading: true,
        showSaved: 'hide',
        editedConfig: {}
      }
    },
    methods: {
      loadConfig(res) {
        this.editedConfig = res.data.shopConfig;
        this.loading = false;
      },
      saveConfig() {
        patchData('/config', this.editedConfig, this.configSaved);
      },
      configSaved(res) {
        if (res.statusText == 'OK') {
          this.showSaved = 'show';
          setTimeout(() => this.showSaved = 'hide', 5000);
        }
      }
    },
    created() {
      getData('/config', this.loadConfig);
    }
	};
</script>