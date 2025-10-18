import axiosLib  from 'axios';

console.log("Base URL:", import.meta.env.VITE_API_BASE_FRONT_URL);

const axios = axiosLib .create({
  baseURL: import.meta.env.VITE_API_BASE_FRONT_URL, //https://insys-front.onrender.com (.env)
  withCredentials: true, 
});
console.log("Axios instance baseURL:", axios.defaults.baseURL);


export default axios;


//for localhost
/*
import axiosLib  from 'axios';

console.log("Base URL:", import.meta.env.VITE_API_BASE_URL);

const axios = axiosLib .create({
  baseURL: import.meta.env.VITE_API_BASE_URL, //http://localhost:3000/api (.env)
  withCredentials: true, 
});
console.log("Axios instance baseURL:", axios.defaults.baseURL);


export default axios;
*/
