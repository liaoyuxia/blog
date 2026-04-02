const API_BASE = import.meta.env.VITE_API_BASE_URL || "/api";

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    ...options,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || `Request failed: ${response.status}`);
  }

  return response.json();
}

export function fetchProfile() {
  return request("/profile");
}

export function fetchStats() {
  return request("/stats");
}

export function fetchCategories() {
  return request("/categories");
}

export function fetchTags() {
  return request("/tags");
}

export function fetchPosts(params = {}) {
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      searchParams.set(key, value);
    }
  });

  const suffix = searchParams.toString() ? `?${searchParams.toString()}` : "";
  return request(`/posts${suffix}`);
}

export function fetchPostDetail(slug) {
  return request(`/posts/${slug}`);
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
