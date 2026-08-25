import { useState, useEffect, useCallback } from "react";
import {
  GalleryHorizontal, Plus, Edit2, Trash2, ArrowUp, ArrowDown,
  Eye, EyeOff, Clock, Timer,
} from "lucide-react";
import { api } from "../api";
import {
  Card, Btn, Spinner, Toast, Confirm, Modal,
  PageHeader, EmptyState, Input, Textarea,
} from "../components/ui";
import HeroSlideImageManager from "../components/ui/HeroSlideImageManager";

const EMPTY = {
  title: "", subtitle: "", ctaText: "", ctaLink: "",
  isActive: true, startAt: "", endAt: "",
  countdownTarget: "", countdownLabel: "Offer ends in",
};

// datetime-local inputs need "YYYY-MM-DDTHH:mm" — convert to/from ISO strings.
function toInputValue(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}
function toIsoOrNull(inputValue) {
  return inputValue ? new Date(inputValue).toISOString() : null;
}

function slideStatus(slide) {
  const now = new Date();
  if (!slide.isActive) return { label: "Disabled", color: "bg-gray-100 text-gray-500 border-gray-200" };
  if (slide.startAt && now < new Date(slide.startAt))
    return { label: "Scheduled", color: "bg-blue-50 text-blue-700 border-blue-200" };
  if (slide.endAt && now > new Date(slide.endAt))
    return { label: "Expired", color: "bg-red-50 text-red-700 border-red-200" };
  return { label: "Live", color: "bg-green-50 text-green-700 border-green-200" };
}

