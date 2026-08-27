import { useState, useEffect, useCallback, useRef } from "react";
import {
  Image as ImageIcon, Plus, Edit2, Trash2, ArrowUp, ArrowDown,
  Eye, EyeOff, MapPin, Heart, Upload, Search, X, Check,
} from "lucide-react";
import { api } from "../api";
import {
  Card, Btn, Spinner, Toast, Confirm, Modal,
  PageHeader, EmptyState, Input, Textarea, Select,
} from "../components/ui";

const CATEGORIES = [
  "Spiritual & Temples",
  "Heritage & History",
  "Nature & Hills",
  "Coastal & Beaches",
  "Culture & Festivals",
  "Cuisine & Trails",
];

const EMPTY = {
  title: "",
  category: "Spiritual & Temples",
  location: "",
  description: "",
  tag: "",
  image: { url: "" },
  packageSlug: "",
  districtSlug: "",
  isActive: true,
};

function GalleryForm({ initial = EMPTY, onSave, saving, error }) {
  const [f, setF] = useState({ ...EMPTY, ...initial, imageUrl: initial.image?.url || "" });
  const set = (k, v) => setF((p) => ({ ...p, [k]: v }));

  const submit = (e) => {
    e.preventDefault();
    onSave({
      title: f.title,
      category: f.category,
      location: f.location,
      description: f.description,
      tag: f.tag,
      image: { url: f.imageUrl },
      packageSlug: f.packageSlug,
      districtSlug: f.districtSlug,
      isActive: f.isActive,
    });
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      <Input
        label="Photo Title *"
        value={f.title}
        onChange={(e) => set("title", e.target.value)}
        placeholder="e.g. Brihadeeswara Temple at Twilight"
        required
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wide mb-1.5">
            Category *
          </label>
          <select
            value={f.category}
            onChange={(e) => set("category", e.target.value)}
            className="w-full px-3.5 py-2.5 bg-white border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-navy-500 font-medium"
            required
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        <Input
          label="Location / District *"
          value={f.location}
          onChange={(e) => set("location", e.target.value)}
          placeholder="e.g. Thanjavur, Madurai, Kanyakumari"
          required
        />
      </div>

      <Textarea
        label="Description / Caption"
        rows={2}
        value={f.description}
        onChange={(e) => set("description", e.target.value)}
        placeholder="Short description shown in the gallery lightbox"
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          label="Badge Tag (optional)"
          value={f.tag}
          onChange={(e) => set("tag", e.target.value)}
          placeholder="e.g. UNESCO World Heritage, Living Legend"
        />
        <Input
          label="Direct Image URL (or upload later)"
          value={f.imageUrl}
          onChange={(e) => set("imageUrl", e.target.value)}
          placeholder="https://images.unsplash.com/..."
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          label="Package Slug (optional)"
          value={f.packageSlug}
          onChange={(e) => set("packageSlug", e.target.value)}
          placeholder="e.g. arupadai-veedu-circuit"
        />
        <Input
          label="District Slug (optional)"
          value={f.districtSlug}
          onChange={(e) => set("districtSlug", e.target.value)}
          placeholder="e.g. thanjavur"
        />
      </div>

      <label className="flex items-center gap-2 cursor-pointer select-none w-fit">
        <input
          type="checkbox"
          checked={f.isActive}
          onChange={(e) => set("isActive", e.target.checked)}
          className="w-4 h-4 rounded border-gray-300 text-navy-800 focus:ring-navy-500"
        />
        <span className="text-sm text-gray-700 font-medium">Active (visible in public gallery)</span>
      </label>

      {error && <p className="text-red-600 text-sm bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>}

      <Btn type="submit" variant="gold" loading={saving} className="w-full">
        {initial._id ? "Save Changes" : "Create Photo Item"}
      </Btn>
      {!initial._id && !f.imageUrl && (
        <p className="text-xs text-gray-400 text-center">
          💡 You can upload a photo file from your computer immediately after creating this item.
        </p>
      )}
    </form>
  );
}

function ImageUploaderModal({ item, onClose, onUploaded }) {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(item?.image?.url || "");
  const [uploading, setUploading] = useState(false);
  const [err, setErr] = useState("");
  const inputRef = useRef(null);

  const handleFile = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    setPreview(URL.createObjectURL(f));
  };

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    setErr("");
    try {
      await api.uploadGalleryImage(item._id, file);
      onUploaded();
      onClose();
    } catch (e) {
      setErr(e.message || "Failed to upload image");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div
        onClick={() => inputRef.current?.click()}
        className="border-2 border-dashed border-gray-300 hover:border-gold-500 rounded-2xl p-6 text-center cursor-pointer transition bg-gray-50 hover:bg-gold-50/20"
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={handleFile}
          className="hidden"
        />
        {preview ? (
          <div className="space-y-3">
            <img
              src={preview}
              alt="Preview"
              className="max-h-56 mx-auto rounded-xl object-contain shadow-md"
            />
            <p className="text-xs text-gray-500 font-medium">Click to select another file</p>
          </div>
        ) : (
          <div className="py-6 space-y-2 text-gray-500">
            <Upload className="w-10 h-10 mx-auto text-gray-400" />
            <p className="text-sm font-semibold text-gray-700">Click to choose a photo file</p>
            <p className="text-xs text-gray-400">JPG, PNG, or WebP up to 10MB</p>
          </div>
        )}
      </div>

      {err && <p className="text-red-600 text-xs bg-red-50 p-2 rounded-lg">{err}</p>}

      <div className="flex gap-2">
        <Btn variant="outline" onClick={onClose} className="flex-1">Cancel</Btn>
        <Btn variant="gold" onClick={handleUpload} loading={uploading} disabled={!file} className="flex-1">
          Save Photo
        </Btn>
      </div>
    </div>
  );
}

