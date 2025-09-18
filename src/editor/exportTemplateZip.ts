// Utilidad para exportar ZIP parametrizado desde el editor visual Tefpay
import JSZip from "jszip";
import { saveAs } from "file-saver";

export async function exportTemplateZip(
  templateHtml: string,
  assets: Record<string, string>
) {
  const zip = new JSZip();
  zip.file("00V0000000.html", templateHtml);
  // Agrega los assets parametrizados
  Object.entries(assets).forEach(([path, content]) => {
    zip.file(path, content);
  });
  const blob = await zip.generateAsync({ type: "blob" });
  saveAs(blob, "tefpay-template.zip");
}
