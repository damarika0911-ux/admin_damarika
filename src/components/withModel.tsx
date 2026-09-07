import { Add, CameraAlt, CheckCircle, Close, Delete, Edit } from "@mui/icons-material";
import {
  Alert,
  Avatar,
  Box,
  Button,
  Chip,
  CircularProgress,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
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
import { alpha, styled } from "@mui/material/styles";
import { motion } from "framer-motion";
import React, { useEffect, useRef, useState } from "react";
import {
  Controller,
  DefaultValues,
  Path,
  SubmitHandler,
  useForm,
} from "react-hook-form";
import { uploadImage } from "../services/productService";

export type FieldType =
  | "text"
  | "number"
  | "email"
  | "password"
  | "date"
  | "select"
  | "textarea"
  | "social_links";

const RequiredAsterisk = styled("span")(({ theme }) => ({
  color: theme.palette.error.main,
  marginLeft: theme.spacing(0.5),
}));

export type ModelField<T> = {
  name: keyof T;
  label: string;
  type: FieldType;
  options?: { label: string; value: any }[];
  fetchOptions?: () => Promise<{ label: string; value: any }[]>;
  rules?: object;
  placeholder?: string;
  disabledInView?: boolean;
  halfWidth?: boolean;
  helperText?: string;
  icon?: React.ReactNode;
  isRequired?: boolean;
  isDisabled?: boolean; // Added new property
};

export type WithModelConfig<T> = {
  name: string;
  fields: ModelField<T>[];
  imageField?: keyof T;
  defaultImage?: React.ReactNode;
  imageHint?: string;
  imageSize?: { width: number; height: number };
};

type Mode = "create" | "edit" | "view";

interface ModalProps<T> {
  open: boolean;
  mode: Mode;
  title: string;
  initialValues?: Partial<T>;
  onCancel: () => void;
  onSubmit: SubmitHandler<Partial<T>>;
}

export default function withModel<T>(config: WithModelConfig<T>) {
  return function ModelModal({
    open,
    mode,
    title,
    initialValues,
    onCancel,
    onSubmit,
  }: ModalProps<T>) {
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imageError, setImageError] = useState<string | null>(null);
    const getDefaultValues = (): DefaultValues<Partial<T>> => {
      const defaults: Record<string, any> = {};
      config.fields.forEach((field) => {
        if (
          field.type === "select" &&
          field.options &&
          field.options.length > 0
        ) {
          defaults[field.name as string] = field.options[0].value; // Set first option as default
        } else {
          defaults[field.name as string] = "";
        }
      });
      if (config.imageField) {
        defaults[config.imageField as string] = "";
      }
      return { ...defaults, ...(initialValues || {}) } as DefaultValues<
        Partial<T>
      >;
    };

    const [imageChanged, setImageChanged] = useState(false);
    const {
      control,
      handleSubmit,
      reset,
      watch,
      formState: { isSubmitting, isValid, isDirty },
    } = useForm<Partial<T>>({
      defaultValues: getDefaultValues(),
      mode: "onChange",
    });
    const formValues = watch();

    const hasEditChanges = React.useMemo(() => {
      if (mode !== "edit" || !initialValues) return true;

      const fieldsChanged = config.fields.some((field) => {
        const fieldName = field.name;
        return (
          formValues[fieldName] !== initialValues[fieldName as keyof Partial<T>]
        );
      });

      const imageFieldChanged = config.imageField
        ? imageChanged ||
          formValues[config.imageField] !==
            initialValues[config.imageField as keyof Partial<T>]
        : false;

      return fieldsChanged || imageFieldChanged;
    }, [
      formValues,
      initialValues,
      imageChanged,
      mode,
      config.fields,
      config.imageField,
    ]);

    const isReadOnly = mode === "view";
    const isSubmitDisabled =
      isSubmitting ||
      isReadOnly ||
      !isValid ||
      (mode === "edit" && !hasEditChanges) ||
      (mode === "create" && !isDirty);

    const [optionsMap, setOptionsMap] = useState<Record<string, any[]>>({});
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [submitSuccess, setSubmitSuccess] = useState(false);
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    let dummyData: ModelField<T>[] =
      mode === "edit" || mode === "view"
        ? config.fields.some((field) => field.name === "password")
          ? config.fields.filter((field) => field.name !== "password")
          : config.fields
        : config.fields;
    useEffect(() => {
      const loadOptions = async () => {
        const optionsPromises = dummyData
          .filter((field) => field.type === "select" && field.fetchOptions)
          .map(async (field) => ({
            name: field.name as string,
            options: await field.fetchOptions!(),
          }));
        const loadedOptions = await Promise.all(optionsPromises);
        const newOptionsMap = loadedOptions.reduce((acc, { name, options }) => {
          acc[name] = options;
          return acc;
        }, {} as Record<string, any[]>);

        setOptionsMap(newOptionsMap);
      };

      loadOptions();

      if (open) {
        setImageChanged(false);
        reset(getDefaultValues());

        if (
          config.imageField &&
          initialValues?.[config.imageField as keyof Partial<T>]
        ) {
          let imageValue = initialValues[
            config.imageField as keyof Partial<T>
          ] as any;
          // Handle JSON object format: {url: "..."} or {message: "...", url: "..."}
          if (imageValue && typeof imageValue === "object" && imageValue.url) {
            imageValue = imageValue.url;
          }
          // Handle JSON string format
          if (imageValue && typeof imageValue === "string" && imageValue.startsWith("{")) {
            try {
              const parsed = JSON.parse(imageValue);
              imageValue = parsed.url || parsed.message || imageValue;
            } catch {}
          }
          setImagePreview(imageValue || null);
        } else {
          setImagePreview(null);
        }
      }
    }, [initialValues, reset, open]);

    const handleImageClick = () => {
      if (mode !== "view" && fileInputRef.current) {
        fileInputRef.current.click();
      }
    };

    const getValidationRules = (field: ModelField<T>) => {
      const rules = field.rules || {};
      if (field.type === "password" && mode !== "create") return { ...rules, required: false };
      // Skip required validation if field is disabled
      if (field.isRequired && !field.isDisabled) {
        return {
          ...rules,
          required: `${field.label} is required`,
        };
      }
      return rules;
    };

    const handleImageChange = async (
      e: React.ChangeEvent<HTMLInputElement>
    ) => {
      const file = e.target.files?.[0];
      if (!file) return;

      setImageError(null);

      if (config.imageSize) {
        const { width: reqW, height: reqH } = config.imageSize;
        const valid = await new Promise<boolean>((resolve) => {
          const img = new window.Image();
          img.onload = () => {
            if (img.width !== reqW || img.height !== reqH) {
              setImageError(
                `Image must be exactly ${reqW}×${reqH}px. Yours is ${img.width}×${img.height}px.`
              );
              resolve(false);
            } else {
              resolve(true);
            }
            URL.revokeObjectURL(img.src);
          };
          img.onerror = () => {
            setImageError("Could not read image dimensions.");
            resolve(false);
          };
          img.src = URL.createObjectURL(file);
        });
        if (!valid) {
          if (fileInputRef.current) fileInputRef.current.value = "";
          return;
        }
      }

      setImageChanged(true);
      setUploading(true);
      const reader = new FileReader();

      reader.onload = (event) => {
        if (event.target?.result) {
          setImagePreview(event.target.result as string);
          setImageFile(file);
        }
      };
      reader.readAsDataURL(file);
      setImageFile(file);
      setUploading(false);
    };

    // Clean image value — DB may store as JSON string '{"url":"..."}'
    const cleanImageUrl = (val: any): string => {
      if (!val) return "";
      if (typeof val === "object" && val.url) return val.url;
      if (typeof val === "string" && val.startsWith("{")) {
        try { return JSON.parse(val).url || val; } catch {}
      }
      return typeof val === "string" ? val : "";
    };

    const onFormSubmit: SubmitHandler<Partial<T>> = async (data: any) => {
      try {
        let finalImage: any = undefined;
        if (imageFile) {
          const imageData = await uploadImage(imageFile, imageFile?.name as string);
          // Extract URL from upload response
          const resp = imageData?.data;
          finalImage = resp?.url || resp?.message || resp || "";
        }
        const payload = { ...data };
        if (config.imageField) {
          // Always send a clean URL string
          payload[config.imageField] = finalImage
            ? cleanImageUrl(finalImage)
            : cleanImageUrl(payload[config.imageField]);
        }
        await onSubmit(payload);
        setSubmitSuccess(true);
        setTimeout(() => setSubmitSuccess(false), 2000);
      } catch (error) {
        console.error("Submission failed:", error);
      }
    };

    const fieldRows: ModelField<T>[][] = [];
    let currentRow: ModelField<T>[] = [];

    dummyData.forEach((field) => {
      if (field.halfWidth) {
        currentRow.push(field);
        if (currentRow.length === 2) {
          fieldRows.push([...currentRow]);
          currentRow = [];
        }
      } else {
        if (currentRow.length > 0) {
          fieldRows.push([...currentRow]);
          currentRow = [];
        }
        fieldRows.push([field]);
      }
    });

    if (currentRow.length > 0) {
      fieldRows.push([...currentRow]);
    }

    const containerVariants = {
      hidden: { opacity: 0 },
      visible: {
        opacity: 1,
        transition: {
          staggerChildren: 0.05,
        },
      },
    };

    const itemVariants = {
      hidden: { y: 20, opacity: 0 },
      visible: {
        y: 0,
        opacity: 1,
        transition: { type: "spring", stiffness: 300, damping: 24 },
      },
    };
    return (
      <Dialog
        open={open}
        onClose={onCancel}
        maxWidth="md"
        fullWidth
        TransitionComponent={Zoom}
        PaperProps={{
          elevation: 2,
          sx: {
            borderRadius: 2,
            overflow: "hidden",
          },
        }}
      >
        <DialogTitle
          sx={{
            p: 2.5,
          }}
          className="bg-[#8B4513]/10 text-[#8B4513]"
        >
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
          >
            <Box display="flex" alignItems="center" gap={1}>
              <Chip
                label={
                  mode === "create" ? "New" : mode === "edit" ? "Edit" : "View"
                }
                size="small"
                color={
                  mode === "create"
                    ? "success"
                    : mode === "edit"
                    ? "primary"
                    : "default"
                }
                sx={{ height: 24 }}
              />
              <Typography
                variant="h6"
                component="span"
                sx={{ fontSize: "1.1rem", fontWeight: 500 }}
              >
                {title}
              </Typography>
            </Box>
            <IconButton
              onClick={onCancel}
              size="small"
              sx={{
                color: "red",
              }}
            >
              <Close />
            </IconButton>
          </Box>
        </DialogTitle>

        <DialogContent sx={{ p: 3 }}>
          <Container maxWidth="md" disableGutters>
            {config.imageField && (
              <Box display="flex" justifyContent="center" mb={4} mt={1}>
                <Box position="relative">
                  <motion.div
                    whileHover={!isReadOnly ? { scale: 1.05 } : {}}
                    onClick={handleImageClick}
                  >
                    <Avatar
                      {...(imagePreview ? { src: imagePreview } : {})}
                      sx={{
                        width: 130,
                        height: 130,
                        cursor: !isReadOnly ? "pointer" : "default",
                        border: "3px solid",
                        borderColor: (theme) =>
                          !isReadOnly ? "#8B4513" : theme.palette.divider,
                        backgroundColor: (theme) =>
                          alpha(theme.palette.background.paper, 0.8),
                        boxShadow: (theme) =>
                          !isReadOnly
                            ? `0 0 15px ${alpha(
                                theme.palette.primary.main,
                                0.2
                              )}`
                            : "none",
                        transition: "all 0.3s ease",
                      }}
                    >
                      {uploading ? (
                        <CircularProgress size={40} />
                      ) : (
                        config.defaultImage || <CameraAlt fontSize="large" />
                      )}
                    </Avatar>
                  </motion.div>
                  {!isReadOnly && (
                    <Tooltip title="Change image">
                      <Paper
                        component={motion.div}
                        whileHover={{ scale: 1.1 }}
                        sx={{
                          position: "absolute",
                          bottom: 0,
                          right: 0,
                          borderRadius: "50%",
                          boxShadow: 2,
                        }}
                      >
                        <IconButton
                          size="small"
                          onClick={handleImageClick}
                          sx={{ p: 1, color: "#8B4513" }}
                        >
                          {mode === "edit" ? (
                            <Edit fontSize="small" />
                          ) : (
                            <CameraAlt fontSize="small" />
                          )}
                        </IconButton>
                      </Paper>
                    </Tooltip>
                  )}
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleImageChange}
                    accept="image/*"
                    style={{ display: "none" }}
                  />
                </Box>
                {config.imageHint && (
                  <Typography
                    variant="caption"
                    sx={{ display: "block", textAlign: "center", mt: 1, color: "text.secondary" }}
                  >
                    {config.imageHint}
                  </Typography>
                )}
                {imageError && (
                  <Alert
                    severity="error"
                    onClose={() => setImageError(null)}
                    sx={{ mt: 1.5, borderRadius: 2, fontSize: "0.8125rem" }}
                  >
                    {imageError}
                  </Alert>
                )}
              </Box>
            )}

            <Divider sx={{ my: 2, opacity: 0.6 }} />

            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              <Box component="form" width="100%">
                {fieldRows.map((row, rowIndex) => (
                  <Grid
                    container
                    spacing={2.5}
                    key={`row-${rowIndex}`}
                    sx={{ mb: 2 }}
                  >
                    {row.map((field) => (
                      <Grid
                        size={{ sm: 12, md: field.halfWidth ? 6 : 12 }}
                        key={String(field.name)}
                        component={motion.div}
                        variants={itemVariants}
                      >
                        <Controller
                          name={field.name as unknown as Path<Partial<T>>}
                          control={control}
                          rules={getValidationRules(field)}
                          render={({
                            field: controllerField,
                            fieldState: { error },
                          }) => {
                            // Ensure value is never undefined to prevent controlled/uncontrolled switch
                            let value =
                              controllerField.value === undefined
                                ? field.type === "select" &&
                                  field.options &&
                                  field.options.length > 0
                                  ? field.options[0].value
                                  : ""
                                : controllerField.value;
                            if (field?.type == "date") {
                              const dateObj = value
                                ? new Date(value)
                                : new Date();
                              value = dateObj.toISOString().split("T")[0];
                            }

                            // Determine if field should be disabled based on isDisabled prop
                            const fieldDisabled =
                              isReadOnly ||
                              field.disabledInView ||
                              field.isDisabled;

                            const commonProps = {
                              fullWidth: true,
                              disabled: fieldDisabled,
                              error: !!error,
                              size: "small" as const,
                              placeholder: field.placeholder,
                              sx: {
                                width: "100%",
                                "& .MuiInputBase-root": {
                                  borderRadius: 1.5,
                                  backgroundColor: (theme: any) =>
                                    theme.palette.mode === "dark"
                                      ? alpha(
                                          theme.palette.background.paper,
                                          0.6
                                        )
                                      : alpha(
                                          theme.palette.background.paper,
                                          0.9
                                        ),
                                  transition: "all 0.2s",
                                  "&:hover": {
                                    backgroundColor: (theme: any) =>
                                      theme.palette.mode === "dark"
                                        ? alpha(
                                            theme.palette.background.paper,
                                            0.8
                                          )
                                        : alpha(
                                            theme.palette.background.paper,
                                            1
                                          ),
                                  },
                                },
                              },
                            };

                            const renderHelperText = () => {
                              if (error) return error.message;
                              if (field.helperText) return field.helperText;
                              return undefined;
                            };

                            // Show asterisk only if field is required AND not disabled
                            const labelWithAsterisk = (
                              <>
                                {field.label}
                                {field.isRequired && !field.isDisabled && (
                                  <RequiredAsterisk>*</RequiredAsterisk>
                                )}
                              </>
                            );

                            switch (field.type) {
                              case "social_links": {
                                const socialPlatforms = [
                                  "Facebook", "Instagram", "X (Twitter)", "LinkedIn",
                                  "YouTube", "WhatsApp", "Telegram", "Website", "Other",
                                ];
                                let links: { platform: string; url: string }[] = [];
                                try {
                                  links = typeof value === "string" ? JSON.parse(value || "[]") : (Array.isArray(value) ? value : []);
                                } catch { links = []; }

                                const updateLinks = (newLinks: { platform: string; url: string }[]) => {
                                  controllerField.onChange(JSON.stringify(newLinks));
                                };

                                return (
                                  <Box>
                                    <Typography variant="subtitle2" sx={{ mb: 1, color: "#8B4513", fontWeight: 600 }}>
                                      {field.label}
                                    </Typography>
                                    {links.map((link, idx) => (
                                      <Box key={idx} display="flex" gap={1} mb={1} alignItems="center">
                                        <FormControl size="small" sx={{ minWidth: 140 }}>
                                          <Select
                                            value={link.platform}
                                            disabled={isReadOnly}
                                            onChange={(e) => {
                                              const updated = [...links];
                                              updated[idx] = { ...updated[idx], platform: e.target.value };
                                              updateLinks(updated);
                                            }}
                                          >
                                            {socialPlatforms.map((p) => (
                                              <MenuItem key={p} value={p}>{p}</MenuItem>
                                            ))}
                                          </Select>
                                        </FormControl>
                                        <TextField
                                          size="small"
                                          fullWidth
                                          placeholder="URL or handle"
                                          value={link.url}
                                          disabled={isReadOnly}
                                          onChange={(e) => {
                                            const updated = [...links];
                                            updated[idx] = { ...updated[idx], url: e.target.value };
                                            updateLinks(updated);
                                          }}
                                        />
                                        {!isReadOnly && (
                                          <IconButton
                                            size="small"
                                            color="error"
                                            onClick={() => {
                                              const updated = links.filter((_, i) => i !== idx);
                                              updateLinks(updated);
                                            }}
                                          >
                                            <Delete fontSize="small" />
                                          </IconButton>
                                        )}
                                      </Box>
                                    ))}
                                    {!isReadOnly && (
                                      <Button
                                        size="small"
                                        startIcon={<Add />}
                                        onClick={() => updateLinks([...links, { platform: "Facebook", url: "" }])}
                                        sx={{ color: "#8B4513", textTransform: "none" }}
                                      >
                                        Add Social Link
                                      </Button>
                                    )}
                                  </Box>
                                );
                              }
                              case "select":
                                return (
                                  <FormControl {...commonProps} error={!!error}>
                                    <InputLabel
                                      id={`label-${String(field.name)}`}
                                    >
                                      {labelWithAsterisk}
                                    </InputLabel>
                                    <Controller
                                      control={control}
                                      name={
                                        field.name as unknown as Path<
                                          Partial<T>
                                        >
                                      }
                                      render={({ field: controllerField }) => (
                                        <Select
                                          {...controllerField}
                                          value={controllerField.value}
                                          labelId={`label-${String(
                                            field.name
                                          )}`}
                                          label={labelWithAsterisk}
                                          disabled={fieldDisabled}
                                          startAdornment={
                                            field.icon ? (
                                              <Box
                                                component="span"
                                                sx={{
                                                  mr: 1,
                                                  color: "text.secondary",
                                                }}
                                              >
                                                {field.icon}
                                              </Box>
                                            ) : undefined
                                          }
                                        >
                                          {(
                                            optionsMap[field.name as string] ||
                                            field.options ||
                                            []
                                          ).map((option) => (
                                            <MenuItem
                                              key={option.value}
                                              value={option.value}
                                            >
                                              {option.label}
                                            </MenuItem>
                                          ))}
                                        </Select>
                                      )}
                                    />
                                    {renderHelperText() && (
                                      <FormHelperText sx={{ mx: 0, mt: 0.5 }}>
                                        {renderHelperText()}
                                      </FormHelperText>
                                    )}
                                  </FormControl>
                                );
                              case "textarea":
                                return (
                                  <TextField
                                    {...controllerField}
                                    value={value}
                                    {...commonProps}
                                    label={labelWithAsterisk}
                                    multiline
                                    rows={4}
                                    helperText={renderHelperText()}
                                    InputProps={{
                                      startAdornment: field.icon ? (
                                        <Box
                                          component="span"
                                          sx={{
                                            mr: 1,
                                            mt: 1,
                                            color: "text.secondary",
                                          }}
                                        >
                                          {field.icon}
                                        </Box>
                                      ) : undefined,
                                    }}
                                  />
                                );
                              default:
                                return (
                                  <TextField
                                    {...controllerField}
                                    value={value}
                                    {...commonProps}
                                    label={labelWithAsterisk}
                                    type={field.type}
                                    helperText={renderHelperText()}
                                    InputProps={{
                                      startAdornment: field.icon ? (
                                        <Box
                                          component="span"
                                          sx={{
                                            mr: 1,
                                            color: "text.secondary",
                                          }}
                                        >
                                          {field.icon}
                                        </Box>
                                      ) : undefined,
                                    }}
                                  />
                                );
                            }
                          }}
                        />
                      </Grid>
                    ))}
                  </Grid>
                ))}
              </Box>
            </motion.div>
          </Container>
        </DialogContent>

        <DialogActions
          sx={{
            p: 2.5,
            backgroundColor: (theme) =>
              alpha(theme.palette.background.default, 0.5),
          }}
        >
          <Button
            onClick={onCancel}
            color="inherit"
            variant="outlined"
            startIcon={<Close />}
            sx={{ borderRadius: 2 }}
          >
            Cancel
          </Button>
          <motion.div
            initial={{ scale: 1 }}
            animate={{ scale: submitSuccess ? [1, 1.2, 1] : 1 }}
            transition={{ duration: 0.3 }}
          >
            <Button
              onClick={handleSubmit(onFormSubmit)}
              variant="contained"
              disabled={isSubmitDisabled}
              startIcon={submitSuccess ? <CheckCircle /> : undefined}
              sx={{
                borderRadius: 2,
                minWidth: 100,
                boxShadow: (theme) =>
                  `0 4px 10px ${alpha(theme.palette.primary.main, 0.3)}`,
                backgroundColor: "#8B4513",
                "&:hover": {
                  backgroundColor: "#8B4513cc", // Slightly lighter on hover
                },
              }}
            >
              {isSubmitting ? (
                <CircularProgress size={24} color="inherit" />
              ) : submitSuccess ? (
                "Saved!"
              ) : mode === "create" ? (
                "Create"
              ) : mode === "edit" ? (
                hasEditChanges ? (
                  "Update"
                ) : (
                  "No Changes"
                )
              ) : (
                "Close"
              )}
            </Button>
          </motion.div>
        </DialogActions>
      </Dialog>
    );
  };
}
