const API_BASE = import.meta.env.VITE_API_BASE_URL || "/api";
const REQUEST_TIMEOUT = 10000;

async function request(path, options = {}) {
  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => controller.abort(), REQUEST_TIMEOUT);
  const isFormData = options.body instanceof FormData;

  let response;
  try {
    response = await fetch(`${API_BASE}${path}`, {
      ...options,
      headers: {
        ...(isFormData ? {} : { "Content-Type": "application/json" }),
        ...(options.headers || {}),
      },
      signal: controller.signal,
    });
  } catch (error) {
    if (error.name === "AbortError") {
      throw new Error("Request timeout");
    }
    throw error;
  } finally {
    window.clearTimeout(timeoutId);
  }

  if (!response.ok) {
    const contentType = response.headers.get("content-type") || "";
    if (contentType.includes("application/json")) {
      const payload = await response.json();
      throw new Error(payload.message || `Request failed: ${response.status}`);
    }

    const errorText = await response.text();
    throw new Error(errorText || `Request failed: ${response.status}`);
  }

  if (response.status === 204) {
    return null;
  }

  const contentType = response.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    return response.json();
  }

  return response.text();
}

function buildQuery(params = {}) {
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      searchParams.set(key, value);
    }
  });
  return searchParams.toString() ? `?${searchParams.toString()}` : "";
}

function withAuth(options = {}, authToken) {
  return {
    ...options,
    headers: {
      ...(options.headers || {}),
      ...(authToken ? { Authorization: `Basic ${authToken}` } : {}),
    },
  };
}

export function createBasicAuthToken(username, password) {
  return window.btoa(`${username}:${password}`);
}

export function fetchProfile() {
  return request("/profile");
}

export function fetchStats() {
  return request("/stats");
}

export function recordVisit() {
  return request("/visits", {
    method: "POST",
  });
}

export function fetchCategories() {
  return request("/categories");
}

export function fetchTags() {
  return request("/tags");
}

export function fetchPosts(params = {}) {
  return request(`/posts${buildQuery(params)}`);
}

export function fetchPostPage(params = {}) {
  return request(`/posts/page${buildQuery(params)}`);
}

export function fetchPostDetail(slug) {
  return request(`/posts/${slug}`);
}

export function recordPostView(slug) {
  return request(`/posts/${slug}/views`, {
    method: "POST",
  });
}

export function likePost(slug) {
  return request(`/posts/${slug}/likes`, {
    method: "POST",
  });
}

export function unlikePost(slug) {
  return request(`/posts/${slug}/likes`, {
    method: "DELETE",
  });
}

export function fetchPostComments(slug) {
  return request(`/posts/${slug}/comments`);
}

export function createPostComment(slug, payload) {
  return request(`/posts/${slug}/comments`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function fetchMessages() {
  return request("/messages");
}

export function createMessage(payload) {
  return request("/messages", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function fetchAdminSession(authToken) {
  return request("/admin/session", withAuth({}, authToken));
}

export function fetchAdminPosts(authToken) {
  return request("/admin/posts", withAuth({}, authToken));
}

export function fetchAdminSettings(authToken) {
  return request("/admin/settings", withAuth({}, authToken));
}

export function updateAdminSettings(payload, authToken) {
  return request("/admin/settings", withAuth({
    method: "PUT",
    body: JSON.stringify(payload),
  }, authToken));
}

export function createAdminPost(payload, authToken) {
  return request("/admin/posts", withAuth({
    method: "POST",
    body: JSON.stringify(payload),
  }, authToken));
}

export function updateAdminPost(id, payload, authToken) {
  return request(`/admin/posts/${id}`, withAuth({
    method: "PUT",
    body: JSON.stringify(payload),
  }, authToken));
}

export function deleteAdminPost(id, authToken) {
  return request(`/admin/posts/${id}`, withAuth({
    method: "DELETE",
  }, authToken));
}

export function fetchAdminMessages(authToken) {
  return request("/admin/messages", withAuth({}, authToken));
}

export function fetchAdminComments(authToken) {
  return request("/admin/comments", withAuth({}, authToken));
}

export function deleteAdminMessage(id, authToken) {
  return request(`/admin/messages/${id}`, withAuth({
    method: "DELETE",
  }, authToken));
}

export function deleteAdminComment(id, authToken) {
  return request(`/admin/comments/${id}`, withAuth({
    method: "DELETE",
  }, authToken));
}

export function uploadAdminCover(file, authToken) {
  const formData = new FormData();
  formData.append("file", file);
  return request("/admin/uploads/cover", withAuth({
    method: "POST",
    body: formData,
  }, authToken));
}
