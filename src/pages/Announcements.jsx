import { useState, useEffect, useCallback } from "react";
import {
  Megaphone, Plus, Edit2, Trash2, ArrowUp, ArrowDown,
  Eye, EyeOff, Clock, Sparkles, ExternalLink,
} from "lucide-react";
import { api } from "../api";
import {
  Card, Btn, Spinner, Toast, Confirm, Modal,
  PageHeader, EmptyState, Input, Textarea,
} from "../components/ui";

const EMPTY = {
  text: "",
  link: "/packages",
  badge: "Highlights",
  isActive: true,
  startAt: "",
  endAt: "",
};

function toInputValue(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function toIsoOrNull(inputValue) {
  return inputValue ? new Date(inputValue).toISOString() : null;
}

function itemStatus(item) {
  const now = new Date();
  if (!item.isActive) return { label: "Disabled", color: "bg-gray-100 text-gray-500 border-gray-200" };
  if (item.startAt && now < new Date(item.startAt))
    return { label: "Scheduled", color: "bg-blue-50 text-blue-700 border-blue-200" };
  if (item.endAt && now > new Date(item.endAt))
    return { label: "Expired", color: "bg-red-50 text-red-700 border-red-200" };
  return { label: "Live", color: "bg-green-50 text-green-700 border-green-200" };
}

function AnnouncementForm({ initial = EMPTY, onSave, saving, error }) {
  const [f, setF] = useState({
    ...EMPTY,
    ...initial,
    startAt: toInputValue(initial.startAt),
    endAt: toInputValue(initial.endAt),
  });
  const set = (k, v) => setF((p) => ({ ...p, [k]: v }));

  const submit = (e) => {
    e.preventDefault();
    onSave({
      text: f.text,
      link: f.link,
      badge: f.badge || "Highlights",
      isActive: f.isActive,
      startAt: toIsoOrNull(f.startAt),
      endAt: toIsoOrNull(f.endAt),
    });
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      <Textarea
        label="Announcement Text *"
        rows={3}
        value={f.text}
        onChange={(e) => set("text", e.target.value)}
        placeholder="e.g. Special Arupadai Veedu 5-Day Darshan Package — Booking Open for Next Weekend!"
        required
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          label="Target Link"
          value={f.link}
          onChange={(e) => set("link", e.target.value)}
          placeholder="e.g. /packages, /contact, /plan-my-trip"
        />
        <Input
          label="Badge Label"
          value={f.badge}
          onChange={(e) => set("badge", e.target.value)}
          placeholder="e.g. Highlights, Offer, Special Festival"
        />
      </div>

      <label className="flex items-center gap-2 cursor-pointer select-none w-fit">
        <input
          type="checkbox"
          checked={f.isActive}
          onChange={(e) => set("isActive", e.target.checked)}
          className="w-4 h-4 rounded border-gray-300 text-navy-800 focus:ring-navy-500"
        />
        <span className="text-sm text-gray-700 font-medium">Active (visible in ticker stream)</span>
      </label>

      <div className="rounded-xl border border-gray-200 p-4 space-y-3 bg-gray-50/60">
        <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5" /> Schedule Duration (optional)
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input label="Show From" type="datetime-local" value={f.startAt} onChange={(e) => set("startAt", e.target.value)} />
          <Input label="Show Until" type="datetime-local" value={f.endAt} onChange={(e) => set("endAt", e.target.value)} />
        </div>
        <p className="text-xs text-gray-400">Leave blank to keep showing indefinitely while active.</p>
      </div>

      {error && <p className="text-red-600 text-sm bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>}

      <Btn type="submit" variant="gold" loading={saving} className="w-full">
        {initial._id ? "Save Changes" : "Add Announcement"}
      </Btn>
    </form>
  );
}

export default function Announcements() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editModal, setEditModal] = useState(null);
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
      const r = await api.announcements();
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
        await api.updateAnnouncement(editModal._id, data);
        showToast("Announcement updated successfully");
      } else {
        await api.createAnnouncement(data);
        showToast("Announcement created");
      }
      setEditModal(null);
      load();
    } catch (e) {
      setSaveErr(e.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await api.deleteAnnouncement(delId);
      setDelId(null);
      showToast("Announcement deleted");
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
      await api.reorderAnnouncements(order);
    } catch (e) {
      showToast(e.message, "error");
      load();
    }
  };

  const toggleActive = async (item) => {
    try {
      await api.updateAnnouncement(item._id, { isActive: !item.isActive });
      load();
    } catch (e) {
      showToast(e.message, "error");
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Secondary Nav Ticker"
        description="Manage the scrolling announcement ticker stream displayed at the very top of the website navbar."
        action={
          <Btn variant="gold" onClick={() => { setEditModal("create"); setSaveErr(""); }}>
            <Plus className="w-4 h-4" /> Add Announcement
          </Btn>
        }
      />

      {/* Info Callout */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3 text-xs text-amber-900">
        <Sparkles className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
        <div>
          <p className="font-bold">Live Scrolling Ticker Ribbon</p>
          <p className="text-amber-800 mt-0.5">
            Active announcements continuously stream on the gold top bar of the website. Users can click any announcement to jump directly to its target link.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Spinner size="lg" /></div>
      ) : items.length === 0 ? (
        <EmptyState
          icon={Megaphone}
          title="No custom announcements yet"
          description="Create announcement updates, package alerts, or festival schedules for the top scrolling ticker."
          action={<Btn variant="gold" onClick={() => setEditModal("create")}><Plus className="w-4 h-4" /> Add Announcement</Btn>}
        />
      ) : (
        <div className="space-y-3">
          {items.map((item, i) => {
            const status = itemStatus(item);
            return (
              <Card key={item._id} className="p-4 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-gold-100 text-gold-800 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Megaphone className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="text-xs bg-navy-800 text-gold-300 px-2 py-0.5 rounded-full font-bold">
                        {item.badge || "Highlights"}
                      </span>
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${status.color}`}>
                        {status.label}
                      </span>
                      {item.link && (
                        <span className="text-xs text-gray-500 flex items-center gap-1 font-mono">
                          <ExternalLink className="w-3 h-3 text-gray-400" /> {item.link}
                        </span>
                      )}
                    </div>
                    <p className="text-sm font-semibold text-navy-900 leading-snug">{item.text}</p>
                    {(item.startAt || item.endAt) && (
                      <p className="text-xs text-gray-400 mt-1">
                        {item.startAt ? `From ${new Date(item.startAt).toLocaleString()}` : "No start date"}
                        {" · "}
                        {item.endAt ? `Until ${new Date(item.endAt).toLocaleString()}` : "No end date"}
                      </p>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1 flex-shrink-0 self-end sm:self-center border-t sm:border-t-0 pt-2 sm:pt-0 w-full sm:w-auto justify-end">
                  <button
                    onClick={() => move(item, -1)}
                    disabled={i === 0}
                    title="Move up in ticker stream"
                    className="p-1.5 rounded-lg text-gray-400 hover:text-navy-600 hover:bg-navy-50 transition disabled:opacity-30 disabled:pointer-events-none"
                  >
                    <ArrowUp className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => move(item, 1)}
                    disabled={i === items.length - 1}
                    title="Move down in ticker stream"
                    className="p-1.5 rounded-lg text-gray-400 hover:text-navy-600 hover:bg-navy-50 transition disabled:opacity-30 disabled:pointer-events-none"
                  >
                    <ArrowDown className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => toggleActive(item)}
                    title={item.isActive ? "Hide from ticker" : "Show in ticker"}
                    className="p-1.5 rounded-lg text-gray-400 hover:text-navy-600 hover:bg-navy-50 transition"
                  >
                    {item.isActive ? <Eye className="w-4 h-4 text-green-600" /> : <EyeOff className="w-4 h-4 text-gray-400" />}
                  </button>
                  <button
                    onClick={() => { setEditModal(item); setSaveErr(""); }}
                    className="p-1.5 rounded-lg text-gray-400 hover:text-navy-600 hover:bg-navy-50 transition"
                    title="Edit announcement"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setDelId(item._id)}
                    className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition"
                    title="Delete announcement"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Modal */}
      <Modal
        open={!!editModal}
        onClose={() => setEditModal(null)}
        title={editModal?._id ? "Edit Announcement" : "Add New Announcement"}
        width="max-w-xl"
      >
        <AnnouncementForm
          initial={editModal === "create" ? EMPTY : editModal}
          onSave={handleSave}
          saving={saving}
          error={saveErr}
        />
      </Modal>

      <Confirm
        open={!!delId}
        onClose={() => setDelId(null)}
        onConfirm={handleDelete}
        loading={deleting}
        title="Delete announcement?"
        message="This item will be permanently removed from the top secondary navigation ticker."
      />

      {toast && <Toast {...toast} onClose={() => setToast(null)} />}
    </div>
  );
}
