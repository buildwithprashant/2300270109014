import axios from "axios";

export const shortenUrls = (urls) => {
  return axios.post("/api/shorten", { urls });
};
