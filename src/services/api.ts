import axios from 'axios';

export const api = axios.create({
  baseURL: 'https://podcastr-api9988.herokuapp.com/'
})
