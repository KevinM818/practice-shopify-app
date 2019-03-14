const axios = require('axios/dist/axios.min.js');

const getData = (url, callback) => {
	axios.get(url, {headers: deparam()})
		.then(res => callback(res))
		.catch(e => console.log('GET request err', e));
};

function deparam() {
	let queryString = {};
	let uri = window.location.search;
	uri.replace(new RegExp("([^?=&]+)(=([^&#]*))?", "g"), ($0, $1, $2, $3) => queryString[$1] = decodeURIComponent($3.replace(/\+/g, '%20')));
	return queryString;
}

module.exports = {
	getData
};