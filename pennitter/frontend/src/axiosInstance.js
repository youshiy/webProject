import axiosPackage from 'axios';

const axios = axiosPackage.create({
  baseURL: 'http://localhost:8080', // Set your server's URL here
});

export default axios;
