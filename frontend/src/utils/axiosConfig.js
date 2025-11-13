// frotend Render
import axiosLib  from 'axios';

const isLocal = import.meta.env.VITE_LOCAL === "true"; // set this in .env
console.log("Base URL:", import.meta.env.VITE_API_BASE_FRONT_URL);

const axios = axiosLib .create({
  baseURL: isLocal 
  ? import.meta.env.VITE_API_BASE_URL         // local      ==    http://localhost:3000/api
  : import.meta.env.VITE_API_BASE_FRONT_URL,  // deployed   ==    https://insys-1-8q1s.onrender.com (.env)
  withCredentials: true, 
});
console.log("Axios instance baseURL:", axios.defaults.baseURL);

axios.interceptors.response.use(
  res => res,
  err => {
    const status = err.response?.status;
    const currentPath = window.location.pathname;

    // if refresh failed, go to login
    if (status === 403 && err.config.url.includes("/refresh")) {
      window.location.href = "/login";
    } else if (status === 403) {
      window.location.href = "/forbidden";
    } else if (status === 401 && currentPath !== "/login") {
      window.location.href = "/login";
    }
    return Promise.reject(err);
  }
);


export default axios;





// frotend Railway
// import axiosLib  from 'axios';

// console.log("Base URL:", import.meta.env.REACT_APP_API_URLVITE_API_BASE_FRONT_URL);

// const axios = axiosLib .create({
//   baseURL: import.meta.env.REACT_APP_API_URL, //https://insys-production.up.railway.app (.env)
//   withCredentials: true, 
// });
// console.log("Axios instance baseURL:", axios.defaults.baseURL);


// export default axios;

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
