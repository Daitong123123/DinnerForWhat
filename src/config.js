// config.js
const baseUrl = process.env.NODE_ENV === 'production' 
  ? 'dinner.daitong.xyz:60000'
  : 'localhost:60000';

export default baseUrl;