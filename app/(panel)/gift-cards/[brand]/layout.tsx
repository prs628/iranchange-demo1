const giftCardBrands = ["playstation", "fortnite", "amazon", "netflix", "steam", "itunes", "google-play", "spotify", "xbox", "flow-money"];
export function generateStaticParams() {
  return giftCardBrands.map((brand) => ({ brand }));
}
export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
