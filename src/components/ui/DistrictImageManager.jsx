import { useState, useRef } from "react";
import { Upload, Trash2, ImageOff, Loader2 } from "lucide-react";
import { api } from "../../api";

export default function DistrictImageManager({ districtId, image, onImageChange }) {
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");
  const inputRef = useRef(null);

  const imageUrl = typeof image === "string" ? image : image?.url || "";
  const hasImage = Boolean(imageUrl && imageUrl.trim());

  const handleFile = async (files) => {
    const file = files?.[0];
    if (!file) return;
    setError("");
    setUploading(true);
    try {
      const r = await api.uploadDistrictImage(districtId, file);
      const newUrl = r.data?.heroImage || r.data?.coverImage || "";
      onImageChange(newUrl);
    } catch (e) {
      setError(e.message || "Upload failed");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await api.deleteDistrictImage(districtId);
      onImageChange("");
    } catch (e) {
      setError(e.message || "Failed to remove image");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-4">
      <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide">
        District Cover Image
      </label>

      {!districtId && (
        <span className="inline-block text-xs text-amber-600 bg-amber-50 border border-amber-200 px-2 py-1 rounded-lg">
          Save the district first to upload its cover image
        </span>
      )}

      {districtId && !hasImage && (
        <div
          onClick={() => !uploading && inputRef.current?.click()}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            handleFile(e.dataTransfer.files);
          }}
          className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
            uploading
              ? "border-navy-300 bg-navy-50"
              : "border-gray-300 hover:border-navy-400 hover:bg-navy-50/40"
          }`}
        >
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            hidden
            onChange={(e) => handleFile(e.target.files)}
          />
          {uploading ? (
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="w-8 h-8 text-navy-500 animate-spin" />
              <p className="text-sm text-navy-600 font-medium">Uploading cover photo…</p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <Upload className="w-8 h-8 text-gray-400" />
              <p className="text-sm font-semibold text-gray-700">Click or drag cover image here</p>
              <p className="text-xs text-gray-400">JPG, PNG, WebP · Up to 10 MB · Recommended high-resolution landscape</p>
            </div>
          )}
        </div>
      )}

      {error && (
        <p className="text-red-600 text-xs bg-red-50 border border-red-200 rounded-lg px-3 py-2">
          {error}
        </p>
      )}

      {districtId && hasImage && (
        <div className="group relative rounded-xl overflow-hidden border-2 border-gold-400 shadow-md shadow-gold-200/50">
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            hidden
            onChange={(e) => handleFile(e.target.files)}
          />
          <div className="aspect-[16/9] bg-gray-100 relative">
            <img
              src={imageUrl}
              alt="District Cover"
              className="w-full h-full object-cover"
              onError={(e) => {
                e.currentTarget.style.display = "none";
              }}
            />
            {uploading && (
              <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-white animate-spin" />
              </div>
            )}
          </div>
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 p-2">
            <button
              onClick={() => inputRef.current?.click()}
              disabled={uploading}
              className="flex items-center justify-center gap-1.5 bg-white/20 hover:bg-white/30 text-white text-xs font-semibold px-4 py-2 rounded-lg backdrop-blur-sm transition"
            >
              {uploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
              Replace Image
            </button>
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="flex items-center justify-center gap-1.5 bg-red-500/80 hover:bg-red-600 text-white text-xs font-semibold px-4 py-2 rounded-lg backdrop-blur-sm transition"
            >
              {deleting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
              Remove Cover
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
