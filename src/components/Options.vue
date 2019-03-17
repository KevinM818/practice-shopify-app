<template>
	<div class="Options">
		<h1>Options</h1>
    <div class="spinner" v-if="loading">loading...</div>
    <div v-else>
      <ul>
        <li v-for="option in options">
          <p>{{ option.title }}</p>
          <a href="">Edit</a>
          <button @click="removeOption(option.id)">Delete</button>
        </li>
      </ul>
      <div class="Options__addOption">
        <h3>Add Option</h3>
        <label>Title</label>
        <input type="text" v-model="optionToAdd">
        <button @click="addOption()">Save</button>
      </div>
    </div>
    <div class="savedNotification" :class="showSaved">Saved</div>
    <div class="removedNotification" :class="showDeleted">Removed</div>
	</div>
</template>

<script type="text/javascript">
  const {getData, postData, deleteData} = require('./../utils/utils.js');

	module.exports = {
		data () {
			return {
				loading: true,
        showSaved: 'hide',
        showDeleted: 'hide',
        options: [],
        optionToAdd: ''
			}
		},
    methods: {
      loadOptions(res) {
        res.data.options.forEach(opt => this.options.push({id: opt._id, title: opt.title}));
        this.loading = false;
      },
      addOption() {
        postData('/option', {title: this.optionToAdd}, this.optionAdded);
      },
      optionAdded(res) {
        if (res.statusText == 'OK') {
          this.options.push({id: res.data._id, title: res.data.title});
          this.optionToAdd = '';
          this.showSaved = 'show';
          setTimeout(() => this.showSaved = 'hide', 5000);
        }
      },
      removeOption(id) {
        deleteData(`/option/${id}`, this.optionRemoved);
      },
      optionRemoved(res) {
        if (res.statusText == 'OK') {
          const index = this.options.indexOf(this.options.find(opt => opt.id == res.data.option._id));
          this.options.splice(index, 1);
          this.showDeleted = 'show';
          setTimeout(() => this.showDeleted = 'hide', 5000);
        }
      }
    },
    created() {
      getData('/option', this.loadOptions);
    }
	};
</script>