import { useDeferredValue, useEffect, useRef, useState } from "react";
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
import ArticleBlocks from "./components/ArticleBlocks";
import { getAdminCopy, getPublicCopy } from "./i18n";
import { parseArticleContent } from "./utils/articleContent";

const TOKEN_STORAGE_KEY = "lin-blog-admin-token";

function createEmptyPostForm() {
  return {
    title: "",
    slug: "",
    excerpt: "",
    content: "",
    category: "",
    tagsText: "",
    publishedAt: new Date().toISOString().slice(0, 10),
    readingTime: "",
    recommendedForZh: "",
    recommendedForEn: "",
    cover: "",
    featured: false,
    starterRecommended: false,
    homepageSelected: false,
    status: "PUBLISHED",
  };
}

function normalizeReadingTimeValue(value) {
  return String(value || "").replace(/\D+/g, "");
}

function formatReadingTime(value, language) {
  const minutes = normalizeReadingTimeValue(value);
  if (!minutes) {
    return language === "en" ? "Reading time" : "阅读时长";
  }

  return language === "en" ? `${minutes} min read` : `${minutes} 分钟`;
}

function buildAdminPostFilters(filterKey) {
  switch (filterKey) {
    case "PUBLISHED":
      return { status: "PUBLISHED" };
    case "DRAFT":
      return { status: "DRAFT" };
    case "FEATURED":
      return { featured: true };
    case "STARTER":
      return { starterRecommended: true };
    default:
      return {};
  }
}

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
  heroEyebrowZh: "",
  heroEyebrowEn: "",
  heroTitleZh: "",
  heroTitleEn: "",
  heroDescriptionZh: "",
  heroDescriptionEn: "",
  onboardingTitleZh: "",
  onboardingTitleEn: "",
  onboardingDescriptionZh: "",
  onboardingDescriptionEn: "",
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
  subscribeTitleZh: "",
  subscribeTitleEn: "",
  subscribeDescriptionZh: "",
  subscribeDescriptionEn: "",
  subscribeLinkLabelZh: "",
  subscribeLinkLabelEn: "",
  subscribeLinkUrl: "",
  journalTitleZh: "",
  journalTitleEn: "",
  journalDescriptionZh: "",
  journalDescriptionEn: "",
  messageTitleZh: "",
  messageTitleEn: "",
  messageDescriptionZh: "",
  messageDescriptionEn: "",
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

function AdminNavIcon({ name }) {
  const icons = {
    posts: (
      <path
        d="M5 6.5h14M5 12h14M5 17.5h9"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    ),
    settings: (
      <>
        <circle cx="12" cy="12" r="3.1" fill="none" stroke="currentColor" strokeWidth="1.8" />
        <path
          d="M12 3.9v2.2m0 11.8v2.2m8.1-8.1h-2.2M6.1 12H3.9m13.83-5.83-1.55 1.55M7.82 16.18l-1.55 1.55m0-11.56 1.55 1.55m9.91 9.91 1.55 1.55"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
      </>
    ),
    messages: (
      <path
        d="M5.5 7.5a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v5.2a2 2 0 0 1-2 2h-4.6L8 18.5v-3.8H7.5a2 2 0 0 1-2-2z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
    ),
    comments: (
      <>
        <path
          d="M4.8 6.8a2 2 0 0 1 2-2h10.4a2 2 0 0 1 2 2v5.4a2 2 0 0 1-2 2H12l-4 3v-3H6.8a2 2 0 0 1-2-2z"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinejoin="round"
        />
        <path
          d="M8.4 8.9h7.2M8.4 11.8h4.8"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
      </>
    ),
    collapse: (
      <path
        d="M15.5 5.5 9 12l6.5 6.5M8 5.5H5.5v13H8"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    ),
    expand: (
      <path
        d="M8.5 5.5 15 12l-6.5 6.5M16 5.5h2.5v13H16"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    ),
  };

  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      {icons[name] || icons.posts}
    </svg>
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
    readingTime: normalizeReadingTimeValue(formData.readingTime),
    recommendedForZh: formData.recommendedForZh.trim(),
    recommendedForEn: formData.recommendedForEn.trim(),
    cover: formData.cover.trim(),
    featured: formData.featured,
    starterRecommended: formData.starterRecommended,
    homepageSelected: formData.homepageSelected,
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
    readingTime: normalizeReadingTimeValue(post.readingTime),
    recommendedForZh: post.recommendedForZh || "",
    recommendedForEn: post.recommendedForEn || "",
    cover: post.cover || "",
    featured: post.featured,
    starterRecommended: post.starterRecommended || false,
    homepageSelected: post.homepageSelected || false,
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
    heroEyebrowZh: settings.heroEyebrowZh || "",
    heroEyebrowEn: settings.heroEyebrowEn || "",
    heroTitleZh: settings.heroTitleZh || "",
    heroTitleEn: settings.heroTitleEn || "",
    heroDescriptionZh: settings.heroDescriptionZh || "",
    heroDescriptionEn: settings.heroDescriptionEn || "",
    onboardingTitleZh: settings.onboardingTitleZh || "",
    onboardingTitleEn: settings.onboardingTitleEn || "",
    onboardingDescriptionZh: settings.onboardingDescriptionZh || "",
    onboardingDescriptionEn: settings.onboardingDescriptionEn || "",
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
    subscribeTitleZh: settings.subscribeTitleZh || "",
    subscribeTitleEn: settings.subscribeTitleEn || "",
    subscribeDescriptionZh: settings.subscribeDescriptionZh || "",
    subscribeDescriptionEn: settings.subscribeDescriptionEn || "",
    subscribeLinkLabelZh: settings.subscribeLinkLabelZh || "",
    subscribeLinkLabelEn: settings.subscribeLinkLabelEn || "",
    subscribeLinkUrl: settings.subscribeLinkUrl || "",
    journalTitleZh: settings.journalTitleZh || "",
    journalTitleEn: settings.journalTitleEn || "",
    journalDescriptionZh: settings.journalDescriptionZh || "",
    journalDescriptionEn: settings.journalDescriptionEn || "",
    messageTitleZh: settings.messageTitleZh || "",
    messageTitleEn: settings.messageTitleEn || "",
    messageDescriptionZh: settings.messageDescriptionZh || "",
    messageDescriptionEn: settings.messageDescriptionEn || "",
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
    heroEyebrowZh: formData.heroEyebrowZh.trim(),
    heroEyebrowEn: formData.heroEyebrowEn.trim(),
    heroTitleZh: formData.heroTitleZh.trim(),
    heroTitleEn: formData.heroTitleEn.trim(),
    heroDescriptionZh: formData.heroDescriptionZh.trim(),
    heroDescriptionEn: formData.heroDescriptionEn.trim(),
    onboardingTitleZh: formData.onboardingTitleZh.trim(),
    onboardingTitleEn: formData.onboardingTitleEn.trim(),
    onboardingDescriptionZh: formData.onboardingDescriptionZh.trim(),
    onboardingDescriptionEn: formData.onboardingDescriptionEn.trim(),
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
    subscribeTitleZh: formData.subscribeTitleZh.trim(),
    subscribeTitleEn: formData.subscribeTitleEn.trim(),
    subscribeDescriptionZh: formData.subscribeDescriptionZh.trim(),
    subscribeDescriptionEn: formData.subscribeDescriptionEn.trim(),
    subscribeLinkLabelZh: formData.subscribeLinkLabelZh.trim(),
    subscribeLinkLabelEn: formData.subscribeLinkLabelEn.trim(),
    subscribeLinkUrl: formData.subscribeLinkUrl.trim(),
    journalTitleZh: formData.journalTitleZh.trim(),
    journalTitleEn: formData.journalTitleEn.trim(),
    journalDescriptionZh: formData.journalDescriptionZh.trim(),
    journalDescriptionEn: formData.journalDescriptionEn.trim(),
    messageTitleZh: formData.messageTitleZh.trim(),
    messageTitleEn: formData.messageTitleEn.trim(),
    messageDescriptionZh: formData.messageDescriptionZh.trim(),
    messageDescriptionEn: formData.messageDescriptionEn.trim(),
    footerProductZh: formData.footerProductZh.trim(),
    footerProductEn: formData.footerProductEn.trim(),
    footerStackZh: formData.footerStackZh.trim(),
    footerStackEn: formData.footerStackEn.trim(),
  };
}

