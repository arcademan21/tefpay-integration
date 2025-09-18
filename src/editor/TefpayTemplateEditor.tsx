import imageCompression from "browser-image-compression";

// Utilidad para obtener todas las claves traducibles (incluyendo {MSGxx})
function getAllTranslatableKeys(
  templateConfig: TemplateConfig,
  templateModel?: TemplateModel
): string[] {
  const keys = [
    "payButton",
    "cardLabel",
    "msg48",
    "msg46",
    "msg47",
    "msg19",
    "msg50",
    "payTitle",
    "paySuccessText",
    "payFailText",
    "payError",
  ];
  // Extraer {MSGxx} de textos globales
  const globalMsgs = Object.values(templateConfig)
    .filter((v) => typeof v === "string" && /\{MSG\d+\}/.test(v))
    .flatMap((v) => v.match(/\{MSG\d+\}/g) || []);
  // Extraer de campos
  const fieldMsgs = (templateModel?.fields || [])
    .flatMap((f) => [f.label, f.placeholder])
    .filter(Boolean)
    .flatMap((v) =>
      typeof v === "string" ? v.match(/\{MSG\d+\}/g) || [] : []
    );
  // Unir y deduplicar
  return Array.from(new Set([...keys, ...globalMsgs, ...fieldMsgs]));
}
// Tipo para los assets exportables
type ExportableAssets = {
  logo?: string;
  logoName?: string;
  bg?: string;
  bgName?: string;
  icons?: { url: string; name: string }[];
  favicon?: string;
  faviconName?: string;
};

// Convierte un dataURL (base64) en Blob de forma segura
function safeDataUrlToBlob(dataUrl: string): Blob {
  const arr = dataUrl.split(",");
  const mimeMatch = arr[0].match(/:(.*?);/);
  const mime = mimeMatch ? mimeMatch[1] : "application/octet-stream";
  const bstr = atob(arr[1] || "");
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new Blob([u8arr], { type: mime });
}
import React, { useState } from "react";
import i18next from "./i18n";
import MonacoEditor from "@monaco-editor/react";
import {
  parseTemplateHtml,
  TemplateModel,
} from "../template/parseTemplateHtml";

// Tipos
type TemplateConfig = {
  layout: string;
  bgColor: string;
  textColor: string;
  font: string;
  payButton: string;
  cardLabel: string;
  msg48: string;
  msg46: string;
  msg47: string;
  msg19: string;
  msg50: string;
  payTitle: string;
  paySuccessText: string;
  payFailText: string;
  payError: string;
  logic: string;
  logicSuccess: string;
  logicError: string;
  logicSubmit: string;
  fieldVisibility: Record<string, string>;
  customCss?: string;
  [key: string]: any;
};

// Constantes de pestañas
const tabs = [
  { key: "layout", label: "Layout" },
  { key: "styles", label: "Estilos" },
  { key: "texts", label: "Textos" },
  { key: "mensajes", label: "Mensajes" },
  { key: "logic", label: "Lógica" },
  { key: "preview", label: "Vista previa" },
  { key: "export", label: "Exportar" },
  { key: "validaciones", label: "Validaciones" },
];

// Opciones de layout
const layoutOptions = [
  {
    key: "clásico",
    name: "Clásico",
    desc: "Formulario tradicional con campos verticales",
    img: undefined,
  },
  {
    key: "compacto",
    name: "Compacto",
    desc: "Diseño compacto para móvil",
    img: undefined,
  },
  {
    key: "horizontal",
    name: "Horizontal",
    desc: "Campos alineados horizontalmente",
    img: undefined,
  },
];

// Renderiza la vista previa del formulario
function renderPreviewForm(
  config: TemplateConfig,
  model?: TemplateModel,
  assets?: { logo?: string; bg?: string; icons?: string[] }
) {
  if (!model)
    return <div style={{ color: "#888" }}>No hay template base cargada.</div>;
  return (
    <form
      style={{
        background: assets?.bg
          ? `url(${assets.bg}) center/cover`
          : config.bgColor,
        color: config.textColor,
        fontFamily: config.font,
        padding: 24,
        borderRadius: 12,
        boxShadow: "0 2px 12px #5B3EFF22",
        maxWidth: 480,
        margin: "0 auto",
        position: "relative",
      }}
    >
      {assets?.logo && (
        <img
          src={assets.logo}
          alt="Logo"
          style={{
            maxWidth: 120,
            maxHeight: 60,
            position: "absolute",
            top: 18,
            right: 18,
            borderRadius: 8,
            boxShadow: "0 2px 8px #2222",
          }}
        />
      )}
      <h4 style={{ marginTop: assets?.logo ? 70 : 0 }}>{config.payTitle}</h4>
      {model.fields.map((field) => {
        // Condición de visibilidad
        const visibleCond = config.fieldVisibility?.[field.key];
        let visible = true;
        if (visibleCond && visibleCond.trim()) {
          try {
            visible = true;
          } catch {
            visible = true;
          }
        }
        if (!visible) return null;
        return (
          <div key={field.key} style={{ marginBottom: 16 }}>
            <label>{field.label || field.key}</label>
            <input
              id={field.key}
              type={field.type === "select" ? "select" : "text"}
              placeholder={field.placeholder || ""}
              style={{
                width: "100%",
                padding: 8,
                borderRadius: 4,
                border: "1px solid #ccc",
              }}
            />
          </div>
        );
      })}
      {assets?.icons && assets.icons.length > 0 && (
        <div style={{ display: "flex", gap: 8, margin: "18px 0" }}>
          {assets.icons.map((icon, idx) => (
            <img
              key={idx}
              src={icon}
              alt={`Icono ${idx + 1}`}
              style={{ width: 32, height: 32, borderRadius: 6 }}
            />
          ))}
        </div>
      )}
      <button
        type="submit"
        style={{
          background: "#5B3EFF",
          color: "#fff",
          border: "none",
          borderRadius: 6,
          padding: "10px 28px",
          fontSize: 18,
          marginTop: 18,
        }}
      >
        {config.payButton}
      </button>
    </form>
  );
}

