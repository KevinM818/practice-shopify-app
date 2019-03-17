const axios = require('axios/dist/axios.min.js');

const loadParams = deparam();

const getData = (url, callback, params = {}) => {
  params.shop = loadParams.shop;
	axios.get(url, {params})
		.then(res => callback(res))
		.catch(e => console.log(`GET ${url} request err`, e));
};

const patchData = (url, data, callback) => {
  axios.patch(url, data, {headers: loadParams})
    .then(res => callback(res))
    .catch(e => console.log(`PATCH ${url} request err`, e));
}

const postData = (url, data, callback) => {
  axios.post(url, data, {headers: loadParams})
    .then(res => callback(res))
    .catch(e => console.log(`POST ${url} request err`, e));
}

const deleteData = (url, callback) => {
  axios.delete(url, {headers: loadParams})
    .then(res => callback(res))
    .catch(e => console.log(`DELETE ${url} request err`, e));
}

function deparam() {
	let queryString = {};
	let uri = window.location.search;
  uri.replace(new RegExp("([^?=&]+)(=([^&#]*))?", "g"), ($0, $1, $2, $3) => queryString[$1] = decodeURIComponent($3.replace(/\+/g, '%20')));
	return queryString;
}

module.exports = {
	getData,
  patchData,
  postData,
  deleteData
};