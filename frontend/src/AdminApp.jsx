import { useEffect, useState } from "react";
import {
  deleteAdminComment,
  createAdminPost,
  createBasicAuthToken,
  fetchAdminComments,
  deleteAdminMessage,
  deleteAdminPost,
  fetchAdminMessages,
  fetchAdminPosts,
  fetchAdminSession,
  fetchAdminSettings,
  fetchStats,
  uploadAdminCover,
  updateAdminPost,
  updateAdminSettings,
} from "./api/blog";
import { getAdminCopy, getPublicCopy } from "./i18n";

const TOKEN_STORAGE_KEY = "lin-blog-admin-token";

const emptyPostForm = {
  title: "",
  slug: "",
  excerpt: "",
  content: "",
  category: "",
  tagsText: "",
  publishedAt: "",
  readingTime: "",
  cover: "",
  featured: false,
  status: "PUBLISHED",
};

const coverPresets = {
  zh: [
    { value: "", label: "自定义背景" },
    { value: "linear-gradient(135deg, #0f3d3e 0%, #145c5f 55%, #f2b880 100%)", label: "青铜海岸" },
    { value: "linear-gradient(135deg, #183a5a 0%, #245c7a 50%, #9ed8db 100%)", label: "深海蓝图" },
    { value: "linear-gradient(135deg, #483c46 0%, #6b4c7b 45%, #d4a5a5 100%)", label: "夜色手稿" },
    { value: "linear-gradient(135deg, #5d2a42 0%, #fb6376 50%, #ffdccc 100%)", label: "落日封面" },
    { value: "linear-gradient(135deg, #233d4d 0%, #4f6d7a 52%, #c1d37f 100%)", label: "技术年鉴" },
  ],
  en: [
    { value: "", label: "Custom background" },
    { value: "linear-gradient(135deg, #0f3d3e 0%, #145c5f 55%, #f2b880 100%)", label: "Bronze coast" },
    { value: "linear-gradient(135deg, #183a5a 0%, #245c7a 50%, #9ed8db 100%)", label: "Deep blueprint" },
    { value: "linear-gradient(135deg, #483c46 0%, #6b4c7b 45%, #d4a5a5 100%)", label: "Midnight manuscript" },
    { value: "linear-gradient(135deg, #5d2a42 0%, #fb6376 50%, #ffdccc 100%)", label: "Sunset editorial" },
    { value: "linear-gradient(135deg, #233d4d 0%, #4f6d7a 52%, #c1d37f 100%)", label: "Technical almanac" },
  ],
};

const emptySettingsForm = {
  brandName: "",
  avatarUrl: "",
  roleZh: "",
  roleEn: "",
  bioZh: "",
  bioEn: "",
  locationZh: "",
  locationEn: "",
  email: "",
  specialtiesZh: "",
  specialtiesEn: "",
  homeAboutTitleZh: "",
  homeAboutTitleEn: "",
  homeAboutDescriptionZh: "",
  homeAboutDescriptionEn: "",
  homePillarsTitleZh: "",
  homePillarsTitleEn: "",
  homePillarsZh: "",
  homePillarsEn: "",
  homeJourneyTitleZh: "",
  homeJourneyTitleEn: "",
  homeJourneyDescriptionZh: "",
  homeJourneyDescriptionEn: "",
  footerProductZh: "",
  footerProductEn: "",
  footerStackZh: "",
  footerStackEn: "",
};

function LanguageSwitcher({ language, onLanguageChange, publicCopy }) {
  return (
    <div className="language-switch" aria-label="language switch">
      <button
        className={language === "zh" ? "language-pill active-language" : "language-pill"}
        onClick={() => onLanguageChange("zh")}
        type="button"
      >
        {publicCopy.languageZh}
      </button>
      <button
        className={language === "en" ? "language-pill active-language" : "language-pill"}
        onClick={() => onLanguageChange("en")}
        type="button"
      >
        {publicCopy.languageEn}
      </button>
    </div>
  );
}

function BrandMark({ avatarUrl, name }) {
  return (
    <div className={`brand-mark ${avatarUrl ? "brand-mark-avatar" : ""}`}>
      {avatarUrl ? <img src={avatarUrl} alt={name || "Bing Studio"} /> : "BS"}
    </div>
  );
}

function toPayload(formData) {
  return {
    title: formData.title.trim(),
    slug: formData.slug.trim(),
    excerpt: formData.excerpt.trim(),
    content: formData.content.trim(),
    category: formData.category.trim(),
    tags: formData.tagsText
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean),
    publishedAt: formData.publishedAt.trim(),
    readingTime: formData.readingTime.trim(),
    cover: formData.cover.trim(),
    featured: formData.featured,
    status: formData.status,
  };
}

