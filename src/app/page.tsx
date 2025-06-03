import TruthSocialFeed from "@/components/truth-social-feeed";
import { getInitialTruths } from "@/server/truth-service";

export default async function Home() {
  const data = await getInitialTruths();
  if (!data) throw new Error("API call to get initial truths failed");
  return (
    <div className="bg-[#050A0F] min-h-screen p-5 flex flex-col items-center justify-center">
        <TruthSocialFeed initialTruths={data} />
    </div>
  );

}