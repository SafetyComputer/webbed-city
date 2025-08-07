import axios from 'axios'

const instance = axios.create({
  baseURL: '/api',
  timeout: 2000,
  withCredentials: true,
  headers: {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PATCH, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers':
      'Origin, Content-Type, X-Auth-Token, Authorization, Accept,charset,boundary,Content-Length',
    'Access-Control-Allow-Credentials': 'true',
  },
})
export default instance
