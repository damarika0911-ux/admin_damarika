import { CameraAlt, Close, Delete, Edit } from "@mui/icons-material";
import {
  Alert,
  Avatar,
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormHelperText,
  Grid,
  IconButton,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  TextField,
  Tooltip,
  Typography,
  Zoom,
} from "@mui/material";
import { motion } from "framer-motion";
import { User } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import { getDistricts } from "../services/districtService";
import { uploadImage } from "../services/productService";
import { Image } from "../services/userService";

export type ArchaeologicalSiteType = {
  id: number;
  name: string;
  type: string;
  description: string;
  period: string;
  image: string | Image;
  images: string[];
  district?: string;
  districtId: number;
  status: boolean;
};

type DistrictOption = { id: number; name: string };
type Mode = "create" | "edit" | "view";

interface ModalProps {
  open: boolean;
  mode: Mode;
  title: string;
  initialValues?: Partial<ArchaeologicalSiteType>;
  onCancel: () => void;
  onSubmit: (data: any) => void;
}

const HERITAGE_TYPES = [
  { label: "Cultural", value: "cultural" },
  { label: "Natural", value: "natural" },
  { label: "Mixed", value: "mixed" },
];

const ArchaelogicalSiteModel = ({
  open,
  mode,
  title,
  initialValues,
  onCancel,
  onSubmit,
}: ModalProps) => {
  const isReadOnly = mode === "view";
  const fileInputRef = useRef<HTMLInputElement>(null);
  const multiFileInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    name: "",
    type: "cultural",
    description: "",
    period: "",
    districtId: 0,
    status: true,
  });
  const [mainImage, setMainImage] = useState<string>("");
  const [additionalImages, setAdditionalImages] = useState<string[]>([]);
  const [mainImageFile, setMainImageFile] = useState<File | null>(null);
  const [districts, setDistricts] = useState<DistrictOption[]>([]);
  const [uploading, setUploading] = useState(false);
  const [imageError, setImageError] = useState<string | null>(null);

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
    const fetchDistricts = async () => {
      try {
        const res = await getDistricts();
        setDistricts(res.data.data || []);
      } catch {}
    };
    fetchDistricts();
  }, []);

  useEffect(() => {
    if (!open) return;
    if (initialValues) {
      setForm({
        name: initialValues.name || "",
        type: initialValues.type || "cultural",
        description: initialValues.description || "",
        period: initialValues.period || "",
        districtId: initialValues.districtId || 0,
        status: initialValues.status !== false,
      });

      // Parse main image
      let img = initialValues.image || "";
      if (typeof img === "object" && img !== null) {
        img = (img as Image).url || "";
      }
      setMainImage(img as string);

      // Parse additional images
      let imgs: string[] = [];
      if (initialValues.images) {
        if (typeof initialValues.images === "string") {
          try { imgs = JSON.parse(initialValues.images); } catch {}
        } else if (Array.isArray(initialValues.images)) {
          imgs = initialValues.images;
        }
      }
      setAdditionalImages(imgs);
    } else {
      setForm({ name: "", type: "cultural", description: "", period: "", districtId: 0, status: true });
      setMainImage("");
      setAdditionalImages([]);
    }
    setMainImageFile(null);
  }, [open, initialValues]);

  const handleMainImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const valid = await validateImageSize(file);
    if (!valid) { e.target.value = ""; return; }
    setMainImageFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => setMainImage(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handleAdditionalImages = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    setUploading(true);
    try {
      const uploaded: string[] = [];
      for (const file of Array.from(files)) {
        const valid = await validateImageSize(file);
        if (!valid) continue;
        const res = await uploadImage(file, file.name);
        const url = res.data?.url || res.data?.message || "";
        if (url) uploaded.push(url);
      }
      setAdditionalImages((prev) => [...prev, ...uploaded]);
    } catch (err) {
      console.error("Image upload failed:", err);
    } finally {
      setUploading(false);
      if (multiFileInputRef.current) multiFileInputRef.current.value = "";
    }
  };

  const removeAdditionalImage = (index: number) => {
    setAdditionalImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    let imageData: any = mainImage;
    if (mainImageFile) {
      try {
        const res = await uploadImage(mainImageFile, mainImageFile.name);
        imageData = res.data || "";
      } catch {}
    }

    onSubmit({
      ...(initialValues?.id ? { id: initialValues.id } : {}),
      ...form,
      image: typeof imageData === "object" ? imageData.url || "" : imageData,
      images: JSON.stringify(additionalImages),
    });
  };

  const isValid = form.name && form.districtId;

  return (
    <Dialog
      open={open}
      onClose={onCancel}
      maxWidth="md"
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

      <DialogContent sx={{ p: 3 }}>
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          {/* Main Image */}
          <Box display="flex" justifyContent="center" mb={3} mt={1}>
            <Box position="relative">
              <Avatar
                src={mainImage || undefined}
                sx={{
                  width: 120,
                  height: 120,
                  cursor: isReadOnly ? "default" : "pointer",
                  border: "3px solid",
                  borderColor: "#8B4513",
                }}
                onClick={() => !isReadOnly && fileInputRef.current?.click()}
              >
                <User className="w-12 h-12 text-gray-400" />
              </Avatar>
              {!isReadOnly && (
                <Tooltip title="Change main image">
                  <Paper
                    sx={{ position: "absolute", bottom: 0, right: 0, borderRadius: "50%", boxShadow: 2 }}
                  >
                    <IconButton
                      size="small"
                      onClick={() => fileInputRef.current?.click()}
                      sx={{ p: 1, color: "#8B4513" }}
                    >
                      {mode === "edit" ? <Edit fontSize="small" /> : <CameraAlt fontSize="small" />}
                    </IconButton>
                  </Paper>
                </Tooltip>
              )}
              <input type="file" ref={fileInputRef} onChange={handleMainImageChange} accept="image/*" hidden />
            </Box>
            <Typography variant="caption" sx={{ display: "block", textAlign: "center", mt: 1, color: "text.secondary" }}>
              Required: 800×800px (1:1 square ratio)
            </Typography>
            {imageError && (
              <Alert severity="error" onClose={() => setImageError(null)} sx={{ mt: 1.5, borderRadius: 2, fontSize: "0.8125rem" }}>
                {imageError}
              </Alert>
            )}
          </Box>

          {/* Form Fields */}
          <Grid container spacing={2.5}>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                label="Name *"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                fullWidth
                size="small"
                disabled={isReadOnly}
                sx={{ "& .MuiOutlinedInput-root": { borderRadius: 1.5 } }}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <FormControl fullWidth size="small">
                <InputLabel>Heritage Type *</InputLabel>
                <Select
                  value={form.type}
                  label="Heritage Type *"
                  onChange={(e) => setForm({ ...form, type: e.target.value })}
                  disabled={isReadOnly}
                  sx={{ borderRadius: 1.5 }}
                >
                  {HERITAGE_TYPES.map((t) => (
                    <MenuItem key={t.value} value={t.value}>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <Box
                          sx={{
                            width: 10,
                            height: 10,
                            borderRadius: "50%",
                            bgcolor:
                              t.value === "cultural" ? "#EF4444" : t.value === "natural" ? "#22C55E" : "#F59E0B",
                          }}
                        />
                        {t.label}
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField
                label="Description"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                fullWidth
                size="small"
                multiline
                rows={3}
                disabled={isReadOnly}
                sx={{ "& .MuiOutlinedInput-root": { borderRadius: 1.5 } }}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                label="Period *"
                value={form.period}
                onChange={(e) => setForm({ ...form, period: e.target.value })}
                fullWidth
                size="small"
                disabled={isReadOnly}
                placeholder="e.g. 300 BCE - 200 CE"
                sx={{ "& .MuiOutlinedInput-root": { borderRadius: 1.5 } }}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <FormControl fullWidth size="small">
                <InputLabel>District *</InputLabel>
                <Select
                  value={form.districtId || ""}
                  label="District *"
                  onChange={(e) => setForm({ ...form, districtId: Number(e.target.value) })}
                  disabled={isReadOnly}
                  sx={{ borderRadius: 1.5 }}
                >
                  {districts.map((d) => (
                    <MenuItem key={d.id} value={d.id}>
                      {d.name}
                    </MenuItem>
                  ))}
                </Select>
                <FormHelperText>The site will appear on this district on the map</FormHelperText>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <FormControl fullWidth size="small">
                <InputLabel>Status</InputLabel>
                <Select
                  value={form.status}
                  label="Status"
                  onChange={(e) => setForm({ ...form, status: e.target.value === true || e.target.value === "true" })}
                  disabled={isReadOnly}
                  sx={{ borderRadius: 1.5 }}
                >
                  <MenuItem value={"true" as any}>Active</MenuItem>
                  <MenuItem value={"false" as any}>Inactive</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>

          {/* Additional Images Section */}
          <Box sx={{ mt: 3, pt: 2, borderTop: "1px solid", borderColor: "grey.100" }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="subtitle2" fontWeight={600} color="text.secondary">
                Gallery Images
              </Typography>
              {!isReadOnly && (
                <Button
                  size="small"
                  variant="outlined"
                  onClick={() => multiFileInputRef.current?.click()}
                  disabled={uploading}
                  sx={{
                    borderRadius: 2,
                    textTransform: "none",
                    borderColor: "#8B4513",
                    color: "#8B4513",
                    "&:hover": { borderColor: "#6d3a1f", bgcolor: "#8B4513/5" },
                  }}
                >
                  {uploading ? "Uploading..." : "+ Add Images"}
                </Button>
              )}
              <input
                type="file"
                ref={multiFileInputRef}
                onChange={handleAdditionalImages}
                accept="image/*"
                multiple
                hidden
              />
            </Box>

            {additionalImages.length > 0 ? (
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(100px, 1fr))",
                  gap: 1.5,
                }}
              >
                {additionalImages.map((img, i) => (
                  <Box
                    key={i}
                    sx={{
                      position: "relative",
                      borderRadius: 2,
                      overflow: "hidden",
                      aspectRatio: "1",
                      bgcolor: "grey.100",
                      "&:hover .delete-btn": { opacity: 1 },
                    }}
                  >
                    <img
                      src={img}
                      alt={`Gallery ${i + 1}`}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                      }}
                    />
                    {!isReadOnly && (
                      <IconButton
                        className="delete-btn"
                        size="small"
                        onClick={() => removeAdditionalImage(i)}
                        sx={{
                          position: "absolute",
                          top: 4,
                          right: 4,
                          bgcolor: "rgba(0,0,0,0.5)",
                          color: "#fff",
                          opacity: 0,
                          transition: "opacity 0.2s",
                          width: 24,
                          height: 24,
                          "&:hover": { bgcolor: "rgba(220,38,38,0.8)" },
                        }}
                      >
                        <Delete sx={{ fontSize: 14 }} />
                      </IconButton>
                    )}
                  </Box>
                ))}
              </Box>
            ) : (
              <Box
                sx={{
                  border: "2px dashed",
                  borderColor: "grey.200",
                  borderRadius: 2,
                  p: 3,
                  textAlign: "center",
                }}
              >
                <Typography variant="body2" color="text.disabled">
                  {isReadOnly ? "No gallery images" : "Click \"+ Add Images\" to upload site photos (800×800px recommended)"}
                </Typography>
              </Box>
            )}
          </Box>
        </motion.div>
      </DialogContent>

      <DialogActions sx={{ p: 2.5, bgcolor: "grey.50" }}>
        <Button
          onClick={onCancel}
          color="inherit"
          variant="outlined"
          startIcon={<Close />}
          sx={{ borderRadius: 2 }}
        >
          {isReadOnly ? "Close" : "Cancel"}
        </Button>
        {!isReadOnly && (
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={!isValid}
            sx={{
              borderRadius: 2,
              minWidth: 100,
              backgroundColor: "#8B4513",
              "&:hover": { backgroundColor: "#6d3a1f" },
            }}
          >
            {mode === "create" ? "Create" : "Update"}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default ArchaelogicalSiteModel;
