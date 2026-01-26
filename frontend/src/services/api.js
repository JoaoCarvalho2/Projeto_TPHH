import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';


const api = axios.create({
  baseURL: API_URL,
});

export const getRanking = async () => {
  const response = await api.get('/ranking');
  return response.data;
};

export const addPlayer = async (gameName, tagLine) => {
  const response = await api.post('/players', { game_name: gameName, tag_line: tagLine });
  return response.data;
};