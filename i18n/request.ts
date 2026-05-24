import { getRequestConfig } from "next-intl/server";
import { routing } from "./routing";

export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;
  const locale = (routing.locales as readonly string[]).includes(requested ?? "")
    ? requested!
    : routing.defaultLocale;

  const messages =
    locale === "zh"
      ? (await import("../messages/zh.json")).default
      : (await import("../messages/en.json")).default;

  return { locale, messages };
});
