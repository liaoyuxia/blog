import { useEffect, useState } from "react";
import AdminApp from "./AdminApp";
import BlogHome from "./BlogHome";
import BlogJournal from "./BlogJournal";
import { DEFAULT_LANGUAGE, LANGUAGE_STORAGE_KEY } from "./i18n";

function getInitialLanguage() {
  const saved = window.localStorage.getItem(LANGUAGE_STORAGE_KEY);
  return saved === "en" ? "en" : DEFAULT_LANGUAGE;
}

function getCurrentView() {
  const rawHash = window.location.hash.replace(/^#\/?/, "");

  if (!rawHash) {
    return { page: "home", section: "" };
  }

  const [page, section = ""] = rawHash.split("/");
  if (page === "journal") {
    return { page: "journal", section };
  }

  return { page: "home", section: page === "about" ? "about" : "" };
}

export default function App() {
  const [language, setLanguage] = useState(getInitialLanguage);
  const isAdminRoute = window.location.pathname.startsWith("/admin");
  const [view, setView] = useState(getCurrentView);

  useEffect(() => {
    window.localStorage.setItem(LANGUAGE_STORAGE_KEY, language);
  }, [language]);

  useEffect(() => {
    function handleHashChange() {
      setView(getCurrentView());
    }

    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  useEffect(() => {
    document.documentElement.lang = language === "en" ? "en" : "zh-CN";
    document.title = isAdminRoute
      ? language === "en"
        ? "Bing Studio Admin"
        : "Bing Studio 管理后台"
      : view.page === "journal"
        ? language === "en"
          ? view.section === "messages"
            ? "Bing Studio Messages"
            : "Bing Studio Articles"
          : view.section === "messages"
            ? "Bing Studio 留言"
            : "Bing Studio 文章"
        : language === "en"
          ? "Bing Studio Blog"
          : "Bing Studio 博客";
  }, [isAdminRoute, language, view.page, view.section]);

  if (isAdminRoute) {
    return <AdminApp language={language} onLanguageChange={setLanguage} />;
  }

  if (view.page === "journal") {
    return (
      <BlogJournal
        language={language}
        onLanguageChange={setLanguage}
        initialSection={view.section}
      />
    );
  }

  return <BlogHome language={language} onLanguageChange={setLanguage} />;
}
