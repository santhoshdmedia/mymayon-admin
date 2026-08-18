import { useState, useEffect, useCallback } from "react";
import { Package, Plus, Search, Edit2, Trash2, Star, MapPin, Clock, Images } from "lucide-react";
import { api } from "../api";
import {
  Card, Btn, Badge, Spinner, Toast, Confirm, Modal,
  PageHeader, EmptyState, Pagination, Input, Select, Textarea,
} from "../components/ui";
import PackageImageManager from "../components/ui/PackageImageManager";

const CATEGORIES = [
  "Spiritual","Heritage","Nature","Adventure","Honeymoon",
  "Family","Food & Culture","Wellness","Luxury","International",
];

const EMPTY_PKG = {
  title:"", slug:"", category:"Spiritual", locationLabel:"",
  durationDays:1, priceFrom:0, rating:4.8, tagline:"", description:"",
  inclusions:[], exclusions:[], highlights:[],
  featured:false, isPublished:true,
};

function toSlug(s) {
  return s.toLowerCase().trim().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
}

function PackageForm({ initial = EMPTY_PKG, onSave, saving, error }) {
  const [f, setF] = useState({ ...EMPTY_PKG, ...initial });
  const set = (k, v) => setF(p => ({ ...p, [k]: v }));

  const arrField = (key) => ({
    value: Array.isArray(f[key]) ? f[key].join("\n") : (f[key] || ""),
    onChange: e => set(key, e.target.value.split("\n").map(s => s.trim()).filter(Boolean)),
  });

  return (
    <form onSubmit={e => { e.preventDefault(); onSave(f); }} className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="sm:col-span-2">
          <Input label="Title *" value={f.title}
            onChange={e => { set("title", e.target.value); if (!initial._id) set("slug", toSlug(e.target.value)); }}
            placeholder="e.g. Madurai Meenakshi Darshan" required />
        </div>
        <Input label="Slug *" value={f.slug} onChange={e => set("slug", e.target.value)} required />
        <Select label="Category *" value={f.category} onChange={e => set("category", e.target.value)}
          options={CATEGORIES.map(c => ({ value: c, label: c }))} required />
        <Input label="Location / District" value={f.locationLabel} onChange={e => set("locationLabel", e.target.value)} placeholder="e.g. Madurai" />
        <Input label="Duration (Days)" type="number" min={1} value={f.durationDays} onChange={e => set("durationDays", Number(e.target.value))} />
        <Input label="Price From (₹)" type="number" min={0} value={f.priceFrom} onChange={e => set("priceFrom", Number(e.target.value))} />
        <Input label="Rating (0–5)" type="number" min={0} max={5} step={0.1} value={f.rating} onChange={e => set("rating", Number(e.target.value))} />
      </div>

      <Input label="Tagline" value={f.tagline} onChange={e => set("tagline", e.target.value)}
        placeholder="Short headline for the package" />
      <Textarea label="Description" value={f.description || ""} onChange={e => set("description", e.target.value)}
        placeholder="Full description of the package…" rows={4} />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Textarea label="Inclusions (one per line)" rows={4} {...arrField("inclusions")} placeholder={"Hotel stay\nAC vehicle\nGuide"} />
        <Textarea label="Exclusions (one per line)" rows={4} {...arrField("exclusions")} placeholder={"Flights\nMeals\nPersonal expenses"} />
        <Textarea label="Highlights (one per line)" rows={4} {...arrField("highlights")} placeholder={"Morning puja access\nHeritage guide\n2 nights"} />
      </div>

      <div className="flex gap-4 flex-wrap">
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" checked={f.featured} onChange={e => set("featured", e.target.checked)} className="w-4 h-4 rounded border-gray-300 text-navy-800" />
          <span className="text-sm text-gray-700 font-medium">Featured on homepage</span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" checked={f.isPublished} onChange={e => set("isPublished", e.target.checked)} className="w-4 h-4 rounded border-gray-300 text-navy-800" />
          <span className="text-sm text-gray-700 font-medium">Published</span>
        </label>
      </div>

      {error && <p className="text-red-600 text-sm bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>}

      <Btn type="submit" variant="primary" loading={saving} className="w-full">
        {initial._id ? "Save Changes" : "Create Package"}
      </Btn>

      {!initial._id && (
        <p className="text-xs text-gray-400 text-center">
          💡 Create the package first, then upload images from the image manager.
        </p>
      )}
    </form>
  );
}

export default function Packages() {
  const [packages,  setPackages]  = useState([]);
  const [total,     setTotal]     = useState(0);
  const [page,      setPage]      = useState(1);
  const [search,    setSearch]    = useState("");
  const [category,  setCategory]  = useState("");
  const [loading,   setLoading]   = useState(true);
  const [editModal, setEditModal] = useState(null);   // null | "create" | pkg obj
  const [imgModal,  setImgModal]  = useState(null);   // null | pkg obj
  const [saving,    setSaving]    = useState(false);
  const [saveErr,   setSaveErr]   = useState("");
  const [delId,     setDelId]     = useState(null);
  const [deleting,  setDeleting]  = useState(false);
  const [toast,     setToast]     = useState(null);

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const q = new URLSearchParams({ page, limit: 9 });
      if (search)   q.set("search",   search);
      if (category) q.set("category", category);
      const r = await api.packages(q.toString());
      setPackages(r.data || []);
      setTotal(r.total || 0);
    } catch (e) { showToast(e.message, "error"); }
    finally { setLoading(false); }
  }, [page, search, category]);

  useEffect(() => { load(); }, [load]);

  const handleSave = async (data) => {
    setSaving(true); setSaveErr("");
    try {
      let result;
      if (editModal?._id) {
        result = await api.updatePackage(editModal._id, data);
        showToast("Package updated");
      } else {
        result = await api.createPackage(data);
        showToast("Package created — now you can upload images!");
        // Open image manager immediately after creating
        if (result?.data?._id) {
          setEditModal(null);
          setImgModal(result.data);
          load();
          return;
        }
      }
      setEditModal(null); load();
    } catch (e) { setSaveErr(e.message); }
    finally { setSaving(false); }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await api.deletePackage(delId);
      setDelId(null); showToast("Package deleted"); load();
    } catch (e) { showToast(e.message, "error"); }
    finally { setDeleting(false); }
  };

  const handleImagesChange = (newImages) => {
    // Update the imgModal's images in state
    setImgModal(prev => prev ? { ...prev, images: newImages, heroImage: newImages[0]?.url || "" } : prev);
    // Also refresh the packages grid so card shows updated image count
    setPackages(prev => prev.map(p =>
      p._id === imgModal?._id ? { ...p, images: newImages, heroImage: newImages[0]?.url || "" } : p
    ));
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Packages"
        description={`${total} packages — each can have up to 5 photos`}
        action={
          <Btn variant="gold" onClick={() => { setEditModal("create"); setSaveErr(""); }}>
            <Plus className="w-4 h-4" /> Add Package
          </Btn>
        }
      />

      {/* Filters */}
      <Card className="p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
              placeholder="Search packages…"
              className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-navy-400 transition" />
          </div>
          <div className="flex gap-1 flex-wrap">
            {["", ...CATEGORIES].map(c => (
              <button key={c} onClick={() => { setCategory(c); setPage(1); }}
                className={`px-3 py-2 rounded-lg text-xs font-semibold transition whitespace-nowrap ${category === c ? "bg-navy-800 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
                {c || "All"}
              </button>
            ))}
          </div>
        </div>
      </Card>

      {/* Grid */}
      {loading ? (
        <div className="flex justify-center py-20"><Spinner size="lg" /></div>
      ) : packages.length === 0 ? (
        <EmptyState icon={Package} title="No packages found"
          action={<Btn variant="gold" onClick={() => setEditModal("create")}><Plus className="w-4 h-4" /> Add Package</Btn>} />
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {packages.map(p => {
              const imgCount = p.images?.length || 0;
              const thumb    = p.heroImage || p.images?.[0]?.url || "";
              return (
                <Card key={p._id} className="overflow-hidden hover:shadow-md transition-shadow flex flex-col">
                  {/* Thumbnail */}
                  <div className="h-36 bg-gradient-to-br from-navy-700 to-navy-900 relative overflow-hidden">
                    {thumb
                      ? <img src={thumb} alt={p.title} className="w-full h-full object-cover" />
                      : <div className="w-full h-full flex items-center justify-center"><span className="text-white/10 font-bold text-5xl">{p.title[0]}</span></div>
                    }
                    <div className="absolute top-2 left-2"><Badge label={p.category} /></div>
                    <div className="absolute top-2 right-2 flex items-center gap-1 bg-white/90 text-navy-800 text-xs font-bold px-2 py-0.5 rounded-full">
                      <Star className="w-3 h-3 fill-gold-500 text-gold-500" /> {p.rating}
                    </div>
                    {/* Image count badge */}
                    <button
                      onClick={() => { setImgModal(p); }}
                      className="absolute bottom-2 right-2 flex items-center gap-1 bg-black/60 hover:bg-black/80 text-white text-xs font-semibold px-2 py-1 rounded-full transition"
                    >
                      <Images className="w-3 h-3" /> {imgCount}/5
                    </button>
                    {!p.isPublished && (
                      <div className="absolute bottom-2 left-2 bg-gray-700 text-gray-200 text-xs font-bold px-2 py-0.5 rounded-full">Draft</div>
                    )}
                  </div>

                  <div className="p-4 flex-1 flex flex-col">
                    <h3 className="font-bold text-navy-800 leading-snug mb-1">{p.title}</h3>
                    <div className="flex flex-wrap gap-3 text-xs text-gray-500 mb-3">
                      {p.locationLabel && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{p.locationLabel}</span>}
                      <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{p.durationDays}d</span>
                      <span className="font-bold text-navy-700">₹{p.priceFrom?.toLocaleString("en-IN")}</span>
                    </div>
                    {p.featured && <span className="self-start text-xs text-gold-600 font-semibold bg-gold-50 px-2 py-0.5 rounded-full border border-gold-100 mb-3">Featured</span>}
                    <div className="mt-auto flex gap-2">
                      <Btn variant="ghost" size="sm" onClick={() => setImgModal(p)}
                        className="flex items-center gap-1 text-navy-600 hover:bg-navy-50">
                        <Images className="w-3.5 h-3.5" /> Photos ({imgCount})
                      </Btn>
                      <Btn variant="secondary" size="sm" onClick={() => { setEditModal(p); setSaveErr(""); }}>
                        <Edit2 className="w-3.5 h-3.5" />
                      </Btn>
                      <Btn variant="ghost" size="sm" onClick={() => setDelId(p._id)} className="text-red-500 hover:bg-red-50">
                        <Trash2 className="w-3.5 h-3.5" />
                      </Btn>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
          <Card className="px-4">
            <Pagination page={page} total={total} pageSize={9} onChange={setPage} />
          </Card>
        </>
      )}

      {/* Create / Edit Modal */}
      <Modal open={!!editModal} onClose={() => setEditModal(null)}
        title={editModal?._id ? `Edit: ${editModal.title}` : "Add New Package"}
        width="max-w-3xl">
        <PackageForm
          initial={editModal === "create" ? EMPTY_PKG : editModal}
          onSave={handleSave} saving={saving} error={saveErr}
        />
      </Modal>

      {/* Image Manager Modal */}
      <Modal open={!!imgModal} onClose={() => { setImgModal(null); load(); }}
        title={`Photos — ${imgModal?.title || ""}`}
        width="max-w-3xl">
        {imgModal && (
          <PackageImageManager
            packageId={imgModal._id}
            images={imgModal.images || []}
            onImagesChange={handleImagesChange}
          />
        )}
      </Modal>

      <Confirm open={!!delId} onClose={() => setDelId(null)} onConfirm={handleDelete}
        loading={deleting} title="Delete package?"
        message="This will permanently remove the package and all its images. This cannot be undone." />

      {toast && <Toast {...toast} onClose={() => setToast(null)} />}
    </div>
  );
}