function SlideForm({ initial = EMPTY, onSave, saving, error }) {
  const [f, setF] = useState({
    ...EMPTY,
    ...initial,
    startAt: toInputValue(initial.startAt),
    endAt: toInputValue(initial.endAt),
    countdownTarget: toInputValue(initial.countdownTarget),
  });
  const set = (k, v) => setF((p) => ({ ...p, [k]: v }));

  const submit = (e) => {
    e.preventDefault();
    onSave({
      title: f.title,
      subtitle: f.subtitle,
      ctaText: f.ctaText,
      ctaLink: f.ctaLink,
      isActive: f.isActive,
      startAt: toIsoOrNull(f.startAt),
      endAt: toIsoOrNull(f.endAt),
      countdownTarget: toIsoOrNull(f.countdownTarget),
      countdownLabel: f.countdownLabel,
    });
  };

  return (
    <form onSubmit={submit} className="space-y-5">
      <Input label="Title *" value={f.title} onChange={(e) => set("title", e.target.value)}
        placeholder="e.g. Start Planning Your Dream Trip" required />
      <Textarea label="Subtitle" rows={2} value={f.subtitle} onChange={(e) => set("subtitle", e.target.value)}
        placeholder="Short supporting line shown under the title" />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input label="Button Text" value={f.ctaText} onChange={(e) => set("ctaText", e.target.value)}
          placeholder="e.g. Explore Packages" />
        <Input label="Button Link" value={f.ctaLink} onChange={(e) => set("ctaLink", e.target.value)}
          placeholder="e.g. /packages" />
      </div>

      <label className="flex items-center gap-2 cursor-pointer select-none w-fit">
        <input type="checkbox" checked={f.isActive} onChange={(e) => set("isActive", e.target.checked)}
          className="w-4 h-4 rounded border-gray-300 text-navy-800 focus:ring-navy-500" />
        <span className="text-sm text-gray-700 font-medium">Active (eligible to show on the site)</span>
      </label>

      <div className="rounded-xl border border-gray-200 p-4 space-y-4 bg-gray-50/60">
        <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5" /> Schedule (optional)
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input label="Show From" type="datetime-local" value={f.startAt} onChange={(e) => set("startAt", e.target.value)} />
          <Input label="Show Until" type="datetime-local" value={f.endAt} onChange={(e) => set("endAt", e.target.value)} />
        </div>
        <p className="text-xs text-gray-400">Leave blank to show as soon as it's active, with no end date.</p>
      </div>

      <div className="rounded-xl border border-gold-200 p-4 space-y-4 bg-gold-50/40">
        <p className="text-xs font-semibold text-gold-700 uppercase tracking-wide flex items-center gap-1.5">
          <Timer className="w-3.5 h-3.5" /> Countdown Timer (optional)
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input label="Counts Down To" type="datetime-local" value={f.countdownTarget}
            onChange={(e) => set("countdownTarget", e.target.value)} />
          <Input label="Timer Label" value={f.countdownLabel}
            onChange={(e) => set("countdownLabel", e.target.value)} placeholder="e.g. Offer ends in" />
        </div>
        <p className="text-xs text-gray-500">
          Set a date/time here to show a live countdown overlay on this slide — e.g. a launch or offer deadline.
        </p>
      </div>

      {error && <p className="text-red-600 text-sm bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>}

      <Btn type="submit" variant="primary" loading={saving} className="w-full">
        {initial._id ? "Save Changes" : "Create Slide"}
      </Btn>
      {!initial._id && (
        <p className="text-xs text-gray-400 text-center">
          💡 Create the slide first, then upload its background image.
        </p>
      )}
    </form>
  );
}

export default function HeroSlider() {
  const [slides, setSlides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editModal, setEditModal] = useState(null); // null | "create" | slide obj
  const [imgModal, setImgModal] = useState(null); // null | slide obj
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
      const r = await api.heroSlides();
      setSlides((r.data || []).sort((a, b) => a.order - b.order));
    } catch (e) { showToast(e.message, "error"); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleSave = async (data) => {
    setSaving(true); setSaveErr("");
    try {
      if (editModal?._id) {
        await api.updateHeroSlide(editModal._id, data);
        showToast("Slide updated");
        setEditModal(null); load();
      } else {
        const result = await api.createHeroSlide(data);
        showToast("Slide created — now upload its image!");
        if (result?.data?._id) {
          setEditModal(null);
          setImgModal(result.data);
          load();
          return;
        }
        setEditModal(null); load();
      }
    } catch (e) { setSaveErr(e.message); }
    finally { setSaving(false); }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await api.deleteHeroSlide(delId);
      setDelId(null); showToast("Slide deleted"); load();
    } catch (e) { showToast(e.message, "error"); }
    finally { setDeleting(false); }
  };

  const move = async (slide, dir) => {
    const idx = slides.findIndex((s) => s._id === slide._id);
    const swapWith = slides[idx + dir];
    if (!swapWith) return;
    const order = [
      { id: slide._id, order: swapWith.order },
      { id: swapWith._id, order: slide.order },
    ];
    // Optimistic reorder
    const next = [...slides];
    [next[idx], next[idx + dir]] = [next[idx + dir], next[idx]];
    setSlides(next);
    try {
      await api.reorderHeroSlides(order);
    } catch (e) {
      showToast(e.message, "error");
      load();
    }
  };

  const toggleActive = async (slide) => {
    try {
      await api.updateHeroSlide(slide._id, { isActive: !slide.isActive });
      load();
    } catch (e) { showToast(e.message, "error"); }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Hero Slider"
        description={`${slides.length} slide${slides.length !== 1 ? "s" : ""} configured for the homepage`}
        action={
          <Btn variant="gold" onClick={() => { setEditModal("create"); setSaveErr(""); }}>
            <Plus className="w-4 h-4" /> Add Slide
          </Btn>
        }
      />

      {loading ? (
        <div className="flex justify-center py-20"><Spinner size="lg" /></div>
      ) : slides.length === 0 ? (
        <EmptyState icon={GalleryHorizontal} title="No slides yet"
          description="Add your first homepage hero slide."
          action={<Btn variant="gold" onClick={() => setEditModal("create")}><Plus className="w-4 h-4" /> Add Slide</Btn>} />
      ) : (
        <div className="space-y-3">
          {slides.map((s, i) => {
            const status = slideStatus(s);
            return (
              <Card key={s._id} className="p-4 flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                <div className="w-full sm:w-40 aspect-[16/7] rounded-lg overflow-hidden bg-gray-100 flex-shrink-0 border border-gray-200">
                  {s.image?.url ? (
                    <img src={s.image.url} alt={s.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-300">
                      <GalleryHorizontal className="w-6 h-6" />
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-bold text-navy-800 truncate">{s.title}</h3>
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${status.color}`}>{status.label}</span>
                    {s.countdownTarget && (
                      <span className="text-xs font-semibold px-2 py-0.5 rounded-full border bg-gold-50 text-gold-700 border-gold-200 flex items-center gap-1">
                        <Timer className="w-3 h-3" /> {new Date(s.countdownTarget).toLocaleString()}
                      </span>
                    )}
                  </div>
                  {s.subtitle && <p className="text-sm text-gray-500 mt-1 truncate">{s.subtitle}</p>}
                  {(s.startAt || s.endAt) && (
                    <p className="text-xs text-gray-400 mt-1">
                      {s.startAt ? `From ${new Date(s.startAt).toLocaleString()}` : "No start date"}
                      {" · "}
                      {s.endAt ? `Until ${new Date(s.endAt).toLocaleString()}` : "No end date"}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-1 flex-shrink-0 self-start sm:self-center">
                  <button onClick={() => move(s, -1)} disabled={i === 0}
                    className="p-1.5 rounded-lg text-gray-400 hover:text-navy-600 hover:bg-navy-50 transition disabled:opacity-30 disabled:pointer-events-none">
                    <ArrowUp className="w-4 h-4" />
                  </button>
                  <button onClick={() => move(s, 1)} disabled={i === slides.length - 1}
                    className="p-1.5 rounded-lg text-gray-400 hover:text-navy-600 hover:bg-navy-50 transition disabled:opacity-30 disabled:pointer-events-none">
                    <ArrowDown className="w-4 h-4" />
                  </button>
                  <button onClick={() => toggleActive(s)}
                    title={s.isActive ? "Disable slide" : "Enable slide"}
                    className="p-1.5 rounded-lg text-gray-400 hover:text-navy-600 hover:bg-navy-50 transition">
                    {s.isActive ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                  </button>
                  <button onClick={() => setImgModal(s)}
                    title="Manage image"
                    className="p-1.5 rounded-lg text-gray-400 hover:text-navy-600 hover:bg-navy-50 transition">
                    <GalleryHorizontal className="w-4 h-4" />
                  </button>
                  <button onClick={() => { setEditModal(s); setSaveErr(""); }}
                    className="p-1.5 rounded-lg text-gray-400 hover:text-navy-600 hover:bg-navy-50 transition">
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button onClick={() => setDelId(s._id)}
                    className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Create / Edit metadata modal */}
      <Modal
        open={!!editModal}
        onClose={() => setEditModal(null)}
        title={editModal?._id ? `Edit: ${editModal.title}` : "Add Hero Slide"}
        width="max-w-2xl"
      >
        <SlideForm initial={editModal === "create" ? EMPTY : editModal} onSave={handleSave} saving={saving} error={saveErr} />
      </Modal>

      {/* Image modal */}
      <Modal
        open={!!imgModal}
        onClose={() => { setImgModal(null); load(); }}
        title={`Image: ${imgModal?.title || ""}`}
        width="max-w-xl"
      >
        {imgModal && (
          <HeroSlideImageManager
            slideId={imgModal._id}
            image={imgModal.image}
            onImageChange={(image) => setImgModal((p) => ({ ...p, image }))}
          />
        )}
      </Modal>

      <Confirm open={!!delId} onClose={() => setDelId(null)} onConfirm={handleDelete}
        loading={deleting} title="Delete this slide?"
        message="This will permanently remove the slide and its image from the homepage." />

      {toast && <Toast {...toast} onClose={() => setToast(null)} />}
    </div>
  );
}
