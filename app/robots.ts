import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/api/", "/login", "/dashboard"],
    },
    sitemap: `${process.env.PRODUCTION_URL}/sitemap.xml`,
  };
}
