
let host = 'https://salesigns.codeah.com.ar/'; //prod
if(process.env.NODE_ENV && process.env.NODE_ENV === 'development') {
  host = 'http://localhost:5002/'
}
let hostApi = 'https://salesigns.codeah.com.ar/api' //prod
if (process.env.NODE_ENV && process.env.NODE_ENV === 'development') {
  hostApi = 'http://localhost:5002/api'
}

export const constants = {
  imageHost: host,
  urlPath: '',
  imageUrl: host + '',
  api: hostApi,
}
