import { useDeferredValue, useEffect, useState } from "react";
import PostModal from "./components/PostModal";
import SectionTitle from "./components/SectionTitle";
import {
  createMessage,
  fetchCategories,
  fetchMessages,
  fetchPostDetail,
  fetchPosts,
  fetchProfile,
  fetchStats,
  fetchTags,
} from "./api/blog";

const initialForm = {
  name: "",
  email: "",
  content: "",
};

export default function App() {
  const [profile, setProfile] = useState(null);
  const [stats, setStats] = useState(null);
  const [categories, setCategories] = useState([]);
  const [tags, setTags] = useState([]);
  const [featuredPosts, setFeaturedPosts] = useState([]);
  const [posts, setPosts] = useState([]);
  const [messages, setMessages] = useState([]);
  const [selectedPost, setSelectedPost] = useState(null);
  const [filters, setFilters] = useState({
    q: "",
    category: "",
    tag: "",
  });
  const [formData, setFormData] = useState(initialForm);
  const [formStatus, setFormStatus] = useState("");
  const [loading, setLoading] = useState(true);
  const [postsLoading, setPostsLoading] = useState(false);
  const [error, setError] = useState("");

  const deferredKeyword = useDeferredValue(filters.q);

  useEffect(() => {
    let mounted = true;

    async function bootstrap() {
      try {
        setLoading(true);
        const [
          profileData,
          statsData,
          categoryData,
          tagData,
          featuredData,
          messageData,
          postData,
        ] = await Promise.all([
          fetchProfile(),
          fetchStats(),
          fetchCategories(),
          fetchTags(),
          fetchPosts({ featured: true, limit: 2 }),
          fetchMessages(),
          fetchPosts(),
        ]);

        if (!mounted) {
          return;
        }

        setProfile(profileData);
        setStats(statsData);
        setCategories(categoryData);
        setTags(tagData);
        setFeaturedPosts(featuredData);
        setMessages(messageData);
        setPosts(postData);
        setError("");
      } catch (requestError) {
        if (mounted) {
          setError("初始化失败，请先启动 Spring Boot 后端和 MySQL。");
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    bootstrap();
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (loading) {
      return;
    }

    let mounted = true;

    async function loadFilteredPosts() {
      try {
        setPostsLoading(true);
        const data = await fetchPosts({
          q: deferredKeyword,
          category: filters.category,
          tag: filters.tag,
        });

        if (mounted) {
          setPosts(data);
        }
      } catch (requestError) {
        if (mounted) {
          setError("文章加载失败，请检查后端接口状态。");
        }
      } finally {
        if (mounted) {
          setPostsLoading(false);
        }
      }
    }

    loadFilteredPosts();
    return () => {
      mounted = false;
    };
  }, [deferredKeyword, filters.category, filters.tag, loading]);

  const activeChips = [];
  if (filters.q) {
    activeChips.push({ key: "q", label: `搜索：${filters.q}` });
  }
  if (filters.category) {
    activeChips.push({ key: "category", label: `分类：${filters.category}` });
  }
  if (filters.tag) {
    activeChips.push({ key: "tag", label: `标签：#${filters.tag}` });
  }

  async function openPost(slug) {
    try {
      const detail = await fetchPostDetail(slug);
      setSelectedPost(detail);
    } catch (requestError) {
      setError("文章详情加载失败。");
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setFormStatus("正在提交...");

    try {
      const created = await createMessage(formData);
      setMessages((current) => [created, ...current]);
      setStats((current) =>
        current
          ? {
              ...current,
              messageCount: current.messageCount + 1,
            }
          : current
      );
      setFormData(initialForm);
      setFormStatus("留言已发送，感谢你的反馈。");
    } catch (requestError) {
      setFormStatus("提交失败，请检查表单内容或后端服务。");
    }
  }

  if (loading) {
    return <div className="loading-screen">正在加载博客主页...</div>;
  }

  return (
    <div className="page-shell">
      <header className="topbar">
        <div className="brand">
          <div className="brand-mark">LS</div>
          <div>
            <span className="eyebrow">Personal Blog</span>
            <strong>Lin Studio</strong>
          </div>
        </div>
        <nav>
          <a href="#posts">文章</a>
          <a href="#about">关于</a>
          <a href="#contact">留言</a>
        </nav>
      </header>

      <main>
        <section className="hero">
          <div className="hero-copy panel">
            <p className="eyebrow">A formal version built with React + Spring Boot</p>
            <h1>{profile?.name}</h1>
            <p className="hero-role">{profile?.role}</p>
            <p className="hero-bio">{profile?.bio}</p>
            <div className="hero-actions">
              <a className="button primary" href="#posts">
                浏览文章
              </a>
              <a className="button secondary" href="#contact">
                留下反馈
              </a>
            </div>
            <div className="chip-row">
              {profile?.specialties?.map((item) => (
                <span key={item} className="pill">
                  {item}
                </span>
              ))}
            </div>
          </div>

          <aside className="hero-side">
            <div className="panel profile-card">
              <p className="eyebrow">Profile</p>
              <div className="stack">
                <div>
                  <span className="meta-label">所在地</span>
                  <strong>{profile?.location}</strong>
                </div>
                <div>
                  <span className="meta-label">邮箱</span>
                  <strong>{profile?.email}</strong>
                </div>
              </div>
            </div>

            <div className="stats-grid">
              <article className="metric-card">
                <strong>{stats?.postCount ?? 0}</strong>
                <span>文章</span>
              </article>
              <article className="metric-card">
                <strong>{stats?.categoryCount ?? 0}</strong>
                <span>分类</span>
              </article>
              <article className="metric-card">
                <strong>{stats?.tagCount ?? 0}</strong>
                <span>标签</span>
              </article>
              <article className="metric-card">
                <strong>{stats?.messageCount ?? 0}</strong>
                <span>留言</span>
              </article>
            </div>
          </aside>
        </section>

        <section className="content-section" id="posts">
          <SectionTitle
            eyebrow="Explore"
            title="精选文章与最新发布"
            description="支持搜索、分类、标签三种基础浏览方式，后续可以平滑扩展分页、归档和后台发布。"
          />

          <div className="panel toolbar">
            <label>
              <span>搜索</span>
              <input
                value={filters.q}
                onChange={(event) => setFilters((current) => ({ ...current, q: event.target.value }))}
                placeholder="搜索文章标题、摘要或标签"
              />
            </label>
            <label>
              <span>分类</span>
              <select
                value={filters.category}
                onChange={(event) =>
                  setFilters((current) => ({ ...current, category: event.target.value }))
                }
              >
                <option value="">全部分类</option>
                {categories.map((item) => (
                  <option key={item.name} value={item.name}>
                    {item.name} ({item.count})
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="chip-row active">
            {activeChips.map((chip) => (
              <button
                key={chip.key}
                className="pill active-pill"
                type="button"
                onClick={() => setFilters((current) => ({ ...current, [chip.key]: "" }))}
              >
                {chip.label}
              </button>
            ))}
          </div>

          <div className="featured-block">
            <div className="subheading">
              <h3>精选内容</h3>
              <span>Featured Posts</span>
            </div>
            <div className="featured-grid">
              {featuredPosts.map((post) => (
                <article key={post.slug} className="featured-card" style={{ background: post.cover }}>
                  <div className="featured-overlay" />
                  <div className="featured-body">
                    <div className="meta-row">
                      <span>{post.category}</span>
                      <span>{post.publishedAt}</span>
                    </div>
                    <button type="button" onClick={() => openPost(post.slug)}>
                      <h4>{post.title}</h4>
                    </button>
                    <p>{post.excerpt}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>

          <div className="content-grid">
            <div className="posts-column">
              <div className="subheading">
                <h3>最近发布</h3>
                <span>{posts.length} 篇文章</span>
              </div>

              {postsLoading ? <div className="empty-card">文章加载中...</div> : null}
              {!postsLoading && !posts.length ? (
                <div className="empty-card">当前筛选条件下还没有结果，试试换个关键词。</div>
              ) : null}

              <div className="posts-grid">
                {posts.map((post) => (
                  <article key={post.slug} className="panel post-card">
                    <div className="meta-row">
                      <span>{post.category}</span>
                      <span>{post.publishedAt}</span>
                      <span>{post.readingTime}</span>
                    </div>
                    <button type="button" onClick={() => openPost(post.slug)}>
                      <h4>{post.title}</h4>
                    </button>
                    <p>{post.excerpt}</p>
                    <div className="chip-row">
                      {post.tags.map((tag) => (
                        <button
                          key={tag}
                          type="button"
                          className={`pill tag-button ${filters.tag === tag ? "active-pill" : ""}`}
                          onClick={() =>
                            setFilters((current) => ({
                              ...current,
                              tag: current.tag === tag ? "" : tag,
                            }))
                          }
                        >
                          #{tag}
                        </button>
                      ))}
                    </div>
                  </article>
                ))}
              </div>
            </div>

            <aside className="sidebar-column">
              <div className="panel sidebar-card">
                <div className="subheading">
                  <h3>热门标签</h3>
                  <span>Topic Cloud</span>
                </div>
                <div className="chip-row">
                  {tags.map((tag) => (
                    <button
                      key={tag.name}
                      type="button"
                      className={`pill tag-button ${filters.tag === tag.name ? "active-pill" : ""}`}
                      onClick={() =>
                        setFilters((current) => ({
                          ...current,
                          tag: current.tag === tag.name ? "" : tag.name,
                        }))
                      }
                    >
                      #{tag.name} <span>{tag.count}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="panel sidebar-card">
                <div className="subheading">
                  <h3>博客系统基础能力</h3>
                  <span>What is ready</span>
                </div>
                <ul className="feature-list">
                  <li>Spring Boot + JPA + MySQL 的正式后端结构</li>
                  <li>React + Vite 的独立前端工程</li>
                  <li>文章、分类、标签、留言四类基础数据</li>
                  <li>搜索、分类筛选、标签筛选和文章详情弹层</li>
                </ul>
              </div>
            </aside>
          </div>
        </section>

        <section className="content-section" id="about">
          <SectionTitle
            eyebrow="About"
            title="这是一个可以继续演进的正式版骨架"
            description="结构上已经为后台管理、鉴权、分页、Markdown 编辑器和生产部署留好了位置。"
          />

          <div className="dual-grid">
            <article className="panel info-card">
              <h3>后端方向</h3>
              <ul className="feature-list">
                <li>继续增加后台管理接口与管理员登录</li>
                <li>支持文章分页、归档、置顶和草稿状态</li>
                <li>接入富文本或 Markdown 发布工作流</li>
                <li>增加统一异常处理与接口响应模型</li>
              </ul>
            </article>
            <article className="panel info-card accent">
              <h3>前端方向</h3>
              <ul className="feature-list">
                <li>增加独立文章页与 SEO 头信息</li>
                <li>增加归档页、关于页和项目展示页</li>
                <li>对接后台管理系统或内容平台</li>
                <li>补充深色模式、动画细节和响应式细修</li>
              </ul>
            </article>
          </div>
        </section>

        <section className="content-section" id="contact">
          <SectionTitle
            eyebrow="Connect"
            title="留言反馈"
            description="这里已经接上正式后端接口，后续可以升级为评论系统、合作咨询或订阅入口。"
          />

          <div className="dual-grid">
            <form className="panel form-card" onSubmit={handleSubmit}>
              <label>
                <span>昵称</span>
                <input
                  value={formData.name}
                  onChange={(event) =>
                    setFormData((current) => ({ ...current, name: event.target.value }))
                  }
                  placeholder="怎么称呼你"
                  required
                />
              </label>
              <label>
                <span>邮箱</span>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(event) =>
                    setFormData((current) => ({ ...current, email: event.target.value }))
                  }
                  placeholder="your@email.com"
                  required
                />
              </label>
              <label>
                <span>内容</span>
                <textarea
                  rows="6"
                  value={formData.content}
                  onChange={(event) =>
                    setFormData((current) => ({ ...current, content: event.target.value }))
                  }
                  placeholder="欢迎分享建议、感受或合作想法"
                  required
                />
              </label>
              <button className="button primary" type="submit">
                提交留言
              </button>
              <p className="form-status">{formStatus}</p>
            </form>

            <div className="panel message-card">
              <div className="subheading">
                <h3>最新留言</h3>
                <span>Reader Notes</span>
              </div>
              <div className="message-list">
                {messages.map((message) => (
                  <article key={message.id} className="message-item">
                    <strong>{message.name}</strong>
                    <p>{message.content}</p>
                    <span>{message.createdAt}</span>
                  </article>
                ))}
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="footer">
        <span>Lin Studio Blog</span>
        <span>React + Spring Boot + MySQL</span>
      </footer>

      {error ? <div className="toast">{error}</div> : null}
      <PostModal post={selectedPost} onClose={() => setSelectedPost(null)} />
    </div>
  );
}
