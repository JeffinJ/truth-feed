import { getInitialTruths } from "@/server/truth-service";
import TruthSocialFeed from "./truth-social-feeed";

export default async function TruthFeedContainer() {
  const data = await getInitialTruths();
  if (!data) throw new Error("No data available");

  return <TruthSocialFeed initialTruths={data} />;
}