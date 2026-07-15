import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Taj Tyre Works",
    short_name: "Taj Tyres",
    description: "Taj Tyre Works offers premium tyres, tubes, batteries, wheel alignment, wheel balancing, nitrogen filling, puncture repair and automotive services.",
    start_url: "/",
    display: "standalone",
    background_color: "#0a0a0a",
    theme_color: "#ef4444",
    icons: [
      {
        src: "/favicon.ico",
        sizes: "any",
        type: "image/x-icon",
      },
    ],
  };
}
