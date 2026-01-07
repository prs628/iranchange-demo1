"use client";

export default function BuildBadge() {
  // Get build SHA from environment variable (set at build time via webpack DefinePlugin)
  const buildSha = process.env.NEXT_PUBLIC_BUILD_SHA || "local";
  const shortSha = buildSha.length > 7 ? buildSha.substring(0, 7) : buildSha;

  return (
    <div className="fixed bottom-2 left-2 z-[9999] px-2 py-1 bg-black/60 backdrop-blur-sm text-white text-[10px] font-mono rounded border border-white/20">
      BUILD: {shortSha}
    </div>
  );
}

