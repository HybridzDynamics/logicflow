export function createPalette(list, definitions, categoryFor) {
  list.replaceChildren();
  const groups = new Map();
  for (const [type, definition] of Object.entries(definitions)) {
    const category = categoryFor(type);
    if (!groups.has(category)) groups.set(category, []);
    groups.get(category).push([type, definition]);
  }
  for (const [category, items] of groups) {
    const section = document.createElement("section"); section.className = "component-group";
    const heading = document.createElement("h3"); heading.textContent = category;
    const buttons = document.createElement("div"); buttons.className = "component-buttons";
    for (const [type, definition] of items) {
      const button = document.createElement("button");
      button.type = "button"; button.className = "component-button"; button.dataset.componentType = type; button.draggable = true;
      button.title = `Add ${definition.label}`;
      const glyph = document.createElement("span"); glyph.className = "component-glyph"; glyph.setAttribute("aria-hidden", "true"); glyph.textContent = definition.label.slice(0, 2).toUpperCase();
      const label = document.createElement("span"); label.textContent = definition.label;
      button.append(glyph, label); buttons.append(button);
    }
    section.append(heading, buttons); list.append(section);
  }
}