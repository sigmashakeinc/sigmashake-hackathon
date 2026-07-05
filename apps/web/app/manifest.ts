import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "SSG-Hackathon",
    short_name: "SSG",
    description: "Invite-only collaborative workstation for hackathon teams.",
    start_url: "/",
    display: "standalone",
    background_color: "#121414",
    theme_color: "#e01e2e",
    icons: [
      { src: "/logo-192.png", sizes: "192x192", type: "image/png" },
    ],
  };
}
