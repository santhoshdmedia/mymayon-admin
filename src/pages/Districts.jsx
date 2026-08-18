import { useState, useEffect, useCallback } from "react";
import { MapPin, Plus, Search, Edit2, Trash2, CheckCircle2 } from "lucide-react";
import { api } from "../api";
import {
  Card, Btn, Badge, Spinner, Toast, Confirm, Modal,
  PageHeader, EmptyState, Pagination, Input, Select, Textarea,
} from "../components/ui";

const REGIONS = ["Northern","Western","Central","Southern","Delta"];
const FAITHS  = ["Hindu","Muslim","Christian","Buddhist","Jain"];

const EMPTY = {
  name:"", slug:"", tamilName:"", region:"Northern",
  presidingDeity:"", faithCategories:[], circuits:[],
  templeCount:0, idealSeason:"", overview:"",
  highlights:[], featured:false, isPublished:true,
};

function toSlug(name) {
  return name.toLowerCase().trim().replace(/\s+/g,"-").replace(/[^a-z0-9-]/g,"");
}

function DistrictForm({ initial = EMPTY, onSave, saving, error }) {
  const [f, setF] = useState({ ...EMPTY, ...initial });
  const set = (k, v) => setF(p => ({ ...p, [k]: v }));

  const toggleArr = (key, val) =>
    setF(p => ({
      ...p,
      [key]: p[key].includes(val) ? p[key].filter(x => x !== val) : [...p[key], val],
    }));

  const handleNameChange = e => {
    const name = e.target.value;
    set("name", name);
    if (!initial._id) set("slug", toSlug(name));
  };

  return (
    <form onSubmit={e => { e.preventDefault(); onSave(f); }} className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input label="District Name *" value={f.name} onChange={handleNameChange} placeholder="e.g. Madurai" required />
        <Input label="Slug *" value={f.slug} onChange={e => set("slug", e.target.value)} placeholder="e.g. madurai" required />
        <Input label="Tamil Name" value={f.tamilName} onChange={e => set("tamilName", e.target.value)} placeholder="மதுரை" />
        <Select label="Region *" value={f.region} onChange={e => set("region", e.target.value)}
          options={REGIONS.map(r => ({ value: r, label: r }))} required />
        <Input label="Presiding Deity" value={f.presidingDeity} onChange={e => set("presidingDeity", e.target.value)} placeholder="e.g. Meenakshi Amman" />
        <Input label="Temple Count" type="number" min={0} value={f.templeCount} onChange={e => set("templeCount", Number(e.target.value))} />
        <Input label="Ideal Season" value={f.idealSeason} onChange={e => set("idealSeason", e.target.value)} placeholder="e.g. Oct–Mar" />
      </div>

      <Textarea label="Overview" value={f.overview} onChange={e => set("overview", e.target.value)}
        placeholder="Brief description of the district…" rows={3} />

      <div>
        <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">Faith Categories</p>
        <div className="flex flex-wrap gap-2">
          {FAITHS.map(faith => (
            <button key={faith} type="button" onClick={() => toggleArr("faithCategories", faith)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition ${
                f.faithCategories.includes(faith) ? "bg-navy-800 text-white border-navy-800" : "border-gray-300 text-gray-600 hover:border-navy-400"}`}>
              {f.faithCategories.includes(faith) && <CheckCircle2 className="w-3 h-3" />}
              {faith}
            </button>
          ))}
        </div>
      </div>

      <div>
        <Input label="Highlights (comma-separated)"
          value={Array.isArray(f.highlights) ? f.highlights.join(", ") : f.highlights}
          onChange={e => set("highlights", e.target.value.split(",").map(s => s.trim()).filter(Boolean))}
          placeholder="Temple A, Fort B, Lake C" />
      </div>

      <div>
        <Input label="Circuits (comma-separated)"
          value={Array.isArray(f.circuits) ? f.circuits.join(", ") : f.circuits}
          onChange={e => set("circuits", e.target.value.split(",").map(s => s.trim()).filter(Boolean))}
          placeholder="Navagraha Temples, Divya Desam" />
      </div>

      <div className="flex gap-4 flex-wrap">
        <label className="flex items-center gap-2 cursor-pointer select-none">
          <input type="checkbox" checked={f.featured} onChange={e => set("featured", e.target.checked)}
            className="w-4 h-4 rounded border-gray-300 text-navy-800 focus:ring-navy-500" />
          <span className="text-sm text-gray-700 font-medium">Featured on homepage</span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer select-none">
          <input type="checkbox" checked={f.isPublished} onChange={e => set("isPublished", e.target.checked)}
            className="w-4 h-4 rounded border-gray-300 text-navy-800 focus:ring-navy-500" />
          <span className="text-sm text-gray-700 font-medium">Published</span>
        </label>
      </div>

      {error && <p className="text-red-600 text-sm bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>}

      <div className="flex gap-3 pt-2">
        <Btn type="submit" variant="primary" loading={saving} className="flex-1">
          {initial._id ? "Save Changes" : "Create District"}
        </Btn>
      </div>
    </form>
  );
}

export default function Districts() {
  const [districts, setDistricts] = useState([]);
  const [total,     setTotal]     = useState(0);
  const [page,      setPage]      = useState(1);
  const [search,    setSearch]    = useState("");
  const [region,    setRegion]    = useState("");
  const [loading,   setLoading]   = useState(true);
  const [modal,     setModal]     = useState(null); // null | "create" | district_obj
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
      const q = new URLSearchParams({ page, limit: 12 });
      if (search) q.set("search", search);
      if (region) q.set("region", region);
      const r = await api.districts(q.toString());
      setDistricts(r.data || []);
      setTotal(r.total || 0);
    } catch (e) { showToast(e.message, "error"); }
    finally { setLoading(false); }
  }, [page, search, region]);

  useEffect(() => { load(); }, [load]);

  const handleSave = async (data) => {
    setSaving(true); setSaveErr("");
    try {
      if (modal?._id) {
        await api.updateDistrict(modal._id, data);
        showToast("District updated");
      } else {
        await api.createDistrict(data);
        showToast("District created");
      }
      setModal(null); load();
    } catch (e) { setSaveErr(e.message); }
    finally { setSaving(false); }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await api.deleteDistrict(delId);
      setDelId(null); showToast("District deleted"); load();
    } catch (e) { showToast(e.message, "error"); }
    finally { setDeleting(false); }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Districts"
        description={`${total} districts in the database`}
        action={
          <Btn variant="gold" onClick={() => { setModal("create"); setSaveErr(""); }}>
            <Plus className="w-4 h-4" /> Add District
          </Btn>
        }
      />

      {/* Filters */}
      <Card className="p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
              placeholder="Search districts…"
              className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-navy-400 transition" />
          </div>
          <div className="flex gap-1 flex-wrap">
            {["", ...REGIONS].map(r => (
              <button key={r} onClick={() => { setRegion(r); setPage(1); }}
                className={`px-3 py-2 rounded-lg text-xs font-semibold transition ${region === r ? "bg-navy-800 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
                {r || "All"}
              </button>
            ))}
          </div>
        </div>
      </Card>

      {/* Grid */}
      {loading ? (
        <div className="flex justify-center py-20"><Spinner size="lg" /></div>
      ) : districts.length === 0 ? (
        <EmptyState icon={MapPin} title="No districts found" description="Add your first district or adjust your search."
          action={<Btn variant="gold" onClick={() => setModal("create")}><Plus className="w-4 h-4" /> Add District</Btn>} />
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {districts.map(d => (
              <Card key={d._id} className="p-5 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-bold text-navy-800">{d.name}</h3>
                      {d.tamilName && <span className="text-gold-500 text-sm italic">{d.tamilName}</span>}
                    </div>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      <Badge label={d.region} />
                      {d.featured && <span className="text-xs text-gold-600 font-semibold bg-gold-50 px-2 py-0.5 rounded-full border border-gold-100">Featured</span>}
                      {!d.isPublished && <span className="text-xs text-gray-400 font-semibold bg-gray-100 px-2 py-0.5 rounded-full">Draft</span>}
                    </div>
                  </div>
                  <div className="flex gap-1 flex-shrink-0">
                    <button onClick={() => { setModal(d); setSaveErr(""); }}
                      className="p-1.5 rounded-lg text-gray-400 hover:text-navy-600 hover:bg-navy-50 transition">
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button onClick={() => setDelId(d._id)}
                      className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <p className="text-xs text-gray-500 mb-2">{d.presidingDeity}</p>
                <div className="flex items-center gap-4 text-xs text-gray-400">
                  <span><MapPin className="inline w-3 h-3 mr-1" />{d.templeCount} temples</span>
                  {d.idealSeason && <span>Best: {d.idealSeason}</span>}
                </div>
                {d.circuits?.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-3">
                    {d.circuits.slice(0, 2).map(c => (
                      <span key={c} className="text-xs bg-rose-50 text-rose-600 border border-rose-100 px-2 py-0.5 rounded-full">{c}</span>
                    ))}
                    {d.circuits.length > 2 && <span className="text-xs text-gray-400">+{d.circuits.length - 2} more</span>}
                  </div>
                )}
              </Card>
            ))}
          </div>
          <Card className="px-4">
            <Pagination page={page} total={total} pageSize={12} onChange={setPage} />
          </Card>
        </>
      )}

      {/* Create / Edit Modal */}
      <Modal
        open={!!modal}
        onClose={() => setModal(null)}
        title={modal?._id ? `Edit: ${modal.name}` : "Add New District"}
        width="max-w-2xl"
      >
        <DistrictForm
          initial={modal === "create" ? EMPTY : modal}
          onSave={handleSave}
          saving={saving}
          error={saveErr}
        />
      </Modal>

      <Confirm open={!!delId} onClose={() => setDelId(null)} onConfirm={handleDelete}
        loading={deleting} title="Delete district?"
        message="This will permanently remove the district and may affect packages linked to it." />

      {toast && <Toast {...toast} onClose={() => setToast(null)} />}
    </div>
  );
}
