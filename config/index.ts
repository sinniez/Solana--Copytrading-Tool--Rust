import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

export const getAllTokenPrice = async () => {
  const prices = (await axios.get("https://api.raydium.io/v2/main/price")).data;
  // console.log("update token List")
  return prices;
};
