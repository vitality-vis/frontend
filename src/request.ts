import { API_BASE_URL } from './config';

const baseUrl = `${API_BASE_URL}/`;

export const getPaperByIds = (id_list) => {
  return fetch(`${baseUrl}getPapers`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ id_list }),
  }).then((response) => response.json());
}

export const getPaperByTitle = (title) => {
  return fetch(`${baseUrl}getPapers`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ title }),
  }).then((response) => response.json());
}
