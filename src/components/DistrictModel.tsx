import { Add, Close, Delete } from "@mui/icons-material";
import {
  Alert,
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
  Zoom,
} from "@mui/material";
import { motion } from "framer-motion";
import React, { useEffect, useRef, useState } from "react";
import { TAMIL_NADU_DISTRICTS } from "../data/tamilnaduDistricts";
import { uploadImage } from "../services/productService";

export type DistrictType = {
  id: string;
  name: string;
  path: string;
  centerX: number;
  centerY: number;
  description: string;
  images: string[] | string;
  notablePlaces: string[] | string;
  status: string | boolean;
};

type Mode = "create" | "edit" | "view";

interface DistrictModalProps {
  open: boolean;
  mode: Mode;
  title: string;
  initialValues?: Partial<DistrictType>;
  onCancel: () => void;
  onSubmit: (data: Partial<DistrictType>) => void;
}

const DistrictModel = ({
  open,
  mode,
  title,
  initialValues,
  onCancel,
  onSubmit,
}: DistrictModalProps) => {
  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<boolean>(true);
  const [images, setImages] = useState<string[]>([]);
  const [notablePlaces, setNotablePlaces] = useState<string[]>([]);
  const [newPlace, setNewPlace] = useState("");
  const [uploading, setUploading] = useState(false);
  const [imageError, setImageError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isReadOnly = mode === "view";

  const REQUIRED_SIZE = { width: 800, height: 800 };

  const validateImageSize = (file: File): Promise<boolean> =>
    new Promise((resolve) => {
      const img = new window.Image();
      img.onload = () => {
        if (img.width !== REQUIRED_SIZE.width || img.height !== REQUIRED_SIZE.height) {
          setImageError(
            `Image must be exactly ${REQUIRED_SIZE.width}×${REQUIRED_SIZE.height}px. Yours is ${img.width}×${img.height}px.`
          );
          resolve(false);
        } else {
          setImageError(null);
          resolve(true);
        }
        URL.revokeObjectURL(img.src);
      };
      img.onerror = () => { setImageError("Could not read image."); resolve(false); };
      img.src = URL.createObjectURL(file);
    });

  useEffect(() => {
    if (!open) return;
    if (initialValues) {
      setSelectedDistrict(initialValues.name || "");
      setDescription((initialValues as any).description || "");
      setStatus(
        initialValues.status === true ||
          initialValues.status === "true" ||
          initialValues.status === undefined
      );
      // Parse images
      let imgs: string[] = [];
      if (initialValues.images) {
        if (typeof initialValues.images === "string") {
          try { imgs = JSON.parse(initialValues.images); } catch {}
        } else if (Array.isArray(initialValues.images)) {
          imgs = initialValues.images;
        }
      }
      setImages(imgs);
      // Parse notable places
      let places: string[] = [];
      if ((initialValues as any).notablePlaces) {
        const np = (initialValues as any).notablePlaces;
        if (typeof np === "string") {
          try { places = JSON.parse(np); } catch {}
        } else if (Array.isArray(np)) {
          places = np;
        }
      }
      setNotablePlaces(places);
    } else {
      setSelectedDistrict("");
      setDescription("");
      setStatus(true);
      setImages([]);
      setNotablePlaces([]);
    }
    setNewPlace("");
  }, [open, initialValues]);

  const districtData = TAMIL_NADU_DISTRICTS.find((d) => d.name === selectedDistrict);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    setUploading(true);
    try {
      for (const file of Array.from(files)) {
        const valid = await validateImageSize(file);
        if (!valid) continue;
        const res = await uploadImage(file, file.name);
        const url = res.data?.url || res.data?.message || "";
        if (url) setImages((prev) => [...prev, url]);
      }
    } catch (err) {
      console.error("Upload failed:", err);
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const addPlace = () => {
    const trimmed = newPlace.trim();
    if (!trimmed || notablePlaces.includes(trimmed)) return;
    setNotablePlaces((prev) => [...prev, trimmed]);
    setNewPlace("");
  };

  const removePlace = (index: number) => {
    setNotablePlaces((prev) => prev.filter((_, i) => i !== index));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addPlace();
    }
  };

  const handleSubmit = () => {
    if (!districtData) return;
    onSubmit({
      ...(initialValues?.id ? { id: initialValues.id } : {}),
      name: districtData.name,
      path: districtData.path,
      centerX: districtData.centerX,
      centerY: districtData.centerY,
      description,
      images: JSON.stringify(images) as any,
      notablePlaces: JSON.stringify(notablePlaces) as any,
      status,
    });
  };

  return (
    <Dialog
      open={open}
      onClose={onCancel}
      maxWidth="sm"
      fullWidth
      TransitionComponent={Zoom}
      PaperProps={{ sx: { borderRadius: 3, overflow: "hidden" } }}
    >
      <DialogTitle sx={{ p: 2.5 }} className="bg-[#8B4513]/10 text-[#8B4513]">
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Box display="flex" alignItems="center" gap={1}>
            <Chip
              label={mode === "create" ? "New" : mode === "edit" ? "Edit" : "View"}
              size="small"
              color={mode === "create" ? "success" : mode === "edit" ? "primary" : "default"}
              sx={{ height: 24 }}
            />
            <Typography variant="h6" component="span" sx={{ fontSize: "1.1rem", fontWeight: 500 }}>
              {title}
            </Typography>
          </Box>
          <IconButton onClick={onCancel} size="small" sx={{ color: "red" }}>
            <Close />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ p: 3, pt: 3 }}>
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          {/* District Dropdown */}
          <FormControl fullWidth size="small" sx={{ mb: 2.5, mt: 1 }}>
            <InputLabel>Select District *</InputLabel>
            <Select
              value={selectedDistrict}
              label="Select District *"
              onChange={(e) => setSelectedDistrict(e.target.value)}
              disabled={isReadOnly}
              sx={{ borderRadius: 2 }}
            >
              {TAMIL_NADU_DISTRICTS.map((d) => (
                <MenuItem key={d.name} value={d.name}>{d.name}</MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Auto-filled coordinates */}
          {districtData && (
            <Box sx={{ bgcolor: "#F7F8FA", borderRadius: 2, p: 2, mb: 2.5, border: "1px solid", borderColor: "grey.100" }}>
              <Typography variant="caption" sx={{ fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "grey.500", display: "block", mb: 1 }}>
                Auto-filled coordinates
              </Typography>
              <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}>
                <Box>
                  <Typography variant="caption" color="text.secondary">Center X</Typography>
                  <Typography variant="body1" fontWeight={600}>{districtData.centerX}</Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">Center Y</Typography>
                  <Typography variant="body1" fontWeight={600}>{districtData.centerY}</Typography>
                </Box>
              </Box>
            </Box>
          )}

          {/* Description */}
          <TextField
            label="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            fullWidth
            size="small"
            multiline
            rows={2}
            disabled={isReadOnly}
            sx={{ mb: 2.5, "& .MuiOutlinedInput-root": { borderRadius: 1.5 } }}
            placeholder="Brief description of the district"
          />

          {/* Status */}
          <FormControl fullWidth size="small" sx={{ mb: 3 }}>
            <InputLabel>Status</InputLabel>
            <Select
              value={status}
              label="Status"
              onChange={(e) => setStatus(e.target.value === "true" || e.target.value === true)}
              disabled={isReadOnly}
              sx={{ borderRadius: 2 }}
            >
              <MenuItem value={"true" as any}>Active</MenuItem>
              <MenuItem value={"false" as any}>Inactive</MenuItem>
            </Select>
          </FormControl>

          {/* Images Section */}
          <Box sx={{ borderTop: "1px solid", borderColor: "grey.100", pt: 2.5, mb: 3 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={1.5}>
              <Typography variant="subtitle2" fontWeight={600} color="text.secondary">
                District Images
              </Typography>
              {!isReadOnly && (
                <Button
                  size="small"
                  variant="outlined"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  sx={{ borderRadius: 2, textTransform: "none", borderColor: "#8B4513", color: "#8B4513", "&:hover": { borderColor: "#6d3a1f" } }}
                >
                  {uploading ? "Uploading..." : "+ Add Images"}
                </Button>
              )}
              <input type="file" ref={fileInputRef} onChange={handleImageUpload} accept="image/*" multiple hidden />
            </Box>

            {images.length > 0 ? (
              <Box sx={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(90px, 1fr))", gap: 1.5 }}>
                {images.map((img, i) => (
                  <Box
                    key={i}
                    sx={{
                      position: "relative",
                      borderRadius: 2,
                      overflow: "hidden",
                      aspectRatio: "1",
                      bgcolor: "grey.100",
                      "&:hover .del-btn": { opacity: 1 },
                    }}
                  >
                    <img src={img} alt={`District ${i + 1}`} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    {!isReadOnly && (
                      <IconButton
                        className="del-btn"
                        size="small"
                        onClick={() => removeImage(i)}
                        sx={{
                          position: "absolute", top: 4, right: 4, bgcolor: "rgba(0,0,0,0.5)", color: "#fff",
                          opacity: 0, transition: "opacity 0.2s", width: 22, height: 22,
                          "&:hover": { bgcolor: "rgba(220,38,38,0.8)" },
                        }}
                      >
                        <Delete sx={{ fontSize: 13 }} />
                      </IconButton>
                    )}
                  </Box>
                ))}
              </Box>
            ) : (
              <Box sx={{ border: "2px dashed", borderColor: "grey.200", borderRadius: 2, p: 2.5, textAlign: "center" }}>
                <Typography variant="body2" color="text.disabled">
                  {isReadOnly ? "No images" : "Upload photos of this district (800×800px required)"}
                </Typography>
              </Box>
            )}
            {imageError && (
              <Alert severity="error" onClose={() => setImageError(null)} sx={{ mt: 1.5, borderRadius: 2, fontSize: "0.8125rem" }}>
                {imageError}
              </Alert>
            )}
          </Box>

          {/* Notable Places Section */}
          <Box sx={{ borderTop: "1px solid", borderColor: "grey.100", pt: 2.5 }}>
            <Typography variant="subtitle2" fontWeight={600} color="text.secondary" mb={1.5}>
              Notable Places
            </Typography>

            {!isReadOnly && (
              <Box display="flex" gap={1} mb={2}>
                <TextField
                  value={newPlace}
                  onChange={(e) => setNewPlace(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Type a place name and press Enter"
                  fullWidth
                  size="small"
                  sx={{ "& .MuiOutlinedInput-root": { borderRadius: 1.5 } }}
                />
                <IconButton
                  onClick={addPlace}
                  disabled={!newPlace.trim()}
                  sx={{
                    bgcolor: "#8B4513",
                    color: "#fff",
                    borderRadius: 1.5,
                    width: 40, height: 40,
                    "&:hover": { bgcolor: "#6d3a1f" },
                    "&:disabled": { bgcolor: "grey.200", color: "grey.400" },
                  }}
                >
                  <Add sx={{ fontSize: 20 }} />
                </IconButton>
              </Box>
            )}

            {notablePlaces.length > 0 ? (
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                {notablePlaces.map((place, i) => (
                  <Chip
                    key={i}
                    label={place}
                    onDelete={isReadOnly ? undefined : () => removePlace(i)}
                    sx={{
                      bgcolor: "#8B4513/8",
                      backgroundColor: "rgba(139,69,19,0.08)",
                      color: "#6d3a1f",
                      fontWeight: 500,
                      "& .MuiChip-deleteIcon": { color: "#8B4513", "&:hover": { color: "#dc2626" } },
                    }}
                  />
                ))}
              </Box>
            ) : (
              <Typography variant="body2" color="text.disabled" sx={{ fontStyle: "italic" }}>
                {isReadOnly ? "No notable places added" : "Add temples, monuments, forts, etc."}
              </Typography>
            )}
          </Box>
        </motion.div>
      </DialogContent>

      <DialogActions sx={{ p: 2.5, bgcolor: "grey.50" }}>
        <Button onClick={onCancel} color="inherit" variant="outlined" startIcon={<Close />} sx={{ borderRadius: 2 }}>
          {isReadOnly ? "Close" : "Cancel"}
        </Button>
        {!isReadOnly && (
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={!selectedDistrict}
            sx={{ borderRadius: 2, minWidth: 100, backgroundColor: "#8B4513", "&:hover": { backgroundColor: "#6d3a1f" } }}
          >
            {mode === "create" ? "Create" : "Update"}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default DistrictModel;