function fromPost(post) {
  return {
    title: post.title,
    slug: post.slug,
    excerpt: post.excerpt,
    content: post.content,
    category: post.category,
    tagsText: post.tags.join(", "),
    publishedAt: post.publishedAt,
    readingTime: post.readingTime,
    cover: post.cover || "",
    featured: post.featured,
    status: post.status || "PUBLISHED",
  };
}

function toLineText(items) {
  return (items || []).join("\n");
}

function toSettingsForm(settings) {
  return {
    brandName: settings.brandName || "",
    avatarUrl: settings.avatarUrl || "",
    roleZh: settings.roleZh || "",
    roleEn: settings.roleEn || "",
    bioZh: settings.bioZh || "",
    bioEn: settings.bioEn || "",
    locationZh: settings.locationZh || "",
    locationEn: settings.locationEn || "",
    email: settings.email || "",
    specialtiesZh: toLineText(settings.specialtiesZh),
    specialtiesEn: toLineText(settings.specialtiesEn),
    homeAboutTitleZh: settings.homeAboutTitleZh || "",
    homeAboutTitleEn: settings.homeAboutTitleEn || "",
    homeAboutDescriptionZh: settings.homeAboutDescriptionZh || "",
    homeAboutDescriptionEn: settings.homeAboutDescriptionEn || "",
    homePillarsTitleZh: settings.homePillarsTitleZh || "",
    homePillarsTitleEn: settings.homePillarsTitleEn || "",
    homePillarsZh: toLineText(settings.homePillarsZh),
    homePillarsEn: toLineText(settings.homePillarsEn),
    homeJourneyTitleZh: settings.homeJourneyTitleZh || "",
    homeJourneyTitleEn: settings.homeJourneyTitleEn || "",
    homeJourneyDescriptionZh: settings.homeJourneyDescriptionZh || "",
    homeJourneyDescriptionEn: settings.homeJourneyDescriptionEn || "",
    footerProductZh: settings.footerProductZh || "",
    footerProductEn: settings.footerProductEn || "",
    footerStackZh: settings.footerStackZh || "",
    footerStackEn: settings.footerStackEn || "",
  };
}

function splitLines(value) {
  return value
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean);
}

function toSettingsPayload(formData) {
  return {
    brandName: formData.brandName.trim(),
    avatarUrl: formData.avatarUrl.trim(),
    roleZh: formData.roleZh.trim(),
    roleEn: formData.roleEn.trim(),
    bioZh: formData.bioZh.trim(),
    bioEn: formData.bioEn.trim(),
    locationZh: formData.locationZh.trim(),
    locationEn: formData.locationEn.trim(),
    email: formData.email.trim(),
    specialtiesZh: splitLines(formData.specialtiesZh),
    specialtiesEn: splitLines(formData.specialtiesEn),
    homeAboutTitleZh: formData.homeAboutTitleZh.trim(),
    homeAboutTitleEn: formData.homeAboutTitleEn.trim(),
    homeAboutDescriptionZh: formData.homeAboutDescriptionZh.trim(),
    homeAboutDescriptionEn: formData.homeAboutDescriptionEn.trim(),
    homePillarsTitleZh: formData.homePillarsTitleZh.trim(),
    homePillarsTitleEn: formData.homePillarsTitleEn.trim(),
    homePillarsZh: splitLines(formData.homePillarsZh),
    homePillarsEn: splitLines(formData.homePillarsEn),
    homeJourneyTitleZh: formData.homeJourneyTitleZh.trim(),
    homeJourneyTitleEn: formData.homeJourneyTitleEn.trim(),
    homeJourneyDescriptionZh: formData.homeJourneyDescriptionZh.trim(),
    homeJourneyDescriptionEn: formData.homeJourneyDescriptionEn.trim(),
    footerProductZh: formData.footerProductZh.trim(),
    footerProductEn: formData.footerProductEn.trim(),
    footerStackZh: formData.footerStackZh.trim(),
    footerStackEn: formData.footerStackEn.trim(),
  };
}

