<template>
	<div class="appContainer">
	 <div class="Navigation">
      <router-link to="/">Built Sets</router-link>
      <router-link to="/options">Edit Options</router-link>
      <router-link to="/config">Configure</router-link>    
    </div>
    <div class="AppContent">
      <router-view/>
    </div>
	</div>
</template>

<script type="text/javascript">
	module.exports = {

	};
</script>