import http from '../api'

async function startMatching() {
  return await http.post('/matching')
}

async function stopMatching() {
  return await http.delete('/matching')
}

export default {
  startMatching,
  stopMatching,
}
