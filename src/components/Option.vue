<template>
	<div class="Option">
		<h1>Option</h1>
    	<div class="spinner" v-if="loading">loading...</div>
		<div v-else>
      <div class="titleInput">
        <label>Title</label>
        <input type="text" v-model="optionTitle">
      </div>
      <div class="Option__collections">
        <h3>Collections</h3>
        <ul>
          <li v-for="collection in optionCollections">
            <p>{{ collection.title }}</p>
            <button @click="removeCollection(collection.collection_id)">Remove</button>
          </li>
        </ul>
      </div>
      <div class="Option__addCollections">
        <h4>Search Store Collections</h4>
        <input type="text" v-model="searchCollection">
        <button @click="searchStoreCollections()">Search</button>
        <div class="searchResult" v-if="hasResult">
          <p>{{ searchCollectionResult.title }}</p>
          <button @click="addCollection()">Add</button>
        </div>
        <p class="errorText" v-if="searchError">{{ searchError }}</p>
      </div>
      <div class="Option__colors">
        <h3>Colors</h3>
        <ul>
          <li v-for="color in optionColors">
            <span v-bind:style="{height: '30px', width: '30px', display: 'inline-block', 'background-color': color.value}"></span>
            <p>{{ color.title }}</p>
            <p>{{ color.value }}</p>
            <button @click="removeColor(color.value)">Remove</button>
          </li>
        </ul>
        <div class="addColor">
          <h4>Add Color</h4>
          <div class="addColorInput">
            <label>Title</label>
            <input type="text" v-model="addColorTitle">
          </div>
          <div class="addColorInput">
            <label>Value</label>
            <input type="text" v-model="addColorValue">
          </div>
          <button @click="addColor()">Add</button>
        </div>
      </div>
      <button @click="saveOption()">Save</button>
		</div>
    <div class="savedNotification" :class="showSaved">Saved</div>
	</div>
</template>

<script type="text/javascript">
  const {getData, patchData} = require('./../utils/utils.js');
  const axios = require('axios/dist/axios.min.js');

	module.exports = {
		data() {
			return {
				loading: true,
        showSaved: 'hide',
				optionTitle: '',
        optionCollections: [],
        optionColors: [],
        searchCollection: '',
        hasResult: false,
        searchCollectionResult: {},
        searchError: '',
        addColorTitle: '',
        addColorValue: ''
			}
		},
    methods: {
      loadOption(res) {
        this.optionTitle = res.data.option.title;
        this.optionCollections = res.data.option.collections;
        this.optionColors = res.data.option.colors;
        this.loading = false;
      },
      async searchStoreCollections() {
        if (!this.searchCollection) {
          return;
        }
        let collHandle = this.searchCollection.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/-$/, '').replace(/^-/, '');
        try {
          let result = await axios.get(`https://${window.shopOrigin}/collections/${collHandle}.json`);
          this.searchCollectionResult = {collection_id: result.data.collection.id, title: result.data.collection.title}
          this.hasResult = true;
          this.searchCollection = '';
          this.searchError = '';
        } catch(e) {
          console.log('Error getting shop collection', e);
          this.searchCollectionResult = {};
          this.hasResult = false;
          if (e.response.status == 404) {
            this.searchError = `${this.searchError} collection not found`;
          }
        }
      },
      addCollection() {
        this.optionCollections.push(this.searchCollectionResult);
        this.searchCollectionResult = {};
        this.hasResult = false;
      },
      removeCollection(id) {
        const index = this.optionCollections.indexOf(this.optionCollections.find(coll => coll.collection_id == id));
        this.optionCollections.splice(index, 1);
      },
      addColor() {
        this.optionColors.push({title: this.addColorTitle, value: this.addColorValue});
        this.addColorTitle = '';
        this.addColorValue = '';
      },
      removeColor(value) {
        const index = this.optionColors.indexOf(this.optionColors.find(color => color.value == value));
        this.optionColors.splice(index, 1);
      },
      saveOption() {
        let data = {
          title: this.optionTitle,
          collections: this.optionCollections,
          colors: this.optionColors
        }
        patchData(`/option/${this.$route.params.id}`, data, this.optionSaved);
      },
      optionSaved(res) {
        console.log(res);
        if (res.statusText == 'OK') {
          this.showSaved = 'show';
          setTimeout(() => this.showSaved = 'hide', 5000);
        }
      }
    },
    created() {
      getData(`/option/${this.$route.params.id}`, this.loadOption);
    }
	};
</script>