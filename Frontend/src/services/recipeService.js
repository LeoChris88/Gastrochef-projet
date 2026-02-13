import axios from "axios";

const API = "http://localhost:5000/api";

export const fetchDiscoveredRecipes = async (token) => {
  const res = await axios.get(`${API}/recipes/discovered`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

export const testRecipeRequest = async (ingredients, token) => {
  const res = await axios.post(
    `${API}/recipes/test`,
    { ingredients },
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return res.data;
};

export const resetRecipes = async (token) => {
  await axios.post(
    `${API}/user/reset-recipes`,
    {},
    { headers: { Authorization: `Bearer ${token}` } }
  );
};