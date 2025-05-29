import { UserConfig } from "next-i18next";

const nextI18NextConfig: UserConfig = {
  i18n: {
    defaultLocale: "en",
    locales: ["en", "fr", "ar"],
  },
  localePath: typeof window === "undefined" 
    ? require("path").resolve("./public/locales") 
    : "/locales",
};

export default nextI18NextConfig;