export default function AdminApp({ language, onLanguageChange }) {
  const copy = getAdminCopy(language);
  const publicCopy = getPublicCopy(language);
  const currentCoverPresets = coverPresets[language] || coverPresets.zh;
  const [credentials, setCredentials] = useState({ username: "", password: "" });
  const [authToken, setAuthToken] = useState(() => window.sessionStorage.getItem(TOKEN_STORAGE_KEY) || "");
  const [session, setSession] = useState(null);
  const [posts, setPosts] = useState([]);
  const [messages, setMessages] = useState([]);
  const [comments, setComments] = useState([]);
  const [stats, setStats] = useState(null);
  const [settings, setSettings] = useState(null);
  const [editingPostId, setEditingPostId] = useState(null);
  const [formData, setFormData] = useState(emptyPostForm);
  const [settingsForm, setSettingsForm] = useState(emptySettingsForm);
  const [statusMessage, setStatusMessage] = useState(copy.statusIdle);
  const [loading, setLoading] = useState(Boolean(authToken));
  const [uploadingCover, setUploadingCover] = useState(false);

  async function bootstrapAdmin(nextToken, errorMessage) {
    try {
      setLoading(true);
      const [sessionData, postData, messageData, commentData, statsData] = await Promise.all([
        fetchAdminSession(nextToken),
        fetchAdminPosts(nextToken),
        fetchAdminMessages(nextToken),
        fetchAdminComments(nextToken),
        fetchStats(),
      ]);

      window.sessionStorage.setItem(TOKEN_STORAGE_KEY, nextToken);
      setAuthToken(nextToken);
      setSession(sessionData);
      setPosts(postData);
      setMessages(messageData);
      setComments(commentData);
      setStats(statsData);
      setStatusMessage(copy.statusIdle);

      try {
        const settingsData = await fetchAdminSettings(nextToken);
        setSettings(settingsData);
        setSettingsForm(toSettingsForm(settingsData));
      } catch (settingsError) {
        setSettings(null);
        setSettingsForm(emptySettingsForm);
        setStatusMessage(copy.settingsLoadFallback);
      }
    } catch (requestError) {
      window.sessionStorage.removeItem(TOKEN_STORAGE_KEY);
      setAuthToken("");
      setSession(null);
      setPosts([]);
      setMessages([]);
      setComments([]);
      setSettings(null);
      setStats(null);
      setSettingsForm(emptySettingsForm);
      setStatusMessage(requestError.message === "Request timeout" ? copy.sessionError : errorMessage);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!authToken) {
      return;
    }

    bootstrapAdmin(authToken, copy.sessionError);
  }, []);

  async function handleLogin(event) {
    event.preventDefault();
    const nextToken = createBasicAuthToken(credentials.username, credentials.password);
    setStatusMessage(copy.loading);
    await bootstrapAdmin(nextToken, copy.loginError);
  }

  function handleLogout() {
    window.sessionStorage.removeItem(TOKEN_STORAGE_KEY);
    setAuthToken("");
    setSession(null);
    setPosts([]);
    setMessages([]);
    setComments([]);
    setStats(null);
    setSettings(null);
    setEditingPostId(null);
    setFormData(emptyPostForm);
    setSettingsForm(emptySettingsForm);
    setStatusMessage(copy.statusIdle);
  }

  async function handleSaveSettings(event) {
    event.preventDefault();

    try {
      const payload = toSettingsPayload(settingsForm);
      const savedSettings = await updateAdminSettings(payload, authToken);
      const latestStats = await fetchStats();

      setSettings(savedSettings);
      setSettingsForm(toSettingsForm(savedSettings));
      setStats(latestStats);
      setStatusMessage(copy.settingsSaved);
    } catch (requestError) {
      setStatusMessage(requestError.message || copy.sessionError);
    }
  }

  async function handleSavePost(event) {
    event.preventDefault();

    try {
      const payload = toPayload(formData);
      const savedPost = editingPostId
        ? await updateAdminPost(editingPostId, payload, authToken)
        : await createAdminPost(payload, authToken);
      const latestStats = await fetchStats();

      setPosts((current) => {
        if (!editingPostId) {
          return [savedPost, ...current];
        }

        return current.map((item) => (item.id === savedPost.id ? savedPost : item));
      });
      setStats(latestStats);
      setEditingPostId(null);
      setFormData(emptyPostForm);
      setStatusMessage(copy.postSaved);
    } catch (requestError) {
      setStatusMessage(requestError.message || copy.sessionError);
    }
  }

  async function handleUploadCover(event) {
    const [file] = event.target.files || [];
    event.target.value = "";

    if (!file) {
      return;
    }

    try {
      setUploadingCover(true);
      const uploaded = await uploadAdminCover(file, authToken);
      setFormData((current) => ({ ...current, cover: uploaded.url }));
      setStatusMessage(copy.postCoverUploadSuccess);
    } catch (requestError) {
      setStatusMessage(requestError.message || copy.sessionError);
    } finally {
      setUploadingCover(false);
    }
  }

  function handleEditPost(post) {
    if (!window.confirm(copy.editPostConfirm)) {
      return;
    }

    setEditingPostId(post.id);
    setFormData(fromPost(post));
    setStatusMessage(copy.statusIdle);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function handleCancelEdit() {
    setEditingPostId(null);
    setFormData(emptyPostForm);
    setStatusMessage(copy.statusIdle);
  }

  async function handleDeletePost(id) {
    if (!window.confirm(copy.deletePostConfirm)) {
      return;
    }

    try {
      await deleteAdminPost(id, authToken);
      const latestStats = await fetchStats();
      setPosts((current) => current.filter((item) => item.id !== id));
      setComments((current) => current.filter((item) => item.postId !== id));
      setStats(latestStats);
      if (editingPostId === id) {
        handleCancelEdit();
      }
      setStatusMessage(copy.postDeleted);
    } catch (requestError) {
      setStatusMessage(requestError.message || copy.sessionError);
    }
  }

  async function handleDeleteMessage(id) {
    if (!window.confirm(copy.deleteMessageConfirm)) {
      return;
    }

    try {
      await deleteAdminMessage(id, authToken);
      const latestStats = await fetchStats();
      setMessages((current) => current.filter((item) => item.id !== id));
      setStats(latestStats);
      setStatusMessage(copy.messageDeleted);
    } catch (requestError) {
      setStatusMessage(requestError.message || copy.sessionError);
    }
  }

  async function handleDeleteComment(id) {
    const targetComment = comments.find((item) => item.id === id);
    if (!window.confirm(copy.deleteCommentConfirm)) {
      return;
    }

    try {
      await deleteAdminComment(id, authToken);
      setComments((current) => current.filter((item) => item.id !== id));
      setPosts((current) =>
        current.map((item) =>
          item.slug === targetComment?.postSlug
            ? { ...item, commentCount: Math.max(0, (item.commentCount || 0) - 1) }
            : item
        )
      );
      setStatusMessage(copy.commentDeleted);
    } catch (requestError) {
      setStatusMessage(requestError.message || copy.sessionError);
    }
  }

  const selectedCoverPreset = currentCoverPresets.some((item) => item.value === formData.cover)
    ? formData.cover
    : "";

  if (loading) {
    return <div className="loading-screen">{copy.loading}</div>;
  }

  if (!authToken) {
    return (
      <div className="page-shell admin-shell">
        <header className="topbar admin-topbar">
          <div className="brand">
            <BrandMark avatarUrl={settings?.avatarUrl} name={settings?.brandName || copy.brandTitle} />
            <div>
              <span className="eyebrow">{copy.brandEyebrow}</span>
              <strong>{copy.brandTitle}</strong>
            </div>
          </div>
          <div className="topbar-tools">
            <a href="/" className="button secondary">
              {copy.backToSite}
            </a>
            <LanguageSwitcher
              language={language}
              onLanguageChange={onLanguageChange}
              publicCopy={publicCopy}
            />
          </div>
        </header>

        <main className="admin-login-layout">
          <section className="panel admin-intro-card">
            <p className="eyebrow">{copy.introEyebrow}</p>
            <h1>{copy.adminTitle}</h1>
            <p className="hero-bio">{copy.adminDescription}</p>
          </section>

          <form className="panel admin-login-card" onSubmit={handleLogin}>
            <div className="subheading">
              <h3>{copy.loginTitle}</h3>
            </div>
            <p className="admin-helper">{copy.loginDescription}</p>
            <label>
              <span>{copy.username}</span>
              <input
                value={credentials.username}
                onChange={(event) =>
                  setCredentials((current) => ({ ...current, username: event.target.value }))
                }
                required
              />
            </label>
            <label>
              <span>{copy.password}</span>
              <input
                type="password"
                value={credentials.password}
                onChange={(event) =>
                  setCredentials((current) => ({ ...current, password: event.target.value }))
                }
                required
              />
            </label>
            <button className="button primary" type="submit">
              {copy.login}
            </button>
            <p className="form-status">{statusMessage}</p>
          </form>
        </main>
      </div>
    );
  }

  return (
    <div className="page-shell admin-shell">
      <header className="topbar admin-topbar">
        <div className="brand">
          <BrandMark avatarUrl={settingsForm.avatarUrl || settings?.avatarUrl} name={settings?.brandName || copy.brandTitle} />
          <div>
            <span className="eyebrow">{copy.brandEyebrow}</span>
            <strong>{settings?.brandName || copy.brandTitle}</strong>
          </div>
        </div>
        <div className="topbar-tools">
          <div className="admin-session">
            <span>{session?.username}</span>
            <button className="button secondary" onClick={handleLogout} type="button">
              {copy.logout}
            </button>
            <a href="/" className="button secondary">
              {copy.backToSite}
            </a>
          </div>
          <LanguageSwitcher
            language={language}
            onLanguageChange={onLanguageChange}
            publicCopy={publicCopy}
          />
        </div>
      </header>

      <main className="admin-layout admin-layout-upgraded">
        <section className="admin-main-column">
          <article className="panel admin-form-card">
            <div className="subheading">
              <h3>{copy.settingsTitle}</h3>
              <span>{copy.settingsDescription}</span>
            </div>
            <form className="form-card admin-form" onSubmit={handleSaveSettings}>
              <div className="admin-settings-header">
                <div className="admin-avatar-preview">
                  {settingsForm.avatarUrl ? (
                    <img src={settingsForm.avatarUrl} alt={settingsForm.brandName || "site avatar"} />
                  ) : (
                    <span>{(settingsForm.brandName || "BS").slice(0, 2).toUpperCase()}</span>
                  )}
                </div>
                <div className="admin-settings-identity">
                  <strong>{settingsForm.brandName || copy.brandTitle}</strong>
                  <span>{settingsForm.email || "hello@bingstudio.dev"}</span>
                </div>
              </div>

              <div className="admin-form-grid">
                <label>
                  <span>{copy.brandName}</span>
                  <input
                    value={settingsForm.brandName}
                    onChange={(event) =>
                      setSettingsForm((current) => ({ ...current, brandName: event.target.value }))
                    }
                    required
                  />
                </label>
                <label>
                  <span>{copy.avatarUrl}</span>
                  <input
                    value={settingsForm.avatarUrl}
                    onChange={(event) =>
                      setSettingsForm((current) => ({ ...current, avatarUrl: event.target.value }))
                    }
                  />
                </label>
                <label>
                  <span>{copy.roleZh}</span>
                  <input
                    value={settingsForm.roleZh}
                    onChange={(event) =>
                      setSettingsForm((current) => ({ ...current, roleZh: event.target.value }))
                    }
                    required
                  />
                </label>
                <label>
                  <span>{copy.roleEn}</span>
                  <input
                    value={settingsForm.roleEn}
                    onChange={(event) =>
                      setSettingsForm((current) => ({ ...current, roleEn: event.target.value }))
                    }
                    required
                  />
                </label>
                <label>
                  <span>{copy.locationZh}</span>
                  <input
                    value={settingsForm.locationZh}
                    onChange={(event) =>
                      setSettingsForm((current) => ({ ...current, locationZh: event.target.value }))
                    }
                    required
                  />
                </label>
                <label>
                  <span>{copy.locationEn}</span>
                  <input
                    value={settingsForm.locationEn}
                    onChange={(event) =>
                      setSettingsForm((current) => ({ ...current, locationEn: event.target.value }))
                    }
                    required
                  />
                </label>
                <label>
                  <span>{publicCopy.emailLabel}</span>
                  <input
                    type="email"
                    value={settingsForm.email}
                    onChange={(event) =>
                      setSettingsForm((current) => ({ ...current, email: event.target.value }))
                    }
                    required
                  />
                </label>
                <label>
                  <span>{copy.footerProductZh}</span>
                  <input
                    value={settingsForm.footerProductZh}
                    onChange={(event) =>
                      setSettingsForm((current) => ({ ...current, footerProductZh: event.target.value }))
                    }
                    required
                  />
                </label>
                <label>
                  <span>{copy.footerProductEn}</span>
                  <input
                    value={settingsForm.footerProductEn}
                    onChange={(event) =>
                      setSettingsForm((current) => ({ ...current, footerProductEn: event.target.value }))
                    }
                    required
                  />
                </label>
                <label>
                  <span>{copy.footerStackZh}</span>
                  <input
                    value={settingsForm.footerStackZh}
                    onChange={(event) =>
                      setSettingsForm((current) => ({ ...current, footerStackZh: event.target.value }))
                    }
                    required
                  />
                </label>
                <label>
                  <span>{copy.footerStackEn}</span>
                  <input
                    value={settingsForm.footerStackEn}
                    onChange={(event) =>
                      setSettingsForm((current) => ({ ...current, footerStackEn: event.target.value }))
                    }
                    required
                  />
                </label>
              </div>

              <label>
                <span>{copy.bioZh}</span>
                <textarea
                  rows="4"
                  value={settingsForm.bioZh}
                  onChange={(event) =>
                    setSettingsForm((current) => ({ ...current, bioZh: event.target.value }))
                  }
                  required
                />
              </label>
              <label>
                <span>{copy.bioEn}</span>
                <textarea
                  rows="4"
                  value={settingsForm.bioEn}
                  onChange={(event) =>
                    setSettingsForm((current) => ({ ...current, bioEn: event.target.value }))
                  }
                  required
                />
              </label>

              <div className="admin-form-grid">
                <label>
                  <span>{copy.specialtiesZh}</span>
                  <textarea
                    rows="4"
                    value={settingsForm.specialtiesZh}
                    onChange={(event) =>
                      setSettingsForm((current) => ({ ...current, specialtiesZh: event.target.value }))
                    }
                    required
                  />
                </label>
                <label>
                  <span>{copy.specialtiesEn}</span>
                  <textarea
                    rows="4"
                    value={settingsForm.specialtiesEn}
                    onChange={(event) =>
                      setSettingsForm((current) => ({ ...current, specialtiesEn: event.target.value }))
                    }
                    required
                  />
                </label>
              </div>
              <p className="admin-helper">{copy.multilineHint}</p>

              <div className="admin-form-grid">
                <label>
                  <span>{copy.homeAboutTitleZh}</span>
                  <input
                    value={settingsForm.homeAboutTitleZh}
                    onChange={(event) =>
                      setSettingsForm((current) => ({ ...current, homeAboutTitleZh: event.target.value }))
                    }
                    required
                  />
                </label>
                <label>
                  <span>{copy.homeAboutTitleEn}</span>
                  <input
                    value={settingsForm.homeAboutTitleEn}
                    onChange={(event) =>
                      setSettingsForm((current) => ({ ...current, homeAboutTitleEn: event.target.value }))
                    }
                    required
                  />
                </label>
              </div>

              <div className="admin-form-grid">
                <label>
                  <span>{copy.homeAboutDescriptionZh}</span>
                  <textarea
                    rows="4"
                    value={settingsForm.homeAboutDescriptionZh}
                    onChange={(event) =>
                      setSettingsForm((current) => ({ ...current, homeAboutDescriptionZh: event.target.value }))
                    }
                    required
                  />
                </label>
                <label>
                  <span>{copy.homeAboutDescriptionEn}</span>
                  <textarea
                    rows="4"
                    value={settingsForm.homeAboutDescriptionEn}
                    onChange={(event) =>
                      setSettingsForm((current) => ({ ...current, homeAboutDescriptionEn: event.target.value }))
                    }
                    required
                  />
                </label>
              </div>

              <div className="admin-form-grid">
                <label>
                  <span>{copy.homePillarsTitleZh}</span>
                  <input
                    value={settingsForm.homePillarsTitleZh}
                    onChange={(event) =>
                      setSettingsForm((current) => ({ ...current, homePillarsTitleZh: event.target.value }))
                    }
                    required
                  />
                </label>
                <label>
                  <span>{copy.homePillarsTitleEn}</span>
                  <input
                    value={settingsForm.homePillarsTitleEn}
                    onChange={(event) =>
                      setSettingsForm((current) => ({ ...current, homePillarsTitleEn: event.target.value }))
                    }
                    required
                  />
                </label>
              </div>

              <div className="admin-form-grid">
                <label>
                  <span>{copy.homePillarsZh}</span>
                  <textarea
                    rows="5"
                    value={settingsForm.homePillarsZh}
                    onChange={(event) =>
                      setSettingsForm((current) => ({ ...current, homePillarsZh: event.target.value }))
                    }
                    required
                  />
                </label>
                <label>
                  <span>{copy.homePillarsEn}</span>
                  <textarea
                    rows="5"
                    value={settingsForm.homePillarsEn}
                    onChange={(event) =>
                      setSettingsForm((current) => ({ ...current, homePillarsEn: event.target.value }))
                    }
                    required
                  />
                </label>
              </div>

              <div className="admin-form-grid">
                <label>
                  <span>{copy.homeJourneyTitleZh}</span>
                  <input
                    value={settingsForm.homeJourneyTitleZh}
                    onChange={(event) =>
                      setSettingsForm((current) => ({ ...current, homeJourneyTitleZh: event.target.value }))
                    }
                    required
                  />
                </label>
                <label>
                  <span>{copy.homeJourneyTitleEn}</span>
                  <input
                    value={settingsForm.homeJourneyTitleEn}
                    onChange={(event) =>
                      setSettingsForm((current) => ({ ...current, homeJourneyTitleEn: event.target.value }))
                    }
                    required
                  />
                </label>
              </div>

              <div className="admin-form-grid">
                <label>
                  <span>{copy.homeJourneyDescriptionZh}</span>
                  <textarea
                    rows="4"
                    value={settingsForm.homeJourneyDescriptionZh}
                    onChange={(event) =>
                      setSettingsForm((current) => ({ ...current, homeJourneyDescriptionZh: event.target.value }))
                    }
                    required
                  />
                </label>
                <label>
                  <span>{copy.homeJourneyDescriptionEn}</span>
                  <textarea
                    rows="4"
                    value={settingsForm.homeJourneyDescriptionEn}
                    onChange={(event) =>
                      setSettingsForm((current) => ({ ...current, homeJourneyDescriptionEn: event.target.value }))
                    }
                    required
                  />
                </label>
              </div>

              <button className="button primary" type="submit">
                {copy.saveSettings}
              </button>
              <p className="form-status">{statusMessage}</p>
            </form>
          </article>

          <section className="panel admin-form-card">
            <div className="subheading">
              <h3>{editingPostId ? copy.editPost : copy.newPost}</h3>
              {editingPostId ? (
                <button className="button secondary" onClick={handleCancelEdit} type="button">
                  {copy.cancelEdit}
                </button>
              ) : null}
            </div>
            <form className="form-card admin-form" onSubmit={handleSavePost}>
              <label>
                <span>{copy.postTitle}</span>
                <input
                  value={formData.title}
                  onChange={(event) =>
                    setFormData((current) => ({ ...current, title: event.target.value }))
                  }
                  required
                />
              </label>
              <label>
                <span>{copy.postSlug}</span>
                <input
                  value={formData.slug}
                  onChange={(event) =>
                    setFormData((current) => ({ ...current, slug: event.target.value }))
                  }
                  required
                />
              </label>
              <label>
                <span>{copy.postExcerpt}</span>
                <textarea
                  rows="3"
                  value={formData.excerpt}
                  onChange={(event) =>
                    setFormData((current) => ({ ...current, excerpt: event.target.value }))
                  }
                  required
                />
              </label>
              <label>
                <span>{copy.postContent}</span>
                <textarea
                  rows="10"
                  value={formData.content}
                  onChange={(event) =>
                    setFormData((current) => ({ ...current, content: event.target.value }))
                  }
                  required
                />
              </label>
              <div className="admin-form-grid">
                <label>
                  <span>{copy.postCategory}</span>
                  <input
                    value={formData.category}
                    onChange={(event) =>
                      setFormData((current) => ({ ...current, category: event.target.value }))
                    }
                    required
                  />
                </label>
                <label>
                  <span>{copy.postTags}</span>
                  <input
                    value={formData.tagsText}
                    onChange={(event) =>
                      setFormData((current) => ({ ...current, tagsText: event.target.value }))
                    }
                    required
                  />
                </label>
                <label>
                  <span>{copy.postDate}</span>
                  <input
                    type="date"
                    value={formData.publishedAt}
                    onChange={(event) =>
                      setFormData((current) => ({ ...current, publishedAt: event.target.value }))
                    }
                    required
                  />
                </label>
                <label>
                  <span>{copy.postReadingTime}</span>
                  <input
                    value={formData.readingTime}
                    onChange={(event) =>
                      setFormData((current) => ({ ...current, readingTime: event.target.value }))
                    }
                    required
                  />
                </label>
                <label>
                  <span>{copy.postStatus}</span>
                  <select
                    value={formData.status}
                    onChange={(event) =>
                      setFormData((current) => ({ ...current, status: event.target.value }))
                    }
                  >
                    <option value="PUBLISHED">{copy.postStatusPublished}</option>
                    <option value="DRAFT">{copy.postStatusDraft}</option>
                  </select>
                </label>
              </div>
              <label>
                <span>{copy.postCoverPreset}</span>
                <select
                  value={selectedCoverPreset}
                  onChange={(event) =>
                    setFormData((current) => ({ ...current, cover: event.target.value }))
                  }
                >
                  {currentCoverPresets.map((preset) => (
                    <option key={preset.label} value={preset.value}>
                      {preset.label}
                    </option>
                  ))}
                </select>
              </label>
              <div className="admin-cover-presets">
                {currentCoverPresets.slice(1).map((preset) => (
                  <button
                    key={preset.label}
                    className={`cover-swatch ${formData.cover === preset.value ? "is-active" : ""}`}
                    style={{ background: preset.value }}
                    type="button"
                    onClick={() => setFormData((current) => ({ ...current, cover: preset.value }))}
                    aria-label={preset.label}
                    title={preset.label}
                  />
                ))}
              </div>
              <label>
                <span>{copy.postCoverUpload}</span>
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp,image/gif,image/avif"
                  onChange={handleUploadCover}
                  disabled={uploadingCover}
                />
              </label>
              <p className="admin-helper">
                {uploadingCover ? publicCopy.submitting : copy.postCoverUploadHint}
              </p>
              <label>
                <span>{copy.postCover}</span>
                <input
                  value={formData.cover}
                  onChange={(event) =>
                    setFormData((current) => ({ ...current, cover: event.target.value }))
                  }
                />
              </label>
              {formData.cover ? (
                <div className="cover-preview-card">
                  {formData.cover.startsWith("linear-gradient") ? (
                    <div className="cover-preview-media" style={{ background: formData.cover }} />
                  ) : (
                    <img className="cover-preview-media" src={formData.cover} alt={formData.title || "cover preview"} />
                  )}
                </div>
              ) : null}
              <p className="admin-helper">{copy.postCoverCustomHint}</p>
              <label className="checkbox-row">
                <input
                  type="checkbox"
                  checked={formData.featured}
                  onChange={(event) =>
                    setFormData((current) => ({ ...current, featured: event.target.checked }))
                  }
                />
                <span>{copy.postFeatured}</span>
              </label>
              <p className="admin-helper">{copy.postTagsHint}</p>
              <button className="button primary" type="submit">
                {editingPostId ? copy.updatePost : copy.savePost}
              </button>
            </form>
          </section>
        </section>

        <section className="admin-side-column">
          <article className="panel sidebar-card admin-overview-card">
            <div className="subheading">
              <h3>{copy.statsTitle}</h3>
              <span>{copy.statsDescription}</span>
            </div>
            <div className="atelier-metrics-grid admin-overview-grid">
              <article>
                <strong>{stats?.postCount ?? 0}</strong>
                <span>{publicCopy.statsPosts}</span>
              </article>
              <article>
                <strong>{stats?.categoryCount ?? 0}</strong>
                <span>{publicCopy.statsCategories}</span>
              </article>
              <article>
                <strong>{stats?.tagCount ?? 0}</strong>
                <span>{publicCopy.statsTags}</span>
              </article>
              <article>
                <strong>{stats?.messageCount ?? 0}</strong>
                <span>{publicCopy.statsMessages}</span>
              </article>
              <article>
                <strong>{stats?.visitCount ?? settings?.visitCount ?? 0}</strong>
                <span>{publicCopy.statsVisits}</span>
              </article>
              <article>
                <strong>{posts.reduce((total, item) => total + (item.viewCount || 0), 0)}</strong>
                <span>{publicCopy.statsViews}</span>
              </article>
              <article>
                <strong>{posts.reduce((total, item) => total + (item.likeCount || 0), 0)}</strong>
                <span>{publicCopy.statsLikes}</span>
              </article>
              <article>
                <strong>{comments.length}</strong>
                <span>{publicCopy.statsComments}</span>
              </article>
            </div>
          </article>

          <article className="panel sidebar-card">
            <div className="subheading">
              <h3>{copy.postsTitle}</h3>
              <span>{posts.length}</span>
            </div>
            <p className="admin-helper">{copy.postsDescription}</p>
            <div className="admin-list">
              {posts.length ? (
                posts.map((post) => (
                  <article key={post.id} className="admin-list-card">
                    <div className="meta-row">
                      <span>{post.category}</span>
                      <span>{post.publishedAt}</span>
                      <span>{post.readingTime}</span>
                      <span>{post.status === "DRAFT" ? copy.postStatusDraft : copy.postStatusPublished}</span>
                    </div>
                    <h4>{post.title}</h4>
                    <p>{post.excerpt}</p>
                    <div className="post-signal-row compact">
                      <span>{post.viewCount} {publicCopy.statsViews}</span>
                      <span>{post.likeCount} {publicCopy.statsLikes}</span>
                      <span>{post.commentCount} {publicCopy.statsComments}</span>
                    </div>
                    <div className="chip-row">
                      {post.tags.map((tag) => (
                        <span key={`${post.id}-${tag}`} className="pill soft">
                          #{tag}
                        </span>
                      ))}
                    </div>
                    <div className="admin-actions">
                      <button className="button secondary" onClick={() => handleEditPost(post)} type="button">
                        {copy.edit}
                      </button>
                      <button className="button danger" onClick={() => handleDeletePost(post.id)} type="button">
                        {copy.deletePost}
                      </button>
                    </div>
                  </article>
                ))
              ) : (
                <div className="empty-card">{copy.emptyPosts}</div>
              )}
            </div>
          </article>

          <article className="panel sidebar-card">
            <div className="subheading">
              <h3>{copy.messagesTitle}</h3>
              <span>{messages.length}</span>
            </div>
            <p className="admin-helper">{copy.messagesDescription}</p>
            <div className="admin-list">
              {messages.length ? (
                messages.map((message) => (
                  <article key={message.id} className="admin-list-card">
                    <div className="meta-row">
                      <span>{message.name}</span>
                      <span>{message.email}</span>
                      <span>{message.createdAt}</span>
                    </div>
                    <p>{message.content}</p>
                    <div className="admin-actions">
                      <button
                        className="button danger"
                        onClick={() => handleDeleteMessage(message.id)}
                        type="button"
                      >
                        {copy.deleteMessage}
                      </button>
                    </div>
                  </article>
                ))
              ) : (
                <div className="empty-card">{copy.emptyMessages}</div>
              )}
            </div>
          </article>

          <article className="panel sidebar-card">
            <div className="subheading">
              <h3>{copy.commentsTitle}</h3>
              <span>{comments.length}</span>
            </div>
            <p className="admin-helper">{copy.commentsDescription}</p>
            <div className="admin-list">
              {comments.length ? (
                comments.map((comment) => (
                  <article key={comment.id} className="admin-list-card">
                    <div className="meta-row">
                      <span>{comment.postTitle}</span>
                      <span>{comment.name}</span>
                      <span>{comment.createdAt}</span>
                    </div>
                    <p>{comment.content}</p>
                    <div className="admin-actions">
                      <button
                        className="button danger"
                        onClick={() => handleDeleteComment(comment.id)}
                        type="button"
                      >
                        {copy.deleteComment}
                      </button>
                    </div>
                  </article>
                ))
              ) : (
                <div className="empty-card">{copy.emptyMessages}</div>
              )}
            </div>
          </article>
        </section>
      </main>
    </div>
  );
}
