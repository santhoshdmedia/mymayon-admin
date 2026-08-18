import { useState, useEffect, useCallback } from "react";
import { MessageSquare, Search, Trash2, ChevronDown, Phone, Mail, MapPin, Calendar } from "lucide-react";
import { api } from "../api";
import { Card, Btn, Badge, Spinner, Toast, Confirm, PageHeader, EmptyState, Pagination, Select, Input } from "../components/ui";

const STATUSES = ["all","new","contacted","converted","closed"];
const STATUS_OPTIONS = [
  { value:"new",       label:"New" },
  { value:"contacted", label:"Contacted" },
  { value:"converted", label:"Converted" },
  { value:"closed",    label:"Closed" },
];

function EnquiryRow({ e, onStatusChange, onDelete }) {
  const [open, setOpen]   = useState(false);
  const [saving, setSaving] = useState(false);

  const changeStatus = async (status) => {
    setSaving(true);
    try { await onStatusChange(e._id, status); }
    finally { setSaving(false); }
  };

  return (
    <div className="border-b border-gray-100 last:border-0">
      <div className="flex items-center gap-4 px-5 py-4 hover:bg-gray-50/50 transition cursor-pointer" onClick={() => setOpen(p => !p)}>
        <div className="w-10 h-10 rounded-full bg-navy-50 border border-navy-100 flex items-center justify-center flex-shrink-0 font-bold text-navy-700">
          {e.fullName?.[0]?.toUpperCase() || "?"}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="font-semibold text-navy-800 text-sm">{e.fullName}</p>
            {e.destination && <span className="text-xs text-gray-400">→ {e.destination}</span>}
          </div>
          <p className="text-xs text-gray-500 mt-0.5">{e.phone}{e.email ? ` · ${e.email}` : ""}</p>
        </div>
        <div className="flex items-center gap-3">
          <Badge label={e.status} />
          <span className="text-xs text-gray-400 whitespace-nowrap hidden sm:block">
            {new Date(e.createdAt).toLocaleDateString("en-IN", { day:"numeric", month:"short", year:"2-digit" })}
          </span>
          <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${open ? "rotate-180" : ""}`} />
        </div>
      </div>

      {open && (
        <div className="px-5 pb-5 bg-gray-50/50 border-t border-gray-100">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-4 mb-4">
            {e.phone && (
              <a href={`tel:${e.phone}`} className="flex items-center gap-2 text-sm text-navy-700 hover:text-gold-600 transition">
                <Phone className="w-4 h-4 text-gold-500" /> {e.phone}
              </a>
            )}
            {e.email && (
              <a href={`mailto:${e.email}`} className="flex items-center gap-2 text-sm text-navy-700 hover:text-gold-600 transition">
                <Mail className="w-4 h-4 text-gold-500" /> {e.email}
              </a>
            )}
            {e.destination && (
              <span className="flex items-center gap-2 text-sm text-navy-700">
                <MapPin className="w-4 h-4 text-gold-500" /> {e.destination}
              </span>
            )}
            {e.travelDate && (
              <span className="flex items-center gap-2 text-sm text-navy-700">
                <Calendar className="w-4 h-4 text-gold-500" />
                {new Date(e.travelDate).toLocaleDateString("en-IN", { day:"numeric", month:"long", year:"numeric" })}
              </span>
            )}
          </div>
          {e.message && (
            <div className="bg-white border border-gray-200 rounded-xl p-4 text-sm text-gray-600 mb-4">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Message</p>
              {e.message}
            </div>
          )}
          <div className="flex flex-wrap items-center gap-3">
            <Select
              options={STATUS_OPTIONS}
              value={e.status}
              onChange={ev => changeStatus(ev.target.value)}
              className="w-36"
            />
            {saving && <Spinner size="sm" />}
            <div className="ml-auto">
              <Btn variant="ghost" size="sm" onClick={() => onDelete(e._id)} className="text-red-500 hover:bg-red-50">
                <Trash2 className="w-4 h-4" /> Delete
              </Btn>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function Enquiries() {
  const [enquiries, setEnquiries] = useState([]);
  const [total,     setTotal]     = useState(0);
  const [page,      setPage]      = useState(1);
  const [status,    setStatus]    = useState("all");
  const [search,    setSearch]    = useState("");
  const [loading,   setLoading]   = useState(true);
  const [toast,     setToast]     = useState(null);
  const [delId,     setDelId]     = useState(null);
  const [deleting,  setDeleting]  = useState(false);

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const q = new URLSearchParams({ page, limit: 15 });
      if (status !== "all") q.set("status", status);
      if (search) q.set("search", search);
      const r = await api.enquiries(q.toString());
      setEnquiries(r.data || []);
      setTotal(r.total || 0);
    } catch (e) { showToast(e.message, "error"); }
    finally { setLoading(false); }
  }, [page, status, search]);

  useEffect(() => { load(); }, [load]);

  const handleStatusChange = async (id, newStatus) => {
    try {
      await api.updateEnquiry(id, { status: newStatus });
      setEnquiries(p => p.map(e => e._id === id ? { ...e, status: newStatus } : e));
      showToast("Status updated");
    } catch (e) { showToast(e.message, "error"); }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await api.deleteEnquiry(delId);
      setDelId(null);
      showToast("Enquiry deleted");
      load();
    } catch (e) { showToast(e.message, "error"); }
    finally { setDeleting(false); }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Enquiries"
        description={`${total} total enquiries`}
      />

      {/* Filters */}
      <Card className="p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
              placeholder="Search by name, phone or email…"
              className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-navy-400 transition" />
          </div>
          <div className="flex gap-1 flex-wrap">
            {STATUSES.map(s => (
              <button key={s} onClick={() => { setStatus(s); setPage(1); }}
                className={`px-3 py-2 rounded-lg text-xs font-semibold capitalize transition ${status === s ? "bg-navy-800 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
                {s}
              </button>
            ))}
          </div>
        </div>
      </Card>

      <Card className="overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-16"><Spinner size="lg" /></div>
        ) : enquiries.length === 0 ? (
          <EmptyState icon={MessageSquare} title="No enquiries found" description="Adjust your filters or wait for new enquiries to arrive." />
        ) : (
          <>
            {enquiries.map(e => (
              <EnquiryRow key={e._id} e={e} onStatusChange={handleStatusChange} onDelete={id => setDelId(id)} />
            ))}
            <div className="px-5 border-t border-gray-100">
              <Pagination page={page} total={total} pageSize={15} onChange={setPage} />
            </div>
          </>
        )}
      </Card>

      <Confirm open={!!delId} onClose={() => setDelId(null)} onConfirm={handleDelete}
        loading={deleting} title="Delete enquiry?"
        message="This action cannot be undone. The enquiry record will be permanently removed." />
      {toast && <Toast {...toast} onClose={() => setToast(null)} />}
    </div>
  );
}
