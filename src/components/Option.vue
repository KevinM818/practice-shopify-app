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
          <draggable v-model="optionCollections" ghost-class="ghost">
            <transition-group type="transition" name="flip-list">
              <li class="sortable" v-for="collection in optionCollections" :id="collection.collection_id" :key="collection.collection_id">
                <img src="https://img.icons8.com/metro/26/000000/drag-reorder.png">
                <p>{{ collection.title }}</p>
                <button @click="removeCollection(collection.collection_id)">Remove</button>
              </li>
            </transition-group>
          </draggable>
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
            <span v-bind:style="{'background-color': color.value}"></span>
            <div class="colorInfo">
              <p>Color: {{ color.title }}</p>
              <p>Value: {{ color.value }}</p>
            </div>
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
      <button @click="saveOption()" class="optSaveBtn">Save</button>
		</div>
    <div class="savedNotification" :class="showSaved">Saved</div>
	</div>
</template>

<script type="text/javascript">
  const {getData, patchData} = require('./../utils/utils.js');
  const axios = require('axios/dist/axios.min.js');
  const draggable = require('vuedraggable/dist/vuedraggable.common.js');

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
    components: {
      draggable
    },
    computed: {
      collectionToSave() {
        let arr = [];
        this.optionCollections.forEach(coll => arr.push({
          collection_id: coll.collection_id,
          title: coll.title,
          order: this.optionCollections.findIndex(c => c.collection_id == coll.collection_id) + 1
        }));
        return arr;
      }
    },
    methods: {
      loadOption(res) {
        this.optionTitle = res.data.option.title;
        this.optionCollections = res.data.option.collections.sort((a,b) => a.order - b.order);
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
          this.searchCollectionResult = {
            collection_id: result.data.collection.id, 
            title: result.data.collection.title,
            order: this.optionCollections.length + 1
          }
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
        if (!this.addColorTitle || !this.addColorValue) {
          return;
        }
        this.optionColors.push({title: this.addColorTitle, value: this.addColorValue});
        this.addColorTitle = '';
        this.addColorValue = '';
      },
      removeColor(value) {
        const index = this.optionColors.indexOf(this.optionColors.find(color => color.value == value));
        this.optionColors.splice(index, 1);
      },
      saveOption() {
        console.log(this.collectionToSave);
        let data = {
          title: this.optionTitle,
          collections: this.collectionToSave,
          colors: this.optionColors
        }
        patchData(`/option/${this.$route.params.id}`, data, this.optionSaved);
      },
      optionSaved(res) {
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