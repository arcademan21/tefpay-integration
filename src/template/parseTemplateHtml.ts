// Motor de abstracción: parser HTML base a modelo editable

export type TemplateField = {
  key: string;
  type: string;
  label: string;
  required?: boolean;
  placeholder?: string;
  validations?: {
    regex?: string;
    min?: number;
    max?: number;
    msg?: string;
  };
  options?: string[]; // Para selects
  style?: string; // CSS inline
  callbackJs?: string; // Callback JS personalizado
};

export type TemplateModel = {
  fields: TemplateField[];
  layout?: string;
  styles?: Record<string, any>;
  texts?: Record<string, string>;
};

/**
 * Convierte el HTML base de la template en un modelo editable (JSON)
 * @param html HTML base del formulario
 * @returns TemplateModel
 */
export function parseTemplateHtml(html: string): TemplateModel {
  const dom = document.createElement("div");
  dom.innerHTML = html;
  const fields: TemplateField[] = [];

  // Inputs
  Array.from(dom.querySelectorAll("input")).forEach((input) => {
    fields.push({
      key: input.id || input.name || "",
      type: input.type || "text",
      label:
        input.getAttribute("label") || input.getAttribute("placeholder") || "",
      required: input.hasAttribute("required"),
      placeholder: input.getAttribute("placeholder") || "",
      validations: {
        regex: input.getAttribute("pattern") || undefined,
        min: input.getAttribute("min")
          ? Number(input.getAttribute("min"))
          : undefined,
        max: input.getAttribute("max")
          ? Number(input.getAttribute("max"))
          : undefined,
        msg: input.getAttribute("data-msg") || undefined,
      },
    });
  });

  // Selects
  Array.from(dom.querySelectorAll("select")).forEach((select) => {
    fields.push({
      key: select.id || select.name || "",
      type: "select",
      label: select.getAttribute("label") || "",
      required: select.hasAttribute("required"),
      options: Array.from(select.querySelectorAll("option")).map(
        (opt) => opt.textContent || ""
      ),
      validations: {},
    });
  });

  // Textareas
  Array.from(dom.querySelectorAll("textarea")).forEach((ta) => {
    fields.push({
      key: ta.id || ta.name || "",
      type: "textarea",
      label: ta.getAttribute("label") || ta.getAttribute("placeholder") || "",
      required: ta.hasAttribute("required"),
      placeholder: ta.getAttribute("placeholder") || "",
      validations: {
        min: ta.getAttribute("minlength")
          ? Number(ta.getAttribute("minlength"))
          : undefined,
        max: ta.getAttribute("maxlength")
          ? Number(ta.getAttribute("maxlength"))
          : undefined,
        msg: ta.getAttribute("data-msg") || undefined,
      },
    });
  });

  // Puedes extraer más info: layout, estilos, textos...
  return {
    fields,
    layout: "clásico",
    styles: {},
    texts: {},
  };
}
