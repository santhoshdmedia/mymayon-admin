import { useState, useRef } from "react";
import { Upload, Trash2, Star, GripVertical, ImageOff, Loader2 } from "lucide-react";
import { api } from "../../api";

const MAX = 5;

export default function PackageImageManager({ packageId, images = [], onImagesChange }) {
  const [uploading, setUploading] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [settingHero, setSettingHero] = useState(null);
  const [error, setError] = useState("");
  const [editCaption, setEditCaption] = useState(null); // imageId being edited
  const [captionVal, setCaptionVal] = useState("");
  const inputRef = useRef(null);

  const canUpload = images.length < MAX;

  const handleFiles = async (files) => {
    if (!files?.length) return;
    const toUpload = Array.from(files).slice(0, MAX - images.length);
    if (!toUpload.length) { setError(`Maximum ${MAX} images allowed.`); return; }

    setError(""); setUploading(true);
    try {
      const r = await api.uploadPackageImages(packageId, toUpload);
      onImagesChange(r.images);
    } catch (e) {
      setError(e.message || "Upload failed");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const handleDelete = async (imageId) => {
    setDeletingId(imageId);
    try {
      const r = await api.deletePackageImage(packageId, imageId);
      onImagesChange(r.images);
    } catch (e) { setError(e.message); }
    finally { setDeletingId(null); }
  };

  const handleSetHero = async (imageId) => {
    setSettingHero(imageId);
    try {
      const r = await api.setHeroImage(packageId, imageId);
      onImagesChange(r.images);
    } catch (e) { setError(e.message); }
    finally { setSettingHero(null); }
  };

  const handleSaveCaption = async (imageId) => {
    try {
      const r = await api.updatePackageImage(packageId, imageId, { caption: captionVal });
      onImagesChange(r.images);
    } catch (e) { setError(e.message); }
    finally { setEditCaption(null); }
  };

  const sortedImages = [...images].sort((a, b) => a.order - b.order);
  const heroUrl = sortedImages[0]?.url || "";

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide">
          Package Images <span className="text-gray-400 font-normal normal-case ml-1">({images.length}/{MAX})</span>
        </label>
        {!packageId && (
          <span className="text-xs text-amber-600 bg-amber-50 border border-amber-200 px-2 py-1 rounded-lg">
            Save the package first to upload images
          </span>
        )}
      </div>

      {/* Upload zone */}
      {packageId && canUpload && (
        <div
          onClick={() => !uploading && inputRef.current?.click()}
          onDragOver={e => e.preventDefault()}
          onDrop={e => { e.preventDefault(); handleFiles(e.dataTransfer.files); }}
          className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${
            uploading ? "border-navy-300 bg-navy-50" : "border-gray-300 hover:border-navy-400 hover:bg-navy-50/40"
          }`}
        >
          <input
            ref={inputRef} type="file" accept="image/*" multiple hidden
            onChange={e => handleFiles(e.target.files)}
          />
          {uploading ? (
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="w-8 h-8 text-navy-500 animate-spin" />
              <p className="text-sm text-navy-600 font-medium">Uploading…</p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <Upload className="w-8 h-8 text-gray-400" />
              <p className="text-sm font-semibold text-gray-600">
                Click or drag images here
              </p>
              <p className="text-xs text-gray-400">
                JPG, PNG, WebP · Max 5 MB each · {MAX - images.length} slot{MAX - images.length !== 1 ? "s" : ""} remaining
              </p>
            </div>
          )}
        </div>
      )}

      {error && (
        <p className="text-red-600 text-xs bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>
      )}

      {/* Image grid */}
      {sortedImages.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {sortedImages.map((img, i) => {
            const isHero = i === 0;
            const isDeleting = deletingId === img._id;
            const isSettingH = settingHero === img._id;
            const isEditing  = editCaption === img._id;

            return (
              <div key={img._id}
                className={`group relative rounded-xl overflow-hidden border-2 transition-all ${
                  isHero ? "border-gold-400 shadow-md shadow-gold-200" : "border-gray-200 hover:border-navy-300"
                }`}
              >
                {/* Image */}
                <div className="aspect-[4/3] bg-gray-100">
                  <img
                    src={img.url}
                    alt={img.caption || `Image ${i + 1}`}
                    className="w-full h-full object-cover"
                    onError={e => { e.currentTarget.style.display = "none"; }}
                  />
                </div>

                {/* Hero badge */}
                {isHero && (
                  <div className="absolute top-1.5 left-1.5 bg-gold-500 text-navy-900 text-[10px] font-bold px-1.5 py-0.5 rounded-full flex items-center gap-1">
                    <Star className="w-2.5 h-2.5 fill-current" /> Hero
                  </div>
                )}

                {/* Overlay actions */}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1.5 p-2">
                  {!isHero && packageId && (
                    <button
                      onClick={() => handleSetHero(img._id)}
                      disabled={isSettingH}
                      className="w-full flex items-center justify-center gap-1 bg-gold-500 text-navy-900 text-xs font-bold py-1 rounded-lg hover:bg-gold-400 transition disabled:opacity-60"
                    >
                      {isSettingH ? <Loader2 className="w-3 h-3 animate-spin" /> : <Star className="w-3 h-3" />}
                      Set Hero
                    </button>
                  )}
                  <button
                    onClick={() => { setEditCaption(img._id); setCaptionVal(img.caption || ""); }}
                    className="w-full bg-white/20 hover:bg-white/30 text-white text-xs font-medium py-1 rounded-lg transition"
                  >
                    Edit caption
                  </button>
                  {packageId && (
                    <button
                      onClick={() => handleDelete(img._id)}
                      disabled={isDeleting}
                      className="w-full flex items-center justify-center gap-1 bg-red-500 text-white text-xs font-bold py-1 rounded-lg hover:bg-red-600 transition disabled:opacity-60"
                    >
                      {isDeleting ? <Loader2 className="w-3 h-3 animate-spin" /> : <Trash2 className="w-3 h-3" />}
                      Delete
                    </button>
                  )}
                </div>

                {/* Caption below */}
                {isEditing ? (
                  <div className="p-1.5 bg-white border-t border-gray-200">
                    <input
                      autoFocus
                      value={captionVal}
                      onChange={e => setCaptionVal(e.target.value)}
                      onKeyDown={e => { if (e.key === "Enter") handleSaveCaption(img._id); if (e.key === "Escape") setEditCaption(null); }}
                      placeholder="Caption…"
                      className="w-full text-xs border border-navy-300 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-navy-400"
                    />
                    <div className="flex gap-1 mt-1">
                      <button onClick={() => handleSaveCaption(img._id)} className="flex-1 text-[10px] bg-navy-800 text-white rounded py-0.5 font-semibold">Save</button>
                      <button onClick={() => setEditCaption(null)} className="flex-1 text-[10px] bg-gray-100 text-gray-600 rounded py-0.5">Cancel</button>
                    </div>
                  </div>
                ) : img.caption ? (
                  <div className="px-2 py-1 bg-white border-t border-gray-100">
                    <p className="text-[10px] text-gray-500 truncate">{img.caption}</p>
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
      ) : packageId ? (
        <div className="flex flex-col items-center gap-2 py-8 text-center text-gray-400">
          <ImageOff className="w-10 h-10" />
          <p className="text-sm">No images yet — upload up to {MAX}</p>
        </div>
      ) : null}
    </div>
  );
}
