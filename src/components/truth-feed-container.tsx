
import TruthSocialFeed from "./truth-social-feeed";

const getInitialTruths = async () => {
  const API_BASE_URL = process.env.NEXT_PUBLIC_TRUTH_API;
  if (!API_BASE_URL) throw new Error("API URL is not defined");
  const API_URL = `${API_BASE_URL}/truths/latest`;
  const data = await fetch(API_URL)
  const response = await data.json();
  if (!response || !response.data) {
    throw new Error("No data available from the API");
  }
  return response;
}

export default async function TruthFeedContainer() {
  const data = await getInitialTruths();
  if (!data) throw new Error("No data available");

  return <TruthSocialFeed initialTruths={data} />;
}