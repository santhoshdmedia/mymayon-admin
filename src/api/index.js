const BASE = import.meta.env.VITE_API_URL || "https://api.mymayon.com/api";
const getToken = () => localStorage.getItem("admin_token");

async function req(method, path, body) {
  const headers = { "Content-Type": "application/json" };
  const token = getToken();
  if (token) headers["Authorization"] = `Bearer ${token}`;
  const res = await fetch(`${BASE}${path}`, {
    method, headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || `${res.status}`);
  return json;
}

async function upload(path, formData) {
  const headers = {};
  const token = getToken();
  if (token) headers["Authorization"] = `Bearer ${token}`;
  const res = await fetch(`${BASE}${path}`, { method: "POST", headers, body: formData });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || `${res.status}`);
  return json;
}

export const api = {
  login: (b) => req("POST", "/auth/login", b),
  me: () => req("GET", "/auth/me"),
  changePassword: (b) => req("PUT", "/auth/password", b),
  stats: () => req("GET", "/enquiries/stats"),
  districts: (q = "") => req("GET", `/districts?${q}`),
  district: (slug) => req("GET", `/districts/${slug}`),
  createDistrict: (b) => req("POST", "/districts", b),
  updateDistrict: (id, b) => req("PUT", `/districts/${id}`, b),
  deleteDistrict: (id) => req("DELETE", `/districts/${id}`),
  packages: (q = "") => req("GET", `/packages?${q}`),
  package: (slug) => req("GET", `/packages/${slug}`),
  createPackage: (b) => req("POST", "/packages", b),
  updatePackage: (id, b) => req("PUT", `/packages/${id}`, b),
  deletePackage: (id) => req("DELETE", `/packages/${id}`),

  // Image management
  uploadPackageImages: (id, files) => {
    const fd = new FormData();
    files.forEach(f => fd.append("images", f));
    return upload(`/packages/${id}/images`, fd);
  },
  deletePackageImage: (id, imageId) => req("DELETE", `/packages/${id}/images/${imageId}`),
  updatePackageImage: (id, imageId, body) => req("PATCH", `/packages/${id}/images/${imageId}`, body),
  setHeroImage: (id, imageId) => req("PATCH", `/packages/${id}/images/${imageId}`, { setHero: true }),

  enquiries: (q = "") => req("GET", `/enquiries?${q}`),
  updateEnquiry: (id, b) => req("PUT", `/enquiries/${id}`, b),
  deleteEnquiry: (id) => req("DELETE", `/enquiries/${id}`),

  // Hero slider
  heroSlides: () => req("GET", "/hero-slides/all"),
  heroSlide: (id) => req("GET", `/hero-slides/${id}`),
  createHeroSlide: (b) => req("POST", "/hero-slides", b),
  updateHeroSlide: (id, b) => req("PUT", `/hero-slides/${id}`, b),
  deleteHeroSlide: (id) => req("DELETE", `/hero-slides/${id}`),
  reorderHeroSlides: (order) => req("PATCH", "/hero-slides/reorder", { order }),
  uploadHeroSlideImage: (id, file) => {
    const fd = new FormData();
    fd.append("image", file);
    return upload(`/hero-slides/${id}/image`, fd);
  },
  deleteHeroSlideImage: (id) => req("DELETE", `/hero-slides/${id}/image`),

  // Announcements (Secondary Navbar Ticker)
  announcements: () => req("GET", "/announcements/all"),
  createAnnouncement: (b) => req("POST", "/announcements", b),
  updateAnnouncement: (id, b) => req("PUT", `/announcements/${id}`, b),
  deleteAnnouncement: (id) => req("DELETE", `/announcements/${id}`),
  reorderAnnouncements: (order) => req("PATCH", "/announcements/reorder", { order }),

  // Gallery
  galleryItems: () => req("GET", "/gallery/all"),
  galleryItem: (id) => req("GET", `/gallery/${id}`),
  createGalleryItem: (b) => req("POST", "/gallery", b),
  updateGalleryItem: (id, b) => req("PUT", `/gallery/${id}`, b),
  deleteGalleryItem: (id) => req("DELETE", `/gallery/${id}`),
  reorderGallery: (order) => req("PATCH", "/gallery/reorder", { order }),
  uploadGalleryImage: (id, file) => {
    const fd = new FormData();
    fd.append("image", file);
    return upload(`/gallery/${id}/image`, fd);
  },
};