// Exportación: incluir lógica visual avanzada en el HTML generado
const generatePreviewHtml = (
  config: TemplateConfig,
  assets?: { logo?: string; bg?: string; icons?: string[] }
) => {
  // Genera el HTML con los campos y lógica visual avanzada, integrando assets
  const fields = [
    { key: "card", label: config.cardLabel },
    { key: "exp", label: config.msg19 },
    { key: "cvv", label: "CVV" },
    { key: "name", label: "Nombre" },
    { key: "email", label: "Email" },
    { key: "amount", label: "Importe" },
    { key: "country", label: "País" },
    { key: "dni", label: "DNI/NIF" },
  ];
  let bgStyle = assets?.bg
    ? `background:url(${assets.bg}) center/cover;`
    : `background:${config.bgColor};`;
  let logoHtml = assets?.logo
    ? `<img src='${assets.logo}' alt='Logo' style='max-width:120px;max-height:60px;position:absolute;top:18px;right:18px;border-radius:8px;box-shadow:0 2px 8px #2222;' />`
    : "";
  let iconsHtml =
    assets?.icons && assets.icons.length > 0
      ? `<div style='display:flex;gap:8;margin:18px 0;'>${assets.icons
          .map(
            (icon) =>
              `<img src='${icon}' style='width:32px;height:32px;border-radius:6px;' />`
          )
          .join("")}</div>`
      : "";
  // Lógica visual avanzada JS
  let logicJs = "";
  Object.entries(config.fieldVisibility || {}).forEach(([key, cond]) => {
    if (cond && cond.trim()) {
      logicJs += `\ndocument.getElementById('${key}').style.display = (${cond}) ? '' : 'none';`;
    }
  });
  // Callbacks JS
  const callbacks = [config.logicSuccess, config.logicError, config.logicSubmit]
    .filter(Boolean)
    .join("\n");
  return `<!DOCTYPE html>
<html><head><meta charset='utf-8'><title>${config.payTitle}</title></head>
<body style='${bgStyle}color:${config.textColor};font-family:${
    config.font
  };position:relative;'>
${logoHtml}
<form id='tefpay-form' style='position:relative;'>
  <h4>${config.payTitle}</h4>
  ${fields
    .map(
      (field) =>
        `<div style='margin-bottom:16px;'><label>${field.label}</label><input id='${field.key}' type='text' style='width:100%;padding:8px;border-radius:4px;border:1px solid #ccc;'/></div>`
    )
    .join("")}
  ${iconsHtml}
  <button type='submit' style='background:#5B3EFF;color:#fff;border:none;border-radius:6px;padding:10px 28px;font-size:18px;margin-top:18px;'>${
    config.payButton
  }</button>
</form>
<script>
document.getElementById('tefpay-form').addEventListener('input', function() {
  ${logicJs}
});
${callbacks}
</script>
</body></html>`;
};

