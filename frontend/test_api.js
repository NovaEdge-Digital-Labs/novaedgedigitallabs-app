const axios = require('axios');
axios.get('http://localhost:5000/api/courses').then(res => console.log(res.data.data.map(c => c.price))).catch(console.error);
