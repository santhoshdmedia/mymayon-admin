import { useState, useRef } from "react";
import { Upload, Trash2, ImageOff, Loader2 } from "lucide-react";
import { api } from "../../api";

export default function HeroSlideImageManager({ slideId, image, onImageChange }) {
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");
  const inputRef = useRef(null);

  const hasImage = !!image?.url;

  const handleFile = async (files) => {
    const file = files?.[0];
    if (!file) return;
    setError(""); setUploading(true);
    try {
      const r = await api.uploadHeroSlideImage(slideId, file);
      onImageChange(r.data.image);
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
      const r = await api.deleteHeroSlideImage(slideId);
      onImageChange(r.data.image);
    } catch (e) { setError(e.message); }
    finally { setDeleting(false); }
  };

  return (
    <div className="space-y-3">
      <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide">
        Slide Background Image
      </label>

      {!slideId && (
        <span className="inline-block text-xs text-amber-600 bg-amber-50 border border-amber-200 px-2 py-1 rounded-lg">
          Save the slide first to upload its image
        </span>
      )}

      {slideId && !hasImage && (
        <div
          onClick={() => !uploading && inputRef.current?.click()}
          onDragOver={e => e.preventDefault()}
          onDrop={e => { e.preventDefault(); handleFile(e.dataTransfer.files); }}
          className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${
            uploading ? "border-navy-300 bg-navy-50" : "border-gray-300 hover:border-navy-400 hover:bg-navy-50/40"
          }`}
        >
          <input
            ref={inputRef} type="file" accept="image/*" hidden
            onChange={e => handleFile(e.target.files)}
          />
          {uploading ? (
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="w-8 h-8 text-navy-500 animate-spin" />
              <p className="text-sm text-navy-600 font-medium">Uploading…</p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <Upload className="w-8 h-8 text-gray-400" />
              <p className="text-sm font-semibold text-gray-600">Click or drag an image here</p>
              <p className="text-xs text-gray-400">JPG, PNG, WebP · Max 5 MB · Recommended 1920×900</p>
            </div>
          )}
        </div>
      )}

      {error && (
        <p className="text-red-600 text-xs bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>
      )}

      {slideId && hasImage && (
        <div className="group relative rounded-xl overflow-hidden border-2 border-gold-400 shadow-md shadow-gold-200">
          <div className="aspect-[16/7] bg-gray-100">
            <img
              src={image.url}
              alt="Slide background"
              className="w-full h-full object-cover"
              onError={e => { e.currentTarget.style.display = "none"; }}
            />
          </div>
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 p-2">
            <button
              onClick={() => inputRef.current?.click()}
              disabled={uploading}
              className="flex items-center justify-center gap-1 bg-white/20 hover:bg-white/30 text-white text-xs font-medium px-3 py-1.5 rounded-lg transition"
            >
              {uploading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Upload className="w-3 h-3" />}
              Replace
            </button>
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="flex items-center justify-center gap-1 bg-red-500 text-white text-xs font-bold px-3 py-1.5 rounded-lg hover:bg-red-600 transition disabled:opacity-60"
            >
              {deleting ? <Loader2 className="w-3 h-3 animate-spin" /> : <Trash2 className="w-3 h-3" />}
              Remove
            </button>
          </div>
          <input
            ref={inputRef} type="file" accept="image/*" hidden
            onChange={e => handleFile(e.target.files)}
          />
        </div>
      )}

      {slideId && !hasImage && !uploading && (
        <div className="flex flex-col items-center gap-2 py-4 text-center text-gray-400">
          <ImageOff className="w-8 h-8" />
        </div>
      )}
    </div>
  );
}