export default function GalleryAdmin() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [catFilter, setCatFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [editModal, setEditModal] = useState(null);
  const [uploadModal, setUploadModal] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saveErr, setSaveErr] = useState("");
  const [delId, setDelId] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const r = await api.galleryItems();
      setItems((r.data || []).sort((a, b) => a.order - b.order));
    } catch (e) {
      showToast(e.message, "error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleSave = async (data) => {
    setSaving(true);
    setSaveErr("");
    try {
      if (editModal?._id) {
        await api.updateGalleryItem(editModal._id, data);
        showToast("Photo details updated");
        setEditModal(null);
        load();
      } else {
        const res = await api.createGalleryItem(data);
        showToast("Photo item created");
        setEditModal(null);
        if (res?.data?._id && !data.image?.url) {
          setUploadModal(res.data);
        }
        load();
      }
    } catch (e) {
      setSaveErr(e.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await api.deleteGalleryItem(delId);
      setDelId(null);
      showToast("Photo deleted from gallery");
      load();
    } catch (e) {
      showToast(e.message, "error");
    } finally {
      setDeleting(false);
    }
  };

  const move = async (item, dir) => {
    const idx = items.findIndex((s) => s._id === item._id);
    const swapWith = items[idx + dir];
    if (!swapWith) return;
    const order = [
      { id: item._id, order: swapWith.order },
      { id: swapWith._id, order: item.order },
    ];
    const next = [...items];
    [next[idx], next[idx + dir]] = [next[idx + dir], next[idx]];
    setItems(next);
    try {
      await api.reorderGallery(order);
    } catch (e) {
      showToast(e.message, "error");
      load();
    }
  };

  const toggleActive = async (item) => {
    try {
      await api.updateGalleryItem(item._id, { isActive: !item.isActive });
      load();
    } catch (e) {
      showToast(e.message, "error");
    }
  };

  const filtered = items.filter((item) => {
    const matchCat = catFilter === "All" || item.category === catFilter;
    const q = search.toLowerCase().trim();
    const matchSearch =
      !q ||
      item.title?.toLowerCase().includes(q) ||
      item.location?.toLowerCase().includes(q) ||
      item.tag?.toLowerCase().includes(q);
    return matchCat && matchSearch;
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Photo Gallery"
        description={`${items.length} photo${items.length !== 1 ? "s" : ""} in the showcase gallery`}
        action={
          <Btn variant="gold" onClick={() => { setEditModal("create"); setSaveErr(""); }}>
            <Plus className="w-4 h-4" /> Add Photo
          </Btn>
        }
      />

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-gray-200 shadow-sm">
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-hide w-full sm:w-auto pb-1 sm:pb-0">
          {["All", ...CATEGORIES].map((cat) => (
            <button
              key={cat}
              onClick={() => setCatFilter(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                catFilter === cat
                  ? "bg-navy-800 text-gold-300"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64 flex-shrink-0">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search photos..."
            className="w-full pl-9 pr-4 py-1.5 text-xs bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-navy-500"
          />
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Spinner size="lg" /></div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={ImageIcon}
          title="No gallery photos found"
          description="Add photos to showcase temples, heritage trails, coastlines, and cultural experiences."
          action={<Btn variant="gold" onClick={() => setEditModal("create")}><Plus className="w-4 h-4" /> Add Photo</Btn>}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((item, i) => (
            <Card key={item._id} className="overflow-hidden flex flex-col justify-between group border border-gray-200 hover:shadow-lg transition">
              <div>
                {/* Thumbnail */}
                <div className="relative aspect-[16/10] bg-gray-100 overflow-hidden">
                  {item.image?.url ? (
                    <img
                      src={item.image.url}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-gray-300 gap-1">
                      <ImageIcon className="w-8 h-8" />
                      <span className="text-xs text-gray-400">No Image Uploaded</span>
                    </div>
                  )}

                  {/* Badges */}
                  <span className="absolute top-2.5 left-2.5 bg-navy-900/85 backdrop-blur-sm text-gold-300 text-[10px] font-bold px-2 py-0.5 rounded-md border border-gold-400/30">
                    {item.category}
                  </span>

                  <span className="absolute top-2.5 right-2.5 bg-black/60 backdrop-blur-sm text-white text-[10px] font-medium px-2 py-0.5 rounded-md flex items-center gap-1">
                    <Heart className="w-3 h-3 text-rose-400 fill-rose-400" />
                    {item.likes || 0}
                  </span>

                  {/* Upload photo button overlay */}
                  <button
                    onClick={() => setUploadModal(item)}
                    title="Upload / Change Image"
                    className="absolute inset-0 bg-black/50 text-white opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-2 text-xs font-semibold cursor-pointer"
                  >
                    <Upload className="w-4 h-4 text-gold-400" /> Change Image
                  </button>
                </div>

                {/* Body */}
                <div className="p-4 space-y-1.5">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="font-bold text-navy-900 text-sm truncate">{item.title}</h3>
                    {!item.isActive && (
                      <span className="text-[10px] bg-red-50 text-red-600 px-1.5 py-0.5 rounded font-semibold flex-shrink-0">
                        Hidden
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-gold-600" /> {item.location}
                  </p>
                  {item.description && (
                    <p className="text-xs text-gray-600 line-clamp-2 mt-1">{item.description}</p>
                  )}
                </div>
              </div>

              {/* Actions Footer */}
              <div className="px-4 py-2.5 bg-gray-50/80 border-t border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => move(item, -1)}
                    disabled={i === 0}
                    title="Move earlier"
                    className="p-1 rounded text-gray-400 hover:text-navy-700 hover:bg-gray-200 transition disabled:opacity-30"
                  >
                    <ArrowUp className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => move(item, 1)}
                    disabled={i === filtered.length - 1}
                    title="Move later"
                    className="p-1 rounded text-gray-400 hover:text-navy-700 hover:bg-gray-200 transition disabled:opacity-30"
                  >
                    <ArrowDown className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => toggleActive(item)}
                    title={item.isActive ? "Hide photo" : "Show photo"}
                    className="p-1.5 rounded text-gray-500 hover:text-navy-700 hover:bg-gray-200 transition"
                  >
                    {item.isActive ? <Eye className="w-4 h-4 text-green-600" /> : <EyeOff className="w-4 h-4 text-gray-400" />}
                  </button>
                  <button
                    onClick={() => { setEditModal(item); setSaveErr(""); }}
                    title="Edit details"
                    className="p-1.5 rounded text-gray-500 hover:text-navy-700 hover:bg-gray-200 transition"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setDelId(item._id)}
                    title="Delete photo"
                    className="p-1.5 rounded text-gray-500 hover:text-red-600 hover:bg-red-50 transition"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Edit / Create Modal */}
      <Modal
        open={!!editModal}
        onClose={() => setEditModal(null)}
        title={editModal?._id ? "Edit Gallery Photo" : "Add Gallery Photo"}
        width="max-w-2xl"
      >
        <GalleryForm
          initial={editModal === "create" ? EMPTY : editModal}
          onSave={handleSave}
          saving={saving}
          error={saveErr}
        />
      </Modal>

      {/* Image Upload Modal */}
      <Modal
        open={!!uploadModal}
        onClose={() => setUploadModal(null)}
        title={`Upload Image: ${uploadModal?.title || ""}`}
        width="max-w-md"
      >
        {uploadModal && (
          <ImageUploaderModal
            item={uploadModal}
            onClose={() => setUploadModal(null)}
            onUploaded={() => { showToast("Image uploaded successfully"); load(); }}
          />
        )}
      </Modal>

      <Confirm
        open={!!delId}
        onClose={() => setDelId(null)}
        onConfirm={handleDelete}
        loading={deleting}
        title="Delete gallery photo?"
        message="This photo will be permanently removed from the website gallery."
      />

      {toast && <Toast {...toast} onClose={() => setToast(null)} />}
    </div>
  );
}