// Exporta la template y las traducciones en un ZIP
// Exporta la template y las traducciones en un ZIP
const exportTemplateZip = async (
  html: string,
  translations: Record<string, any>,
  assets: ExportableAssets,
  opts: any
) => {
  // Usar JSZip para crear el ZIP
  // @ts-ignore
  const JSZip = (window as any).JSZip || undefined;
  if (!JSZip) {
    alert("JSZip no está disponible. Asegúrate de incluirlo en tu proyecto.");
    return;
  }
  const zip = new JSZip();
  zip.file("template.html", html);
  zip.file("translations.json", JSON.stringify(translations, null, 2));
  const options = {
    maxSizeMB: 0.3,
    maxWidthOrHeight: 800,
    useWebWorker: true,
  };
  // Exportar logo en varios formatos
  if (assets.logo) {
    let logoData = assets.logo;
    try {
      const blob = safeDataUrlToBlob(assets.logo);
      const compressed = await imageCompression(blob, options);
      logoData = await imageCompression.getDataUrlFromFile(compressed);
    } catch {}
    const ext = (assets.logoName?.split(".").pop() || "png").toLowerCase();
    zip.file(`logo.${ext}`, safeDataUrlToBlob(logoData));
    // Si el logo es PNG, exportar también como JPG si es posible
    if (ext === "png") {
      // Convertir a JPG
      const canvas = document.createElement("canvas");
      const img = new window.Image();
      img.src = logoData;
      await new Promise((resolve) => (img.onload = resolve));
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d");
      ctx?.drawImage(img, 0, 0);
      const jpgDataUrl = canvas.toDataURL("image/jpeg", 0.92);
      zip.file("logo.jpg", safeDataUrlToBlob(jpgDataUrl));
    }
    // Si el logo es SVG, exportar también como PNG
    if (ext === "svg") {
      // Convertir SVG a PNG
      const canvas = document.createElement("canvas");
      const img = new window.Image();
      img.src = logoData;
      await new Promise((resolve) => (img.onload = resolve));
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d");
      ctx?.drawImage(img, 0, 0);
      const pngDataUrl = canvas.toDataURL("image/png");
      zip.file("logo.png", safeDataUrlToBlob(pngDataUrl));
    }
  }
  // Exportar fondo en varios formatos
  if (assets.bg) {
    let bgData = assets.bg;
    try {
      const blob = safeDataUrlToBlob(assets.bg);
      const compressed = await imageCompression(blob, options);
      bgData = await imageCompression.getDataUrlFromFile(compressed);
    } catch {}
    const ext = (assets.bgName?.split(".").pop() || "png").toLowerCase();
    zip.file(`bg.${ext}`, safeDataUrlToBlob(bgData));
    if (ext === "png") {
      const canvas = document.createElement("canvas");
      const img = new window.Image();
      img.src = bgData;
      await new Promise((resolve) => (img.onload = resolve));
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d");
      ctx?.drawImage(img, 0, 0);
      const jpgDataUrl = canvas.toDataURL("image/jpeg", 0.92);
      zip.file("bg.jpg", safeDataUrlToBlob(jpgDataUrl));
    }
    if (ext === "svg") {
      const canvas = document.createElement("canvas");
      const img = new window.Image();
      img.src = bgData;
      await new Promise((resolve) => (img.onload = resolve));
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d");
      ctx?.drawImage(img, 0, 0);
      const pngDataUrl = canvas.toDataURL("image/png");
      zip.file("bg.png", safeDataUrlToBlob(pngDataUrl));
    }
  }
  // Exportar iconos en varios formatos
  if (assets.icons && assets.icons.length > 0) {
    for (let idx = 0; idx < assets.icons.length; idx++) {
      let iconData = assets.icons[idx].url;
      try {
        const blob = safeDataUrlToBlob(assets.icons[idx].url);
        const compressed = await imageCompression(blob, options);
        iconData = await imageCompression.getDataUrlFromFile(compressed);
      } catch {}
      const ext = (
        assets.icons[idx].name?.split(".").pop() || "png"
      ).toLowerCase();
      zip.file(`icon-${idx + 1}.${ext}`, safeDataUrlToBlob(iconData));
      if (ext === "png") {
        const canvas = document.createElement("canvas");
        const img = new window.Image();
        img.src = iconData;
        await new Promise((resolve) => (img.onload = resolve));
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext("2d");
        ctx?.drawImage(img, 0, 0);
        const jpgDataUrl = canvas.toDataURL("image/jpeg", 0.92);
        zip.file(`icon-${idx + 1}.jpg`, safeDataUrlToBlob(jpgDataUrl));
      }
      if (ext === "svg") {
        const canvas = document.createElement("canvas");
        const img = new window.Image();
        img.src = iconData;
        await new Promise((resolve) => (img.onload = resolve));
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext("2d");
        ctx?.drawImage(img, 0, 0);
        const pngDataUrl = canvas.toDataURL("image/png");
        zip.file(`icon-${idx + 1}.png`, safeDataUrlToBlob(pngDataUrl));
      }
    }
  }
  // Agregar favicon
  if (assets.favicon) {
    try {
      const blob = safeDataUrlToBlob(assets.favicon);
      const ext = (assets.faviconName?.split(".").pop() || "ico").toLowerCase();
      zip.file(`favicon.${ext}`, blob);
    } catch {
      zip.file("favicon.png", safeDataUrlToBlob(assets.favicon));
    }
  }
  const content = await zip.generateAsync({ type: "blob" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(content);
  a.download = "tefpay-template.zip";
  a.click();
};
const restoreDefaults = () => {};

interface Props {
  onClose: () => void;
}

const LANGS = [
  { code: "es", label: "Español" },
  { code: "en", label: "English" },
];

const TefpayTemplateEditorModal: React.FC<Props> = ({ onClose }) => {
  const [tab, setTab] = useState<string>("layout");
  const [lang, setLang] = useState<string>(i18next.language || "es");
  const [templateConfig, setTemplateConfig] = useState<TemplateConfig>(() => {
    // Inicializa textos traducibles desde i18next
    const t = i18next.getFixedT(lang);
    return {
      layout: "clásico",
      bgColor: "#fff",
      textColor: "#222",
      font: "Arial",
      payButton: t("payButton"),
      cardLabel: t("cardLabel"),
      msg48: t("msg48"),
      msg46: t("msg46"),
      msg47: t("msg47"),
      msg19: t("msg19"),
      msg50: t("msg50"),
      payTitle: t("payTitle"),
      paySuccessText: t("paySuccessText"),
      payFailText: t("payFailText"),
      payError: t("payError"),
      logic: "",
      logicSuccess: "",
      logicError: "",
      logicSubmit: "",
      fieldVisibility: {},
    };
  });
  const [templateHtml, setTemplateHtml] = useState<string>("");
  const [templateModel, setTemplateModel] = useState<TemplateModel | undefined>(
    undefined
  );
  // Estado para assets
  const [assets, setAssets] = useState<{
    logo?: string;
    logoName?: string;
    bg?: string;
    bgName?: string;
    icons?: { url: string; name: string }[];
    favicon?: string;
    faviconName?: string;
  }>({});

  // Eliminar asset
  const handleRemoveAsset = (type: string, idx?: number) => {
    setAssets((prev) => {
      if (type === "logo")
        return { ...prev, logo: undefined, logoName: undefined };
      if (type === "bg") return { ...prev, bg: undefined, bgName: undefined };
      if (type === "icon" && typeof idx === "number") {
        return {
          ...prev,
          icons: (prev.icons || []).filter((_, i) => i !== idx),
        };
      }
      return prev;
    });
  };

  // Renombrar asset
  const handleRenameAsset = (type: string, name: string, idx?: number) => {
    setAssets((prev) => {
      if (type === "logo") return { ...prev, logoName: name };
      if (type === "bg") return { ...prev, bgName: name };
      if (type === "icon" && typeof idx === "number") {
        return {
          ...prev,
          icons: (prev.icons || []).map((icon, i) =>
            i === idx ? { ...icon, name } : icon
          ),
        };
      }
      return prev;
    });
  };

  // Reordenar iconos
  const handleMoveIcon = (from: number, to: number) => {
    setAssets((prev) => {
      const icons = [...(prev.icons || [])];
      const [moved] = icons.splice(from, 1);
      icons.splice(to, 0, moved);
      return { ...prev, icons };
    });
  };

  const handleAssetDrop = async (
    e: React.DragEvent<HTMLDivElement>,
    type: string
  ) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (!file) return;
    const options = {
      maxSizeMB: 0.3,
      maxWidthOrHeight: 800,
      useWebWorker: true,
    };
    let compressedFile = file;
    try {
      compressedFile = await imageCompression(file, options);
    } catch (err) {
      compressedFile = file;
    }
    const reader = new FileReader();
    reader.onload = (ev) => {
      const url = ev.target?.result as string;
      const name = file.name;
      setAssets((prev) => {
        if (type === "logo") return { ...prev, logo: url, logoName: name };
        if (type === "bg") return { ...prev, bg: url, bgName: name };
        if (type === "icon") {
          return { ...prev, icons: [...(prev.icons || []), { url, name }] };
        }
        if (type === "favicon")
          return { ...prev, favicon: url, faviconName: name };
        return prev;
      });
    };
    reader.readAsDataURL(compressedFile);
  };

  // Permite al usuario cargar una template base HTML
  const handleTemplateHtmlChange = (
    e: React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    const html = e.target.value;
    setTemplateHtml(html);
    const model = parseTemplateHtml(html);
    setTemplateModel(model);
  };

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        background: "rgba(30, 30, 40, 0.85)",
        zIndex: 10000,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          background: "#fff",
          borderRadius: 16,
          boxShadow: "0 8px 32px rgba(0,0,0,0.25)",
          width: "90vw",
          maxWidth: 900,
          minHeight: 520,
          padding: 32,
          position: "relative",
        }}
      >
        <button
          style={{
            position: "absolute",
            top: 24,
            right: 24,
            background: "#eee",
            border: "none",
            borderRadius: 8,
            fontSize: 24,
            cursor: "pointer",
            padding: "4px 12px",
          }}
          title="Cerrar editor"
          onClick={onClose}
        >
          ×
        </button>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 24,
          }}
        >
          <h2 style={{ color: "#5B3EFF" }}>Editor visual de template Tefpay</h2>
          <div>
            <label style={{ marginRight: 8, fontWeight: "bold" }}>
              Idioma:
            </label>
            <select
              value={lang}
              onChange={(e) => {
                const newLang = e.target.value;
                setLang(newLang);
                i18next.changeLanguage(newLang);
                // Actualiza textos traducibles en el config
                const t = i18next.getFixedT(newLang);
                setTemplateConfig((cfg) => ({
                  ...cfg,
                  payButton: t("payButton"),
                  cardLabel: t("cardLabel"),
                  msg48: t("msg48"),
                  msg46: t("msg46"),
                  msg47: t("msg47"),
                  msg19: t("msg19"),
                  msg50: t("msg50"),
                  payTitle: t("payTitle"),
                  paySuccessText: t("paySuccessText"),
                  payFailText: t("payFailText"),
                  payError: t("payError"),
                }));
              }}
              style={{ fontSize: 15, padding: "4px 10px", borderRadius: 6 }}
            >
              {LANGS.map((l) => (
                <option key={l.code} value={l.code}>
                  {l.label}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div style={{ display: "flex", gap: 8, marginBottom: 24 }}>
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              style={{
                padding: "8px 18px",
                borderRadius: 8,
                border: tab === t.key ? "2px solid #5B3EFF" : "1px solid #ddd",
                background: tab === t.key ? "#ecebff" : "#f6f6fa",
                color: tab === t.key ? "#5B3EFF" : "#444",
                fontWeight: tab === t.key ? "bold" : "normal",
                cursor: "pointer",
                fontSize: 16,
                transition: "all 0.2s",
              }}
            >
              {t.label}
            </button>
          ))}
        </div>
        <div style={{ minHeight: 320 }}>
          {tab === "layout" && (
            <section>
              <h3 style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span role="img" aria-label="layout">
                  🗂️
                </span>{" "}
                Galería de layouts y template base
              </h3>
              <p>
                Elige el diseño visual para tu formulario de pago o carga una
                template base HTML para editarla visualmente.
              </p>
              <div style={{ marginBottom: 18 }}>
                <label style={{ fontWeight: "bold" }}>
                  Template HTML base:
                </label>
                <textarea
                  style={{
                    width: "100%",
                    minHeight: 80,
                    fontFamily: "monospace",
                    marginTop: 8,
                  }}
                  value={templateHtml}
                  onChange={handleTemplateHtmlChange}
                  placeholder="Pega aquí tu HTML base para analizar y editar visualmente"
                />
                {templateModel && (
                  <div style={{ marginTop: 8, fontSize: 13, color: "#444" }}>
                    <b>Campos detectados:</b>{" "}
                    {templateModel.fields.map((f) => f.key).join(", ")}
                  </div>
                )}
              </div>
              <div style={{ display: "flex", gap: 32, marginTop: 16 }}>
                {layoutOptions.map((layout) => (
                  <div
                    key={layout.key}
                    style={{
                      border:
                        templateConfig.layout === layout.key
                          ? "2px solid #5B3EFF"
                          : "1px solid #ddd",
                      borderRadius: 12,
                      background:
                        templateConfig.layout === layout.key
                          ? "#ecebff"
                          : "#f6f6fa",
                      boxShadow:
                        templateConfig.layout === layout.key
                          ? "0 2px 12px #5B3EFF22"
                          : "none",
                      padding: 18,
                      width: 160,
                      cursor: "pointer",
                      transition: "all 0.2s",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                    }}
                    onClick={() =>
                      setTemplateConfig((cfg: TemplateConfig) => ({
                        ...cfg,
                        layout: layout.key,
                      }))
                    }
                  >
                    {/* Imagen del layout si existe */}
                    {layout.img && (
                      <img
                        src={layout.img}
                        alt={layout.name}
                        style={{
                          borderRadius: 8,
                          marginBottom: 12,
                          width: 120,
                          height: 80,
                          objectFit: "cover",
                        }}
                      />
                    )}
                    <div
                      style={{
                        fontWeight: "bold",
                        color: "#222",
                        marginBottom: 6,
                      }}
                    >
                      {layout.name}
                    </div>
                    <div
                      style={{
                        fontSize: 13,
                        color: "#666",
                        textAlign: "center",
                      }}
                    >
                      {layout.desc}
                    </div>
                    {templateConfig.layout === layout.key && (
                      <div
                        style={{
                          marginTop: 10,
                          color: "#5B3EFF",
                          fontWeight: "bold",
                          fontSize: 13,
                        }}
                      >
                        <span role="img" aria-label="check">
                          ✅
                        </span>{" "}
                        Seleccionado
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}
          {tab === "styles" && (
            <section>
              <h3 style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span role="img" aria-label="palette">
                  🎨
                </span>{" "}
                Estilos visuales
              </h3>
              <p>
                Personaliza colores, fuente y fondo del formulario. También
                puedes editar el CSS avanzado y subir imágenes/íconos.
              </p>
              <div style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>
                <div>
                  <label>
                    <span role="img" aria-label="fill">
                      🟦
                    </span>{" "}
                    Color de fondo:
                  </label>
                  <input
                    type="color"
                    value={templateConfig.bgColor}
                    style={{ marginLeft: 8 }}
                    onChange={(e) =>
                      setTemplateConfig((cfg: TemplateConfig) => ({
                        ...cfg,
                        bgColor: e.target.value,
                      }))
                    }
                  />
                </div>
                <div>
                  <label>
                    <span role="img" aria-label="font">
                      🔤
                    </span>{" "}
                    Color de texto:
                  </label>
                  <input
                    type="color"
                    value={templateConfig.textColor}
                    style={{ marginLeft: 8 }}
                    onChange={(e) =>
                      setTemplateConfig((cfg: TemplateConfig) => ({
                        ...cfg,
                        textColor: e.target.value,
                      }))
                    }
                  />
                </div>
                <div>
                  <label>
                    <span role="img" aria-label="type">
                      📝
                    </span>{" "}
                    Fuente:
                  </label>
                  <select
                    style={{ marginLeft: 8 }}
                    value={templateConfig.font}
                    onChange={(e) =>
                      setTemplateConfig((cfg: TemplateConfig) => ({
                        ...cfg,
                        font: e.target.value,
                      }))
                    }
                  >
                    <option value="Arial">Arial</option>
                    <option value="Roboto">Roboto</option>
                    <option value="Montserrat">Montserrat</option>
                    <option value="Courier New">Courier New</option>
                    <option value="Pixel">Pixel</option>
                  </select>
                </div>
              </div>
              {/* Drag & drop de imágenes/assets */}
              <div
                style={{
                  display: "flex",
                  gap: 32,
                  marginTop: 32,
                  flexWrap: "wrap",
                }}
              >
                {/* Favicon */}
                <div
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => handleAssetDrop(e, "favicon")}
                  style={{
                    border: "2px dashed #5B3EFF",
                    borderRadius: 10,
                    width: 100,
                    height: 100,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    background: "#f6f6fa",
                    cursor: "pointer",
                    flexDirection: "column",
                    position: "relative",
                  }}
                  title="Arrastra aquí tu favicon (.ico, .png)"
                >
                  {assets.favicon ? (
                    <>
                      <img
                        src={assets.favicon}
                        alt="Favicon"
                        style={{
                          maxWidth: 48,
                          maxHeight: 48,
                          marginBottom: 8,
                          borderRadius: 8,
                          boxShadow: "0 2px 8px #2222",
                        }}
                      />
                      <input
                        type="text"
                        value={assets.faviconName || ""}
                        onChange={(e) =>
                          handleRenameAsset("favicon", e.target.value)
                        }
                        placeholder="Nombre favicon"
                        style={{ width: "90%", fontSize: 12, marginBottom: 4 }}
                      />
                      <button
                        style={{
                          position: "absolute",
                          top: 6,
                          right: 6,
                          background: "#eee",
                          border: "none",
                          borderRadius: 6,
                          fontSize: 13,
                          cursor: "pointer",
                          padding: "2px 8px",
                        }}
                        title="Eliminar favicon"
                        onClick={() => handleRemoveAsset("favicon")}
                      >
                        🗑️
                      </button>
                    </>
                  ) : (
                    <span style={{ color: "#888", fontSize: 14 }}>
                      Arrastra favicon aquí
                    </span>
                  )}
                  <span style={{ fontSize: 12, color: "#5B3EFF" }}>
                    Favicon
                  </span>
                </div>
                {/* Logo */}
                <div
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => handleAssetDrop(e, "logo")}
                  style={{
                    border: "2px dashed #5B3EFF",
                    borderRadius: 10,
                    width: 160,
                    height: 120,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    background: "#f6f6fa",
                    cursor: "pointer",
                    flexDirection: "column",
                    position: "relative",
                  }}
                  title="Arrastra aquí tu logo"
                >
                  {assets.logo ? (
                    <>
                      <img
                        src={assets.logo}
                        alt="Logo"
                        style={{
                          maxWidth: 120,
                          maxHeight: 80,
                          marginBottom: 8,
                        }}
                      />
                      <input
                        type="text"
                        value={assets.logoName || ""}
                        onChange={(e) =>
                          handleRenameAsset("logo", e.target.value)
                        }
                        placeholder="Nombre del logo"
                        style={{ width: "90%", fontSize: 13, marginBottom: 4 }}
                      />
                      <button
                        style={{
                          position: "absolute",
                          top: 6,
                          right: 6,
                          background: "#eee",
                          border: "none",
                          borderRadius: 6,
                          fontSize: 14,
                          cursor: "pointer",
                          padding: "2px 8px",
                        }}
                        title="Eliminar logo"
                        onClick={() => handleRemoveAsset("logo")}
                      >
                        🗑️
                      </button>
                    </>
                  ) : (
                    <span style={{ color: "#888", fontSize: 15 }}>
                      Arrastra tu logo aquí
                    </span>
                  )}
                  <span style={{ fontSize: 13, color: "#5B3EFF" }}>Logo</span>
                </div>
                <div
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => handleAssetDrop(e, "bg")}
                  style={{
                    border: "2px dashed #5B3EFF",
                    borderRadius: 10,
                    width: 160,
                    height: 120,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    background: "#f6f6fa",
                    cursor: "pointer",
                    flexDirection: "column",
                    position: "relative",
                  }}
                  title="Arrastra aquí tu fondo"
                >
                  {assets.bg ? (
                    <>
                      <img
                        src={assets.bg}
                        alt="Fondo"
                        style={{
                          maxWidth: 120,
                          maxHeight: 80,
                          marginBottom: 8,
                        }}
                      />
                      <input
                        type="text"
                        value={assets.bgName || ""}
                        onChange={(e) =>
                          handleRenameAsset("bg", e.target.value)
                        }
                        placeholder="Nombre del fondo"
                        style={{ width: "90%", fontSize: 13, marginBottom: 4 }}
                      />
                      <button
                        style={{
                          position: "absolute",
                          top: 6,
                          right: 6,
                          background: "#eee",
                          border: "none",
                          borderRadius: 6,
                          fontSize: 14,
                          cursor: "pointer",
                          padding: "2px 8px",
                        }}
                        title="Eliminar fondo"
                        onClick={() => handleRemoveAsset("bg")}
                      >
                        🗑️
                      </button>
                    </>
                  ) : (
                    <span style={{ color: "#888", fontSize: 15 }}>
                      Arrastra fondo aquí
                    </span>
                  )}
                  <span style={{ fontSize: 13, color: "#5B3EFF" }}>Fondo</span>
                </div>
                <div
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => handleAssetDrop(e, "icon")}
                  style={{
                    border: "2px dashed #5B3EFF",
                    borderRadius: 10,
                    width: 160,
                    minHeight: 120,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    background: "#f6f6fa",
                    cursor: "pointer",
                    flexDirection: "column",
                    position: "relative",
                  }}
                  title="Arrastra aquí iconos"
                >
                  {assets.icons && assets.icons.length > 0 ? (
                    <div
                      style={{
                        display: "flex",
                        gap: 6,
                        flexWrap: "wrap",
                        justifyContent: "center",
                        width: "100%",
                      }}
                    >
                      {assets.icons.map((icon, idx) => (
                        <div
                          key={idx}
                          style={{
                            position: "relative",
                            display: "inline-block",
                            margin: 2,
                          }}
                        >
                          <img
                            src={icon.url}
                            alt={icon.name || `Icono ${idx + 1}`}
                            style={{ width: 32, height: 32, borderRadius: 6 }}
                          />
                          <input
                            type="text"
                            value={icon.name || ""}
                            onChange={(e) =>
                              handleRenameAsset("icon", e.target.value, idx)
                            }
                            placeholder="Nombre"
                            style={{ width: 32, fontSize: 11, marginTop: 2 }}
                          />
                          <button
                            style={{
                              position: "absolute",
                              top: 0,
                              right: 0,
                              background: "#eee",
                              border: "none",
                              borderRadius: 6,
                              fontSize: 12,
                              cursor: "pointer",
                              padding: "0 4px",
                            }}
                            title="Eliminar icono"
                            onClick={() => handleRemoveAsset("icon", idx)}
                          >
                            🗑️
                          </button>
                          {/* Reordenar iconos */}
                          <button
                            style={{
                              position: "absolute",
                              bottom: 0,
                              left: 0,
                              background: "#eee",
                              border: "none",
                              borderRadius: 6,
                              fontSize: 12,
                              cursor: "pointer",
                              padding: "0 4px",
                            }}
                            title="Mover izquierda"
                            disabled={idx === 0}
                            onClick={() => handleMoveIcon(idx, idx - 1)}
                          >
                            ⬅️
                          </button>
                          <button
                            style={{
                              position: "absolute",
                              bottom: 0,
                              right: 0,
                              background: "#eee",
                              border: "none",
                              borderRadius: 6,
                              fontSize: 12,
                              cursor: "pointer",
                              padding: "0 4px",
                            }}
                            title="Mover derecha"
                            disabled={idx === (assets.icons?.length || 1) - 1}
                            onClick={() => handleMoveIcon(idx, idx + 1)}
                          >
                            ➡️
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <span style={{ color: "#888", fontSize: 15 }}>
                      Arrastra iconos aquí
                    </span>
                  )}
                  <span style={{ fontSize: 13, color: "#5B3EFF" }}>Iconos</span>
                </div>
              </div>
              <div style={{ marginTop: 32 }}>
                <label
                  style={{
                    fontWeight: "bold",
                    marginBottom: 8,
                    display: "block",
                  }}
                >
                  CSS avanzado:
                </label>
                <MonacoEditor
                  height="220px"
                  defaultLanguage="css"
                  theme="vs-dark"
                  value={templateConfig.customCss || ""}
                  options={{ fontSize: 14, minimap: { enabled: false } }}
                  onChange={(value) =>
                    setTemplateConfig((cfg: TemplateConfig) => ({
                      ...cfg,
                      customCss: value || "",
                    }))
                  }
                />
                <div style={{ fontSize: 13, color: "#888", marginTop: 6 }}>
                  Puedes escribir reglas CSS personalizadas para el formulario.
                </div>
              </div>
            </section>
          )}
          {tab === "texts" && (
            <section>
              <h3>Textos principales</h3>
              <p>
                Edita los textos principales y placeholders de cada campo
                detectado. También puedes editar los textos globales por idioma
                y gestionar automáticamente los placeholders{" "}
                <code>{"{MSGxx}"}</code>.
              </p>
              <div style={{ marginBottom: 24 }}>
                <h4 style={{ marginBottom: 8 }}>Textos globales por idioma</h4>
                {LANGS.map((l) => (
                  <div
                    key={l.code}
                    style={{
                      marginBottom: 12,
                      padding: 8,
                      background: l.code === lang ? "#ecebff" : "#f6f6fa",
                      borderRadius: 8,
                    }}
                  >
                    <b>{l.label}</b>
                    <div
                      style={{
                        display: "flex",
                        gap: 16,
                        flexWrap: "wrap",
                        marginTop: 8,
                      }}
                    >
                      {Object.entries({
                        payButton: "",
                        cardLabel: "",
                        msg48: "",
                        msg46: "",
                        msg47: "",
                        msg19: "",
                        msg50: "",
                        payTitle: "",
                        paySuccessText: "",
                        payFailText: "",
                        payError: "",
                      }).map(([key]) => (
                        <div key={key} style={{ minWidth: 180 }}>
                          <label style={{ fontSize: 13 }}>{key}:</label>
                          <input
                            type="text"
                            value={
                              i18next.getResource(l.code, "translation", key) ||
                              ""
                            }
                            onChange={(e) => {
                              i18next.addResource(
                                l.code,
                                "translation",
                                key,
                                e.target.value
                              );
                              if (l.code === lang) {
                                setTemplateConfig((cfg) => ({
                                  ...cfg,
                                  [key]: e.target.value,
                                }));
                              }
                            }}
                            style={{
                              width: "100%",
                              fontSize: 13,
                              marginBottom: 4,
                            }}
                          />
                        </div>
                      ))}
                    </div>
                    {/* Gestión automática de placeholders {MSGxx} */}
                    <div style={{ marginTop: 12 }}>
                      <h5 style={{ fontSize: 14, marginBottom: 4 }}>
                        Placeholders detectados <code>{"{MSGxx}"}</code>:
                      </h5>
                      {Object.entries(
                        i18next.store.data[l.code]?.translation || {}
                      )
                        .filter(
                          ([k, v]) =>
                            typeof v === "string" && /\{MSG\d+\}/.test(v)
                        )
                        .map(([k, v]) => {
                          const matches = v.match(/\{MSG\d+\}/g) || [];
                          return matches.map((ph: string, idx: number) => (
                            <div key={ph + idx} style={{ marginBottom: 4 }}>
                              <label style={{ fontSize: 13 }}>{ph}:</label>
                              <input
                                type="text"
                                value={
                                  i18next.getResource(
                                    l.code,
                                    "translation",
                                    ph
                                  ) || ""
                                }
                                onChange={(e) => {
                                  i18next.addResource(
                                    l.code,
                                    "translation",
                                    ph,
                                    e.target.value
                                  );
                                }}
                                placeholder={`Traducción para ${ph}`}
                                style={{
                                  width: "60%",
                                  fontSize: 13,
                                  marginLeft: 8,
                                }}
                              />
                            </div>
                          ));
                        })}
                    </div>
                  </div>
                ))}
              </div>
              <h4 style={{ marginBottom: 8 }}>Textos de campos</h4>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 24 }}>
                {(templateModel?.fields || []).map((field) => (
                  <div key={field.key} style={{ minWidth: 220 }}>
                    <label>
                      {field.label || field.key}:
                      <span
                        style={{ color: "#888", fontSize: 12, marginLeft: 6 }}
                      >
                        ({field.type})
                      </span>
                    </label>
                    <input
                      type="text"
                      value={field.label || ""}
                      onChange={(e) => {
                        setTemplateModel((model) => {
                          if (!model) return model;
                          return {
                            ...model,
                            fields: model.fields.map((f) =>
                              f.key === field.key
                                ? { ...f, label: e.target.value }
                                : f
                            ),
                          };
                        });
                      }}
                      placeholder="Label/Texto principal"
                      style={{ marginBottom: 6, width: "100%" }}
                    />
                    {/* Gestión automática de placeholders {MSGxx} en label */}
                    {field.label && /\{MSG\d+\}/.test(field.label) && (
                      <div style={{ marginBottom: 6 }}>
                        {(field.label.match(/\{MSG\d+\}/g) || []).map(
                          (ph: string, idx: number) => (
                            <div key={ph + idx} style={{ marginBottom: 4 }}>
                              <label style={{ fontSize: 13 }}>{ph}:</label>
                              <input
                                type="text"
                                value={
                                  i18next.getResource(
                                    lang,
                                    "translation",
                                    ph
                                  ) || ""
                                }
                                onChange={(e) => {
                                  i18next.addResource(
                                    lang,
                                    "translation",
                                    ph,
                                    e.target.value
                                  );
                                }}
                                placeholder={`Traducción para ${ph}`}
                                style={{
                                  width: "60%",
                                  fontSize: 13,
                                  marginLeft: 8,
                                }}
                              />
                            </div>
                          )
                        )}
                      </div>
                    )}
                    {field.placeholder !== undefined && (
                      <input
                        type="text"
                        value={field.placeholder || ""}
                        onChange={(e) => {
                          setTemplateModel((model) => {
                            if (!model) return model;
                            return {
                              ...model,
                              fields: model.fields.map((f) =>
                                f.key === field.key
                                  ? { ...f, placeholder: e.target.value }
                                  : f
                              ),
                            };
                          });
                        }}
                        placeholder="Placeholder"
                        style={{ marginBottom: 6, width: "100%" }}
                      />
                    )}
                    {/* Gestión automática de placeholders {MSGxx} en placeholder */}
                    {field.placeholder &&
                      /\{MSG\d+\}/.test(field.placeholder) && (
                        <div style={{ marginBottom: 6 }}>
                          {(field.placeholder.match(/\{MSG\d+\}/g) || []).map(
                            (ph: string, idx: number) => (
                              <div key={ph + idx} style={{ marginBottom: 4 }}>
                                <label style={{ fontSize: 13 }}>{ph}:</label>
                                <input
                                  type="text"
                                  value={
                                    i18next.getResource(
                                      lang,
                                      "translation",
                                      ph
                                    ) || ""
                                  }
                                  onChange={(e) => {
                                    i18next.addResource(
                                      lang,
                                      "translation",
                                      ph,
                                      e.target.value
                                    );
                                  }}
                                  placeholder={`Traducción para ${ph}`}
                                  style={{
                                    width: "60%",
                                    fontSize: 13,
                                    marginLeft: 8,
                                  }}
                                />
                              </div>
                            )
                          )}
                        </div>
                      )}
                  </div>
                ))}
              </div>
            </section>
          )}
          {tab === "mensajes" && (
            <section>
              <h3 style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span role="img" aria-label="comment">
                  💬
                </span>{" "}
                Mensajes y validaciones
              </h3>
              <p>
                Personaliza los mensajes de ayuda, error y validación de cada
                campo detectado.
              </p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 24 }}>
                {(templateModel?.fields || []).map((field) => (
                  <div key={field.key} style={{ minWidth: 220 }}>
                    <label>
                      {field.label || field.key}:
                      <span
                        style={{ color: "#888", fontSize: 12, marginLeft: 6 }}
                      >
                        ({field.type})
                      </span>
                    </label>
                    <input
                      type="text"
                      value={field.validations?.msg || ""}
                      onChange={(e) => {
                        setTemplateModel((model) => {
                          if (!model) return model;
                          return {
                            ...model,
                            fields: model.fields.map((f) =>
                              f.key === field.key
                                ? {
                                    ...f,
                                    validations: {
                                      ...f.validations,
                                      msg: e.target.value,
                                    },
                                  }
                                : f
                            ),
                          };
                        });
                      }}
                      placeholder="Mensaje personalizado de validación"
                      style={{ marginBottom: 6, width: "100%" }}
                    />
                  </div>
                ))}
              </div>
            </section>
          )}
          {tab === "logic" && (
            <section>
              <h3>Lógica y callbacks JS</h3>
              <p>
                Define la lógica personalizada y los callbacks para el
                formulario exportado.
                <br />
                Puedes usar funciones como <b>onSubmit</b>, <b>onSuccess</b>,{" "}
                <b>onError</b>.<br />
                Ejemplo:
                <pre
                  style={{
                    background: "#f6f6fa",
                    padding: 8,
                    borderRadius: 6,
                    fontSize: 13,
                  }}
                >
                  {`function onSuccess() {\n  alert('Pago realizado correctamente');\n}\nfunction onError() {\n  alert('Error en el pago');\n}\n// Puedes acceder a los valores con document.getElementById('card').value, etc.`}
                </pre>
              </p>
              <div style={{ marginTop: 24 }}>
                <label
                  style={{
                    fontWeight: "bold",
                    marginBottom: 8,
                    display: "block",
                  }}
                >
                  JS avanzado (callbacks, lógica):
                </label>
                <MonacoEditor
                  height="220px"
                  defaultLanguage="javascript"
                  theme="vs-dark"
                  value={templateConfig.logic || ""}
                  options={{ fontSize: 14, minimap: { enabled: false } }}
                  onChange={(value) =>
                    setTemplateConfig((cfg: TemplateConfig) => ({
                      ...cfg,
                      logic: value || "",
                    }))
                  }
                />
                <div style={{ fontSize: 13, color: "#888", marginTop: 6 }}>
                  Puedes escribir funciones JS personalizadas para el formulario
                  (onSubmit, onSuccess, onError, etc).
                </div>
              </div>
              <hr style={{ margin: "32px 0" }} />
              <h4>Lógica visual avanzada</h4>
              <p>
                Define condiciones para mostrar/ocultar campos según valores de
                otros campos.
                <br />
                Ejemplo: <code>country == 'España'</code> para mostrar el campo
                DNI solo si el país es España.
              </p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 24 }}>
                {(templateModel?.fields || []).map((field) => (
                  <div key={field.key} style={{ minWidth: 220 }}>
                    <label>
                      Condición de visibilidad para{" "}
                      <b>{field.label || field.key}</b>:
                    </label>
                    <input
                      type="text"
                      placeholder={`Ej: country == 'España'`}
                      value={templateConfig.fieldVisibility?.[field.key] || ""}
                      onChange={(e) =>
                        setTemplateConfig((cfg: TemplateConfig) => ({
                          ...cfg,
                          fieldVisibility: {
                            ...cfg.fieldVisibility,
                            [field.key]: e.target.value,
                          },
                        }))
                      }
                      style={{ marginBottom: 6, width: "100%" }}
                    />
                  </div>
                ))}
              </div>
            </section>
          )}
          {tab === "preview" && (
            <section>
              <h3>Vista Previa en tiempo real</h3>
              <p>Así se verá tu formulario procesado:</p>
              <div
                style={{
                  width: "100%",
                  minHeight: 400,
                  background: "#fff",
                  border: "1px solid #ddd",
                  borderRadius: 8,
                  padding: 24,
                }}
              >
                {renderPreviewForm(templateConfig, templateModel, {
                  ...assets,
                  icons: assets.icons?.map((icon) => icon.url),
                })}
              </div>
            </section>
          )}
          {tab === "export" && (
            <section>
              <h3>Exportar</h3>
              <p>Descarga tu template procesada como ZIP parametrizado.</p>
              {/* Validación de traducciones faltantes */}
              {(() => {
                const missing: { lang: string; key: string }[] = [];
                const allKeys = getAllTranslatableKeys(
                  templateConfig,
                  templateModel
                );
                LANGS.forEach((l) => {
                  allKeys.forEach((key) => {
                    const val = i18next.getResource(l.code, "translation", key);
                    if (!val || val.trim() === "") {
                      missing.push({ lang: l.label, key });
                    }
                  });
                });
                if (missing.length > 0) {
                  return (
                    <div
                      style={{
                        background: "#fff3f3",
                        border: "1px solid #ffb3b3",
                        color: "#c00",
                        borderRadius: 8,
                        padding: 16,
                        marginBottom: 18,
                      }}
                    >
                      <b>Faltan traducciones:</b>
                      <ul style={{ marginTop: 8 }}>
                        {missing.map((m, idx) => (
                          <li key={idx}>
                            <b>{m.lang}:</b> <code>{m.key}</code>
                          </li>
                        ))}
                      </ul>
                      <div style={{ marginTop: 8, fontSize: 14 }}>
                        Completa todas las traducciones antes de exportar.
                      </div>
                    </div>
                  );
                }
                return null;
              })()}
              {(() => {
                const missing: { lang: string; key: string }[] = [];
                const allKeys = getAllTranslatableKeys(
                  templateConfig,
                  templateModel
                );
                LANGS.forEach((l) => {
                  allKeys.forEach((key) => {
                    const val = i18next.getResource(l.code, "translation", key);
                    if (!val || val.trim() === "") {
                      missing.push({ lang: l.label, key });
                    }
                  });
                });
                return (
                  <button
                    style={{
                      padding: "12px 32px",
                      background: missing.length > 0 ? "#ccc" : "#5B3EFF",
                      color: missing.length > 0 ? "#888" : "#fff",
                      border: "none",
                      borderRadius: 8,
                      fontSize: 18,
                      cursor: missing.length > 0 ? "not-allowed" : "pointer",
                    }}
                    disabled={missing.length > 0}
                    onClick={async () => {
                      const html = generatePreviewHtml(templateConfig, {
                        ...assets,
                        icons: assets.icons?.map((icon) => icon.url),
                      });
                      // Extraer todas las traducciones de i18next
                      const translations: Record<string, any> = {};
                      LANGS.forEach((l) => {
                        translations[l.code] =
                          i18next.store.data[l.code]?.translation || {};
                      });
                      await exportTemplateZip(html, translations, assets, {});
                    }}
                  >
                    Descargar ZIP
                  </button>
                );
              })()}
              <div
                style={{
                  marginTop: 16,
                  marginBottom: 8,
                  color: "#444",
                  fontSize: 15,
                }}
              >
                <span role="img" aria-label="info">
                  ℹ️
                </span>{" "}
                Si necesitas el archivo en formato RAR, puedes convertir el ZIP
                descargado usando WinRAR, Unarchiver o cualquier software de
                compresión.
              </div>
              <button
                style={{
                  padding: "8px 18px",
                  background: "#eee",
                  color: "#444",
                  border: "none",
                  borderRadius: 8,
                  fontSize: 16,
                  cursor: "pointer",
                  marginLeft: 0,
                  marginTop: 8,
                }}
                onClick={restoreDefaults}
              >
                Restaurar valores por defecto
              </button>
            </section>
          )}
          {tab === "validaciones" && (
            <section>
              <h3 style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span role="img" aria-label="shield">
                  🛡️
                </span>{" "}
                Validaciones avanzadas
              </h3>
              <p>Configura reglas de validación para cada campo detectado.</p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 24 }}>
                {(templateModel?.fields || []).map((field) => (
                  <div key={field.key} style={{ minWidth: 220 }}>
                    <label>{field.label || field.key}:</label>
                    <input
                      type="text"
                      placeholder="Regex (ej: ^[0-9]{16}$)"
                      value={field.validations?.regex || ""}
                      onChange={(e) => {
                        setTemplateModel((model) => {
                          if (!model) return model;
                          return {
                            ...model,
                            fields: model.fields.map((f) =>
                              f.key === field.key
                                ? {
                                    ...f,
                                    validations: {
                                      ...f.validations,
                                      regex: e.target.value,
                                    },
                                  }
                                : f
                            ),
                          };
                        });
                      }}
                      style={{ marginBottom: 6, width: "100%" }}
                    />
                    <input
                      type="number"
                      placeholder="Longitud mínima"
                      value={field.validations?.min || ""}
                      onChange={(e) => {
                        setTemplateModel((model) => {
                          if (!model) return model;
                          return {
                            ...model,
                            fields: model.fields.map((f) =>
                              f.key === field.key
                                ? {
                                    ...f,
                                    validations: {
                                      ...f.validations,
                                      min: Number(e.target.value),
                                    },
                                  }
                                : f
                            ),
                          };
                        });
                      }}
                      style={{ marginBottom: 6, width: "100%" }}
                    />
                    {field.type === "select" && (
                      <div style={{ marginTop: 8 }}>
                        <label>Opciones:</label>
                        {(field.options || []).map((opt, idx) => (
                          <input
                            key={idx}
                            type="text"
                            value={opt}
                            onChange={(e) => {
                              setTemplateModel((model) => {
                                if (!model) return model;
                                return {
                                  ...model,
                                  fields: model.fields.map((f) =>
                                    f.key === field.key
                                      ? {
                                          ...f,
                                          options: f.options?.map((o, i) =>
                                            i === idx ? e.target.value : o
                                          ),
                                        }
                                      : f
                                  ),
                                };
                              });
                            }}
                            style={{ marginBottom: 6, width: "100%" }}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
};

export default TefpayTemplateEditorModal;
