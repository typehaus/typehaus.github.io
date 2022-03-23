function getTabs(el) {
  return Array.from(
  el.querySelectorAll('[role="tablist"] [role="tab"]')).
  filter(
  tab => tab instanceof HTMLElement && tab.closest(el.tagName) === el);

}
class TabContainerElement extends HTMLElement {
  constructor() {
    super();
    var that = this;
    window.addEventListener("keydown", event => {
      let target = event.target;
      let code = event.code.replace(/[^0-9]/g, "");
      var that = that || document.querySelector('[role="tablist"]');
      if (!that) return;
      if (code.match(/[1-9]/) && event.ctrlKey) {
        const tabs = getTabs(that);
        let currentIndex = tabs.findIndex((tab) =>
        tab.matches('[aria-selected="true"]'));

        currentIndex =
        currentIndex < 0 ?
        tabs.length - 1 :
        currentIndex > tabs.length - 1 ?
        0 :
        currentIndex;
        selectTab(that, currentIndex);
        event.preventDefault();
        try {
          selectTab(that, code - 1);
        } catch {}
        return;
      }
    });
    this.addEventListener("keydown", event => {
      const target = event.target;
      const code = event.code.replace(/[^0-9]/g, "");
      if (!(target instanceof HTMLElement)) return;
      if (target.closest(this.tagName) !== this) return;
      if (
      target.getAttribute("role") !== "tab" &&
      !target.closest('[role="tablist"]'))

      return;
      const tabs = getTabs(this);
      const currentIndex = tabs.findIndex((tab) =>
      tab.matches('[aria-selected="true"]'));

      let index = currentIndex;

      if (code.match(/[0-9]/) && event.ctrlKey) {
        event.preventDefault();
        try {
          selectTab(this, code - 1);
        } catch {
          selectTab(this, currentIndex);
        }
        return;
      }
      if (
      ~["ArrowRight", "ArrowDown", "Enter", "Return"].indexOf(
      event.key))

      {
        index = currentIndex + 1;
      } else if (
      ~["ArrowLeft", "ArrowUp", "Backspace", "Delete"].indexOf(
      event.key))

      {
        index = currentIndex - 1;
        if (index < 0) index = tabs.length - 1;
      } else if (event.code === "Home") {
        index = 0;
      } else if (event.code === "End") {
        index = tabs.length - 1;
      } else {
        return;
      }
      selectTab(
      this,
      index < 0 ? tabs.length - 1 : index < tabs.length ? index : 0);

      event.preventDefault();
    });
    this.addEventListener("click", event => {
      const tabs = getTabs(this);
      if (!(event.target instanceof Element)) return;
      if (event.target.closest(this.tagName) !== this) return;
      const tab = event.target.closest('[role="tab"]');
      if (
      !(tab instanceof HTMLElement) ||
      !tab.closest('[role="tablist"]'))

      return;
      const index = tabs.indexOf(tab);
      selectTab(this, index);
    });
  }
  connectedCallback() {
    for (const tab of getTabs(this)) {
      if (!tab.hasAttribute("aria-selected")) {
        tab.setAttribute("aria-selected", "false");
      }
      if (!tab.hasAttribute("tabindex")) {
        if (tab.getAttribute("aria-selected") === "true") {
          tab.setAttribute("tabindex", "0");
        } else {
          tab.setAttribute("tabindex", "-1");
        }
      }
    }
  }}

function selectTab(tabContainer, index) {
  const tabs = getTabs(tabContainer);
  const panels = Array.from(
  tabContainer.querySelectorAll('[role="tabpanel"]')).
  filter(panel => panel.closest(tabContainer.tagName) === tabContainer);
  const selectedTab = tabs[index];
  const selectedPanel = panels[index];
  const cancelled = !tabContainer.dispatchEvent(
  new CustomEvent("tab-container-change", {
    bubbles: true,
    cancelable: true,
    detail: { relatedTarget: selectedPanel } }));


  if (cancelled) return;
  for (const tab of tabs) {
    tab.setAttribute("aria-selected", "false");
    tab.setAttribute("tabindex", "-1");
  }
  for (const panel of panels) {
    panel.hidden = true;
    if (
    !panel.hasAttribute("tabindex") &&
    !panel.hasAttribute("data-tab-container-no-tabstop"))
    {
      panel.setAttribute("tabindex", "0");
    }
  }
  selectedTab.setAttribute("aria-selected", "true");
  selectedTab.setAttribute("tabindex", "0");
  selectedTab.focus();
  selectedPanel.hidden = false;
  tabContainer.dispatchEvent(
  new CustomEvent("tab-container-changed", {
    bubbles: true,
    detail: { relatedTarget: selectedPanel } }));


}
if (!window.customElements.get("tab-container")) {
  window.TabContainerElement = TabContainerElement;
  window.customElements.define("tab-container", TabContainerElement);
}