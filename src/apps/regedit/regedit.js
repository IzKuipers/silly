import { AppProcess } from "../../js/apps/process.js";
import { getJsonHierarchy } from "../../js/hierarchy.js";
import { Store } from "../../js/store.js";

export default class RegEditProcess extends AppProcess {
  hierarchy = Store("");

  constructor(handler, pid, parentPid, app) {
    super(handler, pid, parentPid, app);
  }

  render() {
    this.treeElement = this.getElement("#directoryView", true);
    this.contentElement = this.getElement("#contentView", true);

    this.registry.store.subscribe(
      this.safe((v) => {
        this._treeView(v);
        this.updateContent();
      })
    );
  }

  _treeView(store) {
    const rootObjects = this.treeBranch(store, "");

    const rootBranch = document.createElement("div");
    const button = document.createElement("button");
    const indent = document.createElement("div");

    rootBranch.className = "branch expanded";
    indent.className = "indent";
    button.className = "expander";

    button.innerText = "Registry";
    rootBranch.append(button, indent);
    indent.append(...rootObjects);

    this.treeElement.innerHTML = "";
    this.treeElement.append(rootBranch);
  }

  select(hierarchy) {
    this.hierarchy.set(hierarchy);
    this.updateContent();
  }

  treeBranch(object, path) {
    const elements = [];

    for (const [key, value] of Object.entries(object)) {
      const isLeaf = typeof value !== "object" || value === null;

      if (isLeaf) continue;

      const branch = document.createElement("div");
      const button = document.createElement("button");
      const indent = document.createElement("div");

      branch.className = "branch";
      indent.className = "indent";
      button.className = "expander";

      const currentPath = path ? `${path}.${key}` : key;

      // Add parent branch first, then sub-items
      button.innerText = key;
      button.addEventListener("click", () => {
        if (
          currentPath === this.hierarchy.get() &&
          indent.childElementCount > 0
        )
          branch.classList.toggle("expanded");
        else {
          branch.classList.add("expanded");
        }

        this.select(currentPath);
      });

      this.hierarchy.subscribe((v) => {
        if (currentPath == v) button.classList.add("selected");
        else button.classList.remove("selected");
      });

      branch.append(button);

      // If the value is an object, recursively build the tree
      if (!isLeaf) {
        const subItems = this.treeBranch(value, currentPath);
        indent.append(...subItems); // Sub-items go inside indent
      }

      // Append indent after the branch so that the children are below the parent
      branch.append(indent);
      elements.unshift(branch); // Use unshift to reverse the order, placing the parent after children
    }

    return elements;
  }

  updateContent() {
    this.contentElement.innerHTML = "";

    const hierarchy = this.hierarchy.get();
    const registry = this.registry.store.get();
    const object = hierarchy ? getJsonHierarchy(registry, hierarchy) : registry;

    for (const [key, element] of Object.entries(object)) {
      if (!element && element !== false && element !== 0) continue;

      const row = document.createElement("tr");

      const name = document.createElement("td");
      const value = document.createElement("td");
      const valuelength = document.createElement("td");
      const type = document.createElement("td");

      name.className = "name";
      value.className = "value";
      valuelength.className = "value-length";
      type.className = "type";

      name.innerText = key;
      value.innerText = JSON.stringify(element);
      valuelength.innerText = `${JSON.stringify(element).length} bytes`;
      type.innerText = `REG_${(typeof element).toUpperCase()}`;

      row.append(name, value, valuelength, type);

      this.contentElement.append(row);
    }
  }
}