export default function AdminApp({ language, onLanguageChange }) {
  const copy = getAdminCopy(language);
  const publicCopy = getPublicCopy(language);
  const contentTextareaRef = useRef(null);
  const [credentials, setCredentials] = useState({ username: "", password: "" });
  const [authToken, setAuthToken] = useState(() => window.sessionStorage.getItem(TOKEN_STORAGE_KEY) || "");
  const [session, setSession] = useState(null);
  const [posts, setPosts] = useState([]);
  const [messages, setMessages] = useState([]);
  const [comments, setComments] = useState([]);
  const [stats, setStats] = useState(null);
  const [settings, setSettings] = useState(null);
  const [activeSection, setActiveSection] = useState("posts");
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [postFilterKey, setPostFilterKey] = useState("ALL");
  const [postSearchQuery, setPostSearchQuery] = useState("");
  const [editingPostId, setEditingPostId] = useState(null);
  const [isPostEditorOpen, setIsPostEditorOpen] = useState(false);
  const [isPostPreviewOpen, setIsPostPreviewOpen] = useState(false);
  const [formData, setFormData] = useState(createEmptyPostForm);
  const [settingsForm, setSettingsForm] = useState(emptySettingsForm);
  const [statusMessage, setStatusMessage] = useState(copy.statusIdle);
  const [loading, setLoading] = useState(Boolean(authToken));
  const [uploadingInlineImage, setUploadingInlineImage] = useState(false);
  const [isContentEditing, setIsContentEditing] = useState(false);
  const [editingContentValue, setEditingContentValue] = useState("");
  const deferredPostSearchQuery = useDeferredValue(postSearchQuery.trim());

  async function loadAdminPosts(nextToken, filterKey = postFilterKey, keyword = deferredPostSearchQuery) {
    const filters = {
      ...buildAdminPostFilters(filterKey),
      q: keyword,
    };
    const postData = await fetchAdminPosts(filters, nextToken);
    setPosts(postData);
    return postData;
  }

  async function bootstrapAdmin(nextToken, errorMessage) {
    try {
      setLoading(true);
      const [sessionData, postData, messageData, commentData, statsData] = await Promise.all([
        fetchAdminSession(nextToken),
        fetchAdminPosts({
          ...buildAdminPostFilters(postFilterKey),
          q: deferredPostSearchQuery,
        }, nextToken),
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

  useEffect(() => {
    if (!authToken || loading) {
      return;
    }

    loadAdminPosts(authToken, postFilterKey, deferredPostSearchQuery).catch((requestError) => {
      setStatusMessage(requestError.message || copy.sessionError);
    });
  }, [authToken, copy.sessionError, deferredPostSearchQuery, loading, postFilterKey]);

  useEffect(() => {
    if (activeSection !== "posts" && isPostEditorOpen) {
      setIsPostEditorOpen(false);
      setIsPostPreviewOpen(false);
      setIsContentEditing(false);
      setEditingContentValue("");
    }
  }, [activeSection, isPostEditorOpen]);

  useEffect(() => {
    if (
      !statusMessage ||
      statusMessage === copy.statusIdle ||
      statusMessage === copy.loading
    ) {
      return undefined;
    }

    const timeoutId = window.setTimeout(() => {
      setStatusMessage(copy.statusIdle);
    }, 2600);

    return () => window.clearTimeout(timeoutId);
  }, [copy.loading, copy.statusIdle, statusMessage]);

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
    setActiveSection("posts");
    setPostFilterKey("ALL");
    setPostSearchQuery("");
    setEditingPostId(null);
    setIsPostEditorOpen(false);
    setIsPostPreviewOpen(false);
    setFormData(createEmptyPostForm());
    setIsContentEditing(false);
    setEditingContentValue("");
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

  async function persistPost(nextStatus = formData.status, options = {}) {
    const { closeAfterSave = nextStatus !== "DRAFT" } = options;
    const wasEditing = Boolean(editingPostId);

    try {
      const committedContent = getCommittedContentValue();
      const payload = {
        ...toPayload({ ...formData, content: committedContent }),
        status: nextStatus,
      };
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
      await loadAdminPosts(authToken, postFilterKey, postSearchQuery.trim());
      setEditingPostId(savedPost.id);
      setFormData(fromPost(savedPost));
      setIsContentEditing(false);
      setEditingContentValue("");
      setStatusMessage(
        nextStatus === "DRAFT"
          ? closeAfterSave
            ? copy.postDraftSavedBack
            : copy.postDraftSaved
          : wasEditing
            ? copy.postUpdated
            : copy.postSaved
      );

      if (closeAfterSave) {
        setActiveSection("posts");
        setEditingPostId(null);
        setIsPostEditorOpen(false);
        setIsPostPreviewOpen(false);
        setFormData(createEmptyPostForm());
        setIsContentEditing(false);
        setEditingContentValue("");
      }
    } catch (requestError) {
      setStatusMessage(requestError.message || copy.sessionError);
    }
  }

  async function handleSavePost(event) {
    event.preventDefault();
    flushActiveContentBlock();
    await persistPost(formData.status, {
      closeAfterSave: true,
    });
  }

  function insertContentAtCursor(insertedText) {
    const textarea = contentTextareaRef.current;

    if (!textarea) {
      setFormData((current) => ({ ...current, content: `${current.content}\n${insertedText}`.trim() }));
      return;
    }

    const sourceValue = isContentEditing ? editingContentValue : formData.content;
    const start = textarea.selectionStart ?? sourceValue.length;
    const end = textarea.selectionEnd ?? sourceValue.length;
    const before = sourceValue.slice(0, start);
    const after = sourceValue.slice(end);
    const needsLeadingBreak = before && !before.endsWith("\n") ? "\n" : "";
    const needsTrailingBreak = after && !after.startsWith("\n") ? "\n" : "";
    const nextValue = `${before}${needsLeadingBreak}${insertedText}${needsTrailingBreak}${after}`;

    if (isContentEditing) {
      setEditingContentValue(nextValue);
    } else {
      setFormData((current) => ({ ...current, content: nextValue }));
    }

    requestAnimationFrame(() => {
      textarea.focus();
      const caretPosition = (before + needsLeadingBreak + insertedText).length;
      textarea.setSelectionRange(caretPosition, caretPosition);
    });
  }

  async function uploadInlineImageFile(file) {
    if (!file) {
      return;
    }

    try {
      setUploadingInlineImage(true);
      const uploaded = await uploadAdminCover(file, authToken);
      insertContentAtCursor(`![${file.name.replace(/\.[^.]+$/, "")}](${uploaded.url})`);
      setStatusMessage(copy.postInlineImageUploaded);
    } catch (requestError) {
      setStatusMessage(requestError.message || copy.sessionError);
    } finally {
      setUploadingInlineImage(false);
    }
  }

  async function handleUploadInlineImage(event) {
    const [file] = event.target.files || [];
    event.target.value = "";

    await uploadInlineImageFile(file);
  }

  async function handlePasteInlineImage(event) {
    const items = Array.from(event.clipboardData?.items || []);
    const imageItem = items.find((item) => item.type.startsWith("image/"));
    const file = imageItem?.getAsFile();

    if (!file) {
      return;
    }

    event.preventDefault();
    await uploadInlineImageFile(file);
  }

  function handleEditPost(post) {
    setActiveSection("posts");
    setEditingPostId(post.id);
    setFormData(fromPost(post));
    setIsPostEditorOpen(true);
    setIsPostPreviewOpen(false);
    setIsContentEditing(false);
    setEditingContentValue("");
    setStatusMessage(copy.statusIdle);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function handleCancelEdit() {
    setEditingPostId(null);
    setIsPostEditorOpen(false);
    setIsPostPreviewOpen(false);
    setFormData(createEmptyPostForm());
    setIsContentEditing(false);
    setEditingContentValue("");
    setStatusMessage(copy.statusIdle);
  }

  function handleCreatePost() {
    setActiveSection("posts");
    setEditingPostId(null);
    setFormData(createEmptyPostForm());
    setIsPostEditorOpen(true);
    setIsPostPreviewOpen(false);
    setIsContentEditing(false);
    setEditingContentValue("");
    setStatusMessage(copy.statusIdle);
  }

  function jumpToPreviewSection(sectionId) {
    document.getElementById(sectionId)?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }

  async function handleDeletePost(id) {
    if (!window.confirm(copy.deletePostConfirm)) {
      return;
    }

    try {
      await deleteAdminPost(id, authToken);
      const latestStats = await fetchStats();
      await loadAdminPosts(authToken, postFilterKey, postSearchQuery.trim());
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

  async function handleToggleFeatured(post) {
    if (post.status === "DRAFT" && !post.featured) {
      setStatusMessage(copy.postDraftCannotPin);
      return;
    }

    try {
      const payload = {
        ...toPayload(fromPost(post)),
        featured: !post.featured,
      };
      const savedPost = await updateAdminPost(post.id, payload, authToken);
      const latestPosts = await loadAdminPosts(authToken, postFilterKey, postSearchQuery.trim());
      if (editingPostId) {
        const refreshedEditingPost = latestPosts.find((item) => item.id === editingPostId);
        if (refreshedEditingPost) {
          setFormData((current) => ({
            ...current,
            featured: refreshedEditingPost.featured,
            homepageSelected: refreshedEditingPost.homepageSelected,
          }));
        }
      }
      setStatusMessage(copy.postPinnedSaved);
    } catch (requestError) {
      setStatusMessage(requestError.message || copy.sessionError);
    }
  }

  async function handleToggleHomepageSelected(post) {
    if (!post.homepageSelected && posts.filter((item) => item.homepageSelected).length >= 2) {
      setStatusMessage(copy.postHomepageLimitReached);
      return;
    }

    try {
      const payload = {
        ...toPayload(fromPost(post)),
        homepageSelected: !post.homepageSelected,
      };
      const savedPost = await updateAdminPost(post.id, payload, authToken);
      const latestPosts = await loadAdminPosts(authToken, postFilterKey, postSearchQuery.trim());
      if (editingPostId) {
        const refreshedEditingPost = latestPosts.find((item) => item.id === editingPostId);
        if (refreshedEditingPost) {
          setFormData((current) => ({
            ...current,
            homepageSelected: refreshedEditingPost.homepageSelected,
          }));
        }
      }
      setStatusMessage(
        savedPost.homepageSelected ? copy.postHomepageSelectedSaved : copy.postHomepageRemovedSaved
      );
    } catch (requestError) {
      setStatusMessage(requestError.message || copy.sessionError);
    }
  }

  const previewTags = formData.tagsText
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
  const previewRecommendedFor = (
    language === "en" ? formData.recommendedForEn : formData.recommendedForZh
  ) || formData.recommendedForZh || formData.recommendedForEn;
  const previewPost = {
    title: formData.title.trim() || copy.postPreviewUntitled,
    slug: formData.slug.trim() || "preview",
    excerpt: formData.excerpt.trim(),
    content: formData.content.trim(),
    category: formData.category.trim() || copy.postPreviewCategory,
    tags: previewTags,
    publishedAt: formData.publishedAt.trim() || new Date().toISOString().slice(0, 10),
    readingTime: formatReadingTime(formData.readingTime, language),
    cover:
      formData.cover.trim() ||
      "linear-gradient(135deg, #183a5a 0%, #245c7a 50%, #9ed8db 100%)",
    recommendedFor: previewRecommendedFor.trim(),
    status: formData.status,
  };
  const previewArticle = parseArticleContent(previewPost.content || "", previewPost.slug);
  const editorArticle = parseArticleContent(formData.content || "", "editor");

  function flushActiveContentBlock() {
    if (!isContentEditing) {
      return;
    }

    saveContentEditor(editingContentValue);
  }

  function getCommittedContentValue(value = editingContentValue) {
    if (!isContentEditing) {
      return formData.content;
    }

    return value.trim();
  }

  function saveContentEditor(value) {
    setFormData((current) => ({
      ...current,
      content: getCommittedContentValue(value),
    }));
    setIsContentEditing(false);
    setEditingContentValue("");
  }

  function startEditingContent(initialValue = formData.content) {
    setIsContentEditing(true);
    setEditingContentValue(initialValue);
  }

  function startNewContentBlock(prefix = "") {
    const base = getCommittedContentValue();
    const spacer = base.trim() ? "\n\n" : "";
    startEditingContent(`${base}${spacer}${prefix}`);
  }
  const postFilterItems = [
    { key: "ALL", label: copy.adminPostFilterAll },
    { key: "PUBLISHED", label: copy.adminPostFilterPublished },
    { key: "DRAFT", label: copy.adminPostFilterDraft },
    { key: "FEATURED", label: copy.adminPostFilterFeatured },
    { key: "STARTER", label: copy.adminPostFilterStarter },
  ];
  const displayedPosts = [...posts].sort((left, right) => {
    const featuredDelta = Number(Boolean(right.featured)) - Number(Boolean(left.featured));
    if (featuredDelta !== 0) {
      return featuredDelta;
    }

    const homepageDelta = Number(Boolean(right.homepageSelected)) - Number(Boolean(left.homepageSelected));
    if (homepageDelta !== 0) {
      return homepageDelta;
    }

    return String(right.publishedAt || "").localeCompare(String(left.publishedAt || ""));
  });
  const isDraftStatus = formData.status === "DRAFT";
  const canSelectMoreHomepagePosts =
    formData.homepageSelected ||
    posts.filter((item) => item.homepageSelected && item.id !== editingPostId).length < 2;
  const navItems = [
    { key: "posts", label: copy.postsTitle, count: stats?.postCount ?? posts.length, icon: "posts" },
    { key: "settings", label: copy.settingsTitle, icon: "settings" },
    { key: "messages", label: copy.messagesTitle, count: messages.length, icon: "messages" },
    { key: "comments", label: copy.commentsTitle, count: comments.length, icon: "comments" },
  ];

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

      <main className={`admin-workspace ${isSidebarCollapsed ? "is-sidebar-collapsed" : ""}`}>
        <aside className={`panel admin-nav-shell ${isSidebarCollapsed ? "is-collapsed" : ""}`}>
          <button
            className="admin-nav-toggle"
            type="button"
            aria-label={isSidebarCollapsed ? copy.adminSidebarExpand : copy.adminSidebarCollapse}
            onClick={() => setIsSidebarCollapsed((current) => !current)}
          >
            <AdminNavIcon name={isSidebarCollapsed ? "expand" : "collapse"} />
          </button>
          <nav className="admin-nav-list" aria-label={copy.brandTitle}>
            {navItems.map((item) => (
              <button
                key={item.key}
                type="button"
                className={`admin-nav-item ${activeSection === item.key ? "is-active" : ""}`}
                onClick={() => setActiveSection(item.key)}
                title={item.label}
              >
                <span className="admin-nav-icon">
                  <AdminNavIcon name={item.icon} />
                </span>
                {!isSidebarCollapsed ? <span className="admin-nav-label">{item.label}</span> : null}
                {item.count !== undefined ? <strong>{item.count}</strong> : null}
              </button>
            ))}
          </nav>
        </aside>

        <section className="admin-main-stage">
          <article className="panel admin-status-strip">
            <div className="admin-status-metrics">
              <article>
                <strong>{stats?.postCount ?? 0}</strong>
                <span>{publicCopy.statsPosts}</span>
              </article>
              <article>
                <strong>{messages.length}</strong>
                <span>{publicCopy.statsMessages}</span>
              </article>
              <article>
                <strong>{comments.length}</strong>
                <span>{publicCopy.statsComments}</span>
              </article>
              <article>
                <strong>{stats?.visitCount ?? settings?.visitCount ?? 0}</strong>
                <span>{copy.adminStatusVisits}</span>
              </article>
            </div>
          </article>

          {activeSection === "settings" ? (
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
                  <span>{copy.heroEyebrowZh}</span>
                  <input
                    value={settingsForm.heroEyebrowZh}
                    onChange={(event) =>
                      setSettingsForm((current) => ({ ...current, heroEyebrowZh: event.target.value }))
                    }
                    required
                  />
                </label>
                <label>
                  <span>{copy.heroEyebrowEn}</span>
                  <input
                    value={settingsForm.heroEyebrowEn}
                    onChange={(event) =>
                      setSettingsForm((current) => ({ ...current, heroEyebrowEn: event.target.value }))
                    }
                    required
                  />
                </label>
              </div>

              <div className="admin-form-grid">
                <label>
                  <span>{copy.heroTitleZh}</span>
                  <input
                    value={settingsForm.heroTitleZh}
                    onChange={(event) =>
                      setSettingsForm((current) => ({ ...current, heroTitleZh: event.target.value }))
                    }
                    required
                  />
                </label>
                <label>
                  <span>{copy.heroTitleEn}</span>
                  <input
                    value={settingsForm.heroTitleEn}
                    onChange={(event) =>
                      setSettingsForm((current) => ({ ...current, heroTitleEn: event.target.value }))
                    }
                    required
                  />
                </label>
              </div>

              <div className="admin-form-grid">
                <label>
                  <span>{copy.heroDescriptionZh}</span>
                  <textarea
                    rows="4"
                    value={settingsForm.heroDescriptionZh}
                    onChange={(event) =>
                      setSettingsForm((current) => ({ ...current, heroDescriptionZh: event.target.value }))
                    }
                    required
                  />
                </label>
                <label>
                  <span>{copy.heroDescriptionEn}</span>
                  <textarea
                    rows="4"
                    value={settingsForm.heroDescriptionEn}
                    onChange={(event) =>
                      setSettingsForm((current) => ({ ...current, heroDescriptionEn: event.target.value }))
                    }
                    required
                  />
                </label>
              </div>

              <div className="admin-form-grid">
                <label>
                  <span>{copy.onboardingTitleZh}</span>
                  <input
                    value={settingsForm.onboardingTitleZh}
                    onChange={(event) =>
                      setSettingsForm((current) => ({ ...current, onboardingTitleZh: event.target.value }))
                    }
                    required
                  />
                </label>
                <label>
                  <span>{copy.onboardingTitleEn}</span>
                  <input
                    value={settingsForm.onboardingTitleEn}
                    onChange={(event) =>
                      setSettingsForm((current) => ({ ...current, onboardingTitleEn: event.target.value }))
                    }
                    required
                  />
                </label>
              </div>

              <div className="admin-form-grid">
                <label>
                  <span>{copy.onboardingDescriptionZh}</span>
                  <textarea
                    rows="4"
                    value={settingsForm.onboardingDescriptionZh}
                    onChange={(event) =>
                      setSettingsForm((current) => ({
                        ...current,
                        onboardingDescriptionZh: event.target.value,
                      }))
                    }
                    required
                  />
                </label>
                <label>
                  <span>{copy.onboardingDescriptionEn}</span>
                  <textarea
                    rows="4"
                    value={settingsForm.onboardingDescriptionEn}
                    onChange={(event) =>
                      setSettingsForm((current) => ({
                        ...current,
                        onboardingDescriptionEn: event.target.value,
                      }))
                    }
                    required
                  />
                </label>
              </div>

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

              <div className="admin-form-grid">
                <label>
                  <span>{copy.subscribeTitleZh}</span>
                  <input
                    value={settingsForm.subscribeTitleZh}
                    onChange={(event) =>
                      setSettingsForm((current) => ({ ...current, subscribeTitleZh: event.target.value }))
                    }
                    required
                  />
                </label>
                <label>
                  <span>{copy.subscribeTitleEn}</span>
                  <input
                    value={settingsForm.subscribeTitleEn}
                    onChange={(event) =>
                      setSettingsForm((current) => ({ ...current, subscribeTitleEn: event.target.value }))
                    }
                    required
                  />
                </label>
              </div>

              <div className="admin-form-grid">
                <label>
                  <span>{copy.subscribeDescriptionZh}</span>
                  <textarea
                    rows="4"
                    value={settingsForm.subscribeDescriptionZh}
                    onChange={(event) =>
                      setSettingsForm((current) => ({
                        ...current,
                        subscribeDescriptionZh: event.target.value,
                      }))
                    }
                    required
                  />
                </label>
                <label>
                  <span>{copy.subscribeDescriptionEn}</span>
                  <textarea
                    rows="4"
                    value={settingsForm.subscribeDescriptionEn}
                    onChange={(event) =>
                      setSettingsForm((current) => ({
                        ...current,
                        subscribeDescriptionEn: event.target.value,
                      }))
                    }
                    required
                  />
                </label>
              </div>

              <div className="admin-form-grid">
                <label>
                  <span>{copy.subscribeLinkLabelZh}</span>
                  <input
                    value={settingsForm.subscribeLinkLabelZh}
                    onChange={(event) =>
                      setSettingsForm((current) => ({
                        ...current,
                        subscribeLinkLabelZh: event.target.value,
                      }))
                    }
                    required
                  />
                </label>
                <label>
                  <span>{copy.subscribeLinkLabelEn}</span>
                  <input
                    value={settingsForm.subscribeLinkLabelEn}
                    onChange={(event) =>
                      setSettingsForm((current) => ({
                        ...current,
                        subscribeLinkLabelEn: event.target.value,
                      }))
                    }
                    required
                  />
                </label>
                <label>
                  <span>{copy.subscribeLinkUrl}</span>
                  <input
                    value={settingsForm.subscribeLinkUrl}
                    onChange={(event) =>
                      setSettingsForm((current) => ({
                        ...current,
                        subscribeLinkUrl: event.target.value,
                      }))
                    }
                    required
                  />
                </label>
              </div>

              <div className="admin-form-grid">
                <label>
                  <span>{copy.journalTitleZh}</span>
                  <input
                    value={settingsForm.journalTitleZh}
                    onChange={(event) =>
                      setSettingsForm((current) => ({ ...current, journalTitleZh: event.target.value }))
                    }
                    required
                  />
                </label>
                <label>
                  <span>{copy.journalTitleEn}</span>
                  <input
                    value={settingsForm.journalTitleEn}
                    onChange={(event) =>
                      setSettingsForm((current) => ({ ...current, journalTitleEn: event.target.value }))
                    }
                    required
                  />
                </label>
              </div>

              <div className="admin-form-grid">
                <label>
                  <span>{copy.journalDescriptionZh}</span>
                  <textarea
                    rows="4"
                    value={settingsForm.journalDescriptionZh}
                    onChange={(event) =>
                      setSettingsForm((current) => ({
                        ...current,
                        journalDescriptionZh: event.target.value,
                      }))
                    }
                    required
                  />
                </label>
                <label>
                  <span>{copy.journalDescriptionEn}</span>
                  <textarea
                    rows="4"
                    value={settingsForm.journalDescriptionEn}
                    onChange={(event) =>
                      setSettingsForm((current) => ({
                        ...current,
                        journalDescriptionEn: event.target.value,
                      }))
                    }
                    required
                  />
                </label>
              </div>

              <div className="admin-form-grid">
                <label>
                  <span>{copy.messageTitleZh}</span>
                  <input
                    value={settingsForm.messageTitleZh}
                    onChange={(event) =>
                      setSettingsForm((current) => ({ ...current, messageTitleZh: event.target.value }))
                    }
                    required
                  />
                </label>
                <label>
                  <span>{copy.messageTitleEn}</span>
                  <input
                    value={settingsForm.messageTitleEn}
                    onChange={(event) =>
                      setSettingsForm((current) => ({ ...current, messageTitleEn: event.target.value }))
                    }
                    required
                  />
                </label>
              </div>

              <div className="admin-form-grid">
                <label>
                  <span>{copy.messageDescriptionZh}</span>
                  <textarea
                    rows="4"
                    value={settingsForm.messageDescriptionZh}
                    onChange={(event) =>
                      setSettingsForm((current) => ({
                        ...current,
                        messageDescriptionZh: event.target.value,
                      }))
                    }
                    required
                  />
                </label>
                <label>
                  <span>{copy.messageDescriptionEn}</span>
                  <textarea
                    rows="4"
                    value={settingsForm.messageDescriptionEn}
                    onChange={(event) =>
                      setSettingsForm((current) => ({
                        ...current,
                        messageDescriptionEn: event.target.value,
                      }))
                    }
                    required
                  />
                </label>
              </div>

              <button className="button primary" type="submit">
                {copy.saveSettings}
              </button>
            </form>
            </article>
          ) : null}

          {activeSection === "posts" ? (
            <section className="admin-posts-workspace">
              <article className="panel sidebar-card admin-posts-panel">
                <div className="subheading">
                  <h3>{copy.postsTitle}</h3>
                  <div className="admin-actions">
                    <button className="button primary" onClick={handleCreatePost} type="button">
                      {copy.newPost}
                    </button>
                  </div>
                </div>
                <div className="admin-list-toolbar">
                  <label className="admin-search-field">
                    <span className="sr-only">{copy.adminPostSearchPlaceholder}</span>
                    <input
                      value={postSearchQuery}
                      onChange={(event) => setPostSearchQuery(event.target.value)}
                      placeholder={copy.adminPostSearchPlaceholder}
                    />
                  </label>
                </div>
                <div className="admin-filter-row">
                  {postFilterItems.map((item) => (
                    <button
                      key={item.key}
                      type="button"
                      className={`pill admin-filter-pill ${postFilterKey === item.key ? "active-pill" : ""}`}
                      onClick={() => setPostFilterKey(item.key)}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
                <div className="admin-list">
                  {displayedPosts.length ? (
                    displayedPosts.map((post) => (
                      <article key={post.id} className="admin-list-card admin-post-item">
                        <div className="admin-post-item-header">
                          <div className="admin-post-identity">
                            <h4>{post.title}</h4>
                            <p>{post.slug}</p>
                          </div>
                          <div className="admin-actions">
                            <button
                              className={`button secondary admin-flag-button admin-flag-button-featured ${post.featured ? "is-active" : ""}`}
                              onClick={() => handleToggleFeatured(post)}
                              type="button"
                              disabled={post.status === "DRAFT" && !post.featured}
                            >
                              {post.status === "DRAFT" && !post.featured
                                ? copy.postDraftCannotPinAction
                                : post.featured
                                  ? copy.unpinPost
                                  : copy.pinPost}
                            </button>
                            <button
                              className={`button secondary admin-flag-button admin-flag-button-homepage ${post.homepageSelected ? "is-active" : ""}`}
                              onClick={() => handleToggleHomepageSelected(post)}
                              type="button"
                              disabled={
                                post.featured ||
                                (!post.homepageSelected &&
                                  posts.filter((item) => item.homepageSelected).length >= 2)
                              }
                            >
                              {post.homepageSelected ? copy.removeHomepagePost : copy.addHomepagePost}
                            </button>
                            <button className="button secondary" onClick={() => handleEditPost(post)} type="button">
                              {copy.edit}
                            </button>
                            <button className="button danger" onClick={() => handleDeletePost(post.id)} type="button">
                              {copy.deletePost}
                            </button>
                          </div>
                        </div>
                        <div className="meta-row admin-post-meta">
                          <span>{post.category}</span>
                          <span>{post.publishedAt}</span>
                          <span className={`admin-status-badge is-${String(post.status || "").toLowerCase()}`}>
                            {post.status === "DRAFT" ? copy.postStatusDraft : copy.postStatusPublished}
                          </span>
                          {post.featured ? <span className="admin-pin-badge">{copy.postPinned}</span> : null}
                          {post.homepageSelected ? <span className="admin-pin-badge is-secondary">{copy.postHomepageSelected}</span> : null}
                          {post.starterRecommended ? <span>{copy.postStarterRecommended}</span> : null}
                        </div>
                        <div className="admin-post-tags">
                          {post.tags.slice(0, 3).map((tag) => (
                            <span key={`${post.id}-${tag}`} className="pill soft">
                              #{tag}
                            </span>
                          ))}
                          {post.tags.length > 3 ? <span className="pill soft">+{post.tags.length - 3}</span> : null}
                        </div>
                        <div className="admin-post-quick-meta">
                          <span>{formatReadingTime(post.readingTime, language)}</span>
                          <span>{post.commentCount} {publicCopy.statsComments}</span>
                        </div>
                      </article>
                    ))
                  ) : (
                    <div className="empty-card">{copy.emptyPosts}</div>
                  )}
                </div>
              </article>

            </section>
          ) : null}

          {activeSection === "messages" ? (
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
          ) : null}

          {activeSection === "comments" ? (
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
          ) : null}
        </section>
      </main>

      {activeSection === "posts" && isPostEditorOpen ? (
        <div className="modal-backdrop admin-editor-overlay">
          <section
            className="modal-card admin-editor-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="admin-post-editor-title"
            onClick={(event) => event.stopPropagation()}
          >
            <section className="admin-editor-workbench">
              <div className="panel admin-editor-workbench-bar">
                <div>
                  <span className="eyebrow">{editingPostId ? copy.editPost : copy.newPost}</span>
                  <h3 id="admin-post-editor-title">
                    {formData.title.trim() || (editingPostId ? copy.editPost : copy.newPost)}
                  </h3>
                </div>
                <div className="admin-actions">
                  <button
                    className="button secondary"
                    type="button"
                    onClick={() => {
                      flushActiveContentBlock();
                      setIsPostPreviewOpen((current) => !current);
                    }}
                  >
                    {isPostPreviewOpen ? copy.returnToEditor : copy.previewPost}
                  </button>
                  <button className="button secondary" onClick={handleCancelEdit} type="button">
                    {copy.cancelEdit}
                  </button>
                </div>
              </div>

              <div
                className={`admin-editor-workbench-grid ${isPostPreviewOpen ? "is-preview-mode" : "is-edit-mode"}`}
              >
                {!isPostPreviewOpen ? (
                <form className="panel admin-editor-panel admin-form" onSubmit={handleSavePost}>
                  <div className="admin-editor-panel-section">
                    <div className="admin-editor-section-head">
                      <h4>{language === "en" ? "Basic information" : "基础信息"}</h4>
                    </div>
                    <div className="admin-form-grid admin-editor-info-grid">
                    <label className="admin-field-span-full admin-editor-primary-input">
                      <span>{copy.postTitle}</span>
                      <input
                        aria-label={copy.postTitle}
                        placeholder={copy.postTitle}
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
                    <label className="admin-field-span-full">
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
                    </div>
                  </div>

                  <div className="admin-editor-panel-section admin-editor-panel-section-featured">
                    <div className="admin-editor-section-head">
                      <h4>{language === "en" ? "Content" : "正文"}</h4>
                    </div>
                    <label className="admin-editor-content-field">
                      <div className="admin-editor-content-tools">
                        <button
                          className="button secondary"
                          type="button"
                          onClick={() => startNewContentBlock("")}
                        >
                          {language === "en" ? "Add paragraph" : "新增段落"}
                        </button>
                        <button
                          className="button secondary"
                          type="button"
                          onClick={() => startNewContentBlock("## ")}
                        >
                          {language === "en" ? "Add heading" : "新增标题"}
                        </button>
                        <button
                          className="button secondary"
                          type="button"
                          onClick={() => startNewContentBlock("- ")}
                        >
                          {language === "en" ? "Add list" : "新增列表"}
                        </button>
                        <label className="button secondary admin-inline-upload-button">
                          <input
                            type="file"
                            accept="image/png,image/jpeg,image/webp,image/gif,image/avif"
                            onChange={handleUploadInlineImage}
                            disabled={uploadingInlineImage}
                          />
                          {uploadingInlineImage ? publicCopy.submitting : copy.postInlineImageUpload}
                        </label>
                        <span className="admin-editor-content-hint">
                          {copy.postInlineImageHint}
                        </span>
                      </div>
                      <div className="admin-editor-content-canvas" onPaste={handlePasteInlineImage}>
                        {isContentEditing ? (
                          <div className="admin-editor-render-block is-editing">
                            <textarea
                              ref={contentTextareaRef}
                              rows={Math.max(12, editingContentValue.split("\n").length + 2)}
                              className="admin-editor-content"
                              aria-label={copy.postContent}
                              value={editingContentValue}
                              onChange={(event) => setEditingContentValue(event.target.value)}
                              onBlur={() => saveContentEditor(editingContentValue)}
                              autoFocus
                            />
                          </div>
                        ) : editorArticle.blocks.length ? (
                          <button
                            type="button"
                            className="admin-editor-document"
                            onClick={() => startEditingContent(formData.content)}
                          >
                            <span className="admin-editor-document-label">
                              {language === "en" ? "Document" : "正文文档"}
                            </span>
                            <ArticleBlocks
                              blocks={editorArticle.blocks}
                              outline={[]}
                              showOutline={false}
                              emptyText={copy.postPreviewEmpty}
                            />
                          </button>
                        ) : (
                          <button
                            type="button"
                            className="admin-editor-empty"
                            onClick={() => startEditingContent("")}
                          >
                            {language === "en"
                              ? "Start writing here. The article renders in place like a reading page."
                              : "从这里开始写正文。失焦后会直接按文章阅读页样式渲染。"}
                          </button>
                        )}
                      </div>
                    </label>
                  </div>

                  <div className="admin-editor-panel-section">
                    <div className="admin-editor-section-head">
                      <h4>{language === "en" ? "Publishing" : "发布设置"}</h4>
                    </div>
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
                          placeholder={copy.postTagsHint}
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
                          type="number"
                          min="1"
                          step="1"
                          inputMode="numeric"
                          placeholder={language === "en" ? "Only enter minutes" : "只输入数字"}
                          value={formData.readingTime}
                          onChange={(event) =>
                            setFormData((current) => ({
                              ...current,
                              readingTime: normalizeReadingTimeValue(event.target.value),
                            }))
                          }
                          required
                        />
                      </label>
                      <label>
                        <span>{copy.postRecommendedForZh}</span>
                        <input
                          value={formData.recommendedForZh}
                          onChange={(event) =>
                            setFormData((current) => ({ ...current, recommendedForZh: event.target.value }))
                          }
                        />
                      </label>
                      <label>
                        <span>{copy.postRecommendedForEn}</span>
                        <input
                          value={formData.recommendedForEn}
                          onChange={(event) =>
                            setFormData((current) => ({ ...current, recommendedForEn: event.target.value }))
                          }
                        />
                      </label>
                      <label className="admin-editor-status-field">
                        <span>{copy.postStatus}</span>
                        <select
                          aria-label={copy.postStatus}
                          value={formData.status}
                          onChange={(event) =>
                            setFormData((current) => ({
                              ...current,
                              status: event.target.value,
                              featured: event.target.value === "DRAFT" ? false : current.featured,
                            }))
                          }
                        >
                          <option value="PUBLISHED">{copy.postStatusPublished}</option>
                          <option value="DRAFT">{copy.postStatusDraft}</option>
                        </select>
                      </label>
                    </div>

                    <div className="admin-checkbox-row">
                      <label className="checkbox-row">
                        <input
                          type="checkbox"
                          checked={formData.featured}
                          onChange={(event) =>
                            setFormData((current) => ({
                              ...current,
                              featured: event.target.checked,
                              homepageSelected: event.target.checked ? false : current.homepageSelected,
                            }))
                          }
                          disabled={isDraftStatus && !formData.featured}
                        />
                        <span>{copy.postFeatured}</span>
                      </label>
                      <label className="checkbox-row">
                        <input
                          type="checkbox"
                          checked={formData.homepageSelected}
                          onChange={(event) =>
                            setFormData((current) => {
                              if (event.target.checked && !canSelectMoreHomepagePosts) {
                                setStatusMessage(copy.postHomepageLimitReached);
                                return current;
                              }

                              return { ...current, homepageSelected: event.target.checked };
                            })
                          }
                          disabled={formData.featured || !canSelectMoreHomepagePosts}
                        />
                        <span>{copy.postHomepageSelected}</span>
                      </label>
                      <label className="checkbox-row">
                        <input
                          type="checkbox"
                          checked={formData.starterRecommended}
                          onChange={(event) =>
                            setFormData((current) => ({
                              ...current,
                              starterRecommended: event.target.checked,
                            }))
                          }
                        />
                        <span>{copy.postStarterRecommended}</span>
                      </label>
                    </div>
                    <p className="admin-helper admin-editor-helper-note">{copy.postTagsRule}</p>
                    <p className="admin-helper admin-editor-helper-note">{copy.postHomepageControlHint}</p>
                  </div>

                  <div className="admin-actions admin-editor-footer">
                    <button
                      className="button secondary"
                      type="button"
                      onClick={() => {
                        flushActiveContentBlock();
                        persistPost("DRAFT", { closeAfterSave: false });
                      }}
                    >
                      {copy.saveDraft}
                    </button>
                    <button className="button primary" type="submit">
                      {editingPostId ? copy.updatePost : copy.savePost}
                    </button>
                  </div>
                </form>
                ) : null}

                {isPostPreviewOpen ? (
                  <article className="panel admin-preview-panel">
                    <div className="admin-preview-panel-header">
                      <div>
                        <span className="eyebrow">{copy.previewPost}</span>
                        <h4>{previewPost.title}</h4>
                      </div>
                      <span>{copy.postPreviewDescription}</span>
                    </div>

                    <div className="admin-preview-shell">
                      <div className="modal-cover" style={{ background: previewPost.cover }} />
                      <div className="modal-content admin-preview-content">
                        <div className="meta-row">
                          <span>{previewPost.category}</span>
                          <span>{previewPost.publishedAt}</span>
                          <span>{previewPost.readingTime}</span>
                          <span>
                            {previewPost.status === "DRAFT"
                              ? copy.postStatusDraft
                              : copy.postStatusPublished}
                          </span>
                        </div>
                        <h3>{previewPost.title}</h3>
                        {previewPost.tags.length ? (
                          <div className="tag-row">
                            {previewPost.tags.map((tag) => (
                              <span key={tag} className="pill soft">
                                #{tag}
                              </span>
                            ))}
                          </div>
                        ) : null}
                        {previewPost.recommendedFor ? (
                          <p className="post-recommend-reason">
                            <strong>{copy.postPreviewRecommendation}</strong> {previewPost.recommendedFor}
                          </p>
                        ) : null}

                        <ArticleBlocks
                          blocks={previewArticle.blocks}
                          outline={previewArticle.outline}
                          outlineEyebrow={copy.postPreviewOutlineEyebrow}
                          outlineTitle={copy.postPreviewOutlineTitle}
                          outlineDescription={copy.postPreviewOutlineDescription}
                          onJumpToSection={jumpToPreviewSection}
                          emptyText={copy.postPreviewEmpty}
                        />
                      </div>
                    </div>
                  </article>
                ) : null}
              </div>
            </section>
          </section>
        </div>
      ) : null}

      {authToken && statusMessage !== copy.statusIdle ? (
        <div className="toast" aria-live="polite">
          {statusMessage}
        </div>
      ) : null}
    </div>
  );
}
