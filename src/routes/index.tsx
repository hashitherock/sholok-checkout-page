import { createFileRoute } from "@tanstack/react-router";
import Checkout from "@/features/checkout/Checkout";

// The home route ships no og:image, so serve-time hosting can inject the
// project's social preview (explicit og:image or latest screenshot).
export const Route = createFileRoute("/")({
  head: () => ({ meta: [
    { title: "Secure Checkout — Complete Your Order | SHOLOK" },
    { name: "description", content: "Review your SHOLOK products, choose your Bangladesh delivery address and complete a local demo checkout." },
    { property: "og:title", content: "Secure Checkout | SHOLOK" },
    { property: "og:description", content: "Review your order and enter your delivery details at SHOLOK." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ] }),
  component: Checkout,
});
