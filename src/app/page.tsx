import ErrorFallback from "@/components/error-fallback";
import TruthSocialFeed from "@/components/truth-social-feeed";
import { getInitialTruths } from "@/server/truth-service";
import { Suspense } from "react";

export default async function Home() {
  try {
    const data = await getInitialTruths();
    if (!data) throw new Error("No data available");

    return (
      <div className="bg-[#050A0F] min-h-screen p-5">
        <Suspense fallback={
          <div className="flex items-center justify-center min-h-screen">
            <div className="text-center">
              <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
              <p className="text-lg text-gray-300">Loading content...</p>
            </div>
          </div>
        }>
          <TruthSocialFeed initialTruths={data} />
        </Suspense>
      </div>
    );
  } catch (error) {
    return <ErrorFallback error={error as Error} />;
  }
}