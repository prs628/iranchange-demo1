// Layout for dynamic gift card pages
// This file is needed for static export to generate all brand pages

// Gift card brands data (must match the data in page.tsx)
const giftCardBrands = [
  "playstation",
  "fortnite",
  "amazon",
  "netflix",
  "steam",
  "itunes",
  "google-play",
  "spotify",
  "xbox",
  "flow-money",
];

// Generate static params for all gift card brands (required for static export)
export function generateStaticParams() {
  return giftCardBrands.map((brand) => ({
    brand: brand,
  }));
}

export default function GiftCardBrandLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

