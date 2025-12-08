function initThemeToggle() {
  const toggle = document.getElementById('themeToggle');
  if (!toggle) return;

  toggle.addEventListener("change", () => {
    if (toggle.checked) {
      document.body.classList.add("bg-gray-900", "text-gray-100");
      document.body.classList.remove("bg-gray-50", "text-gray-900");
    } else {
      document.body.classList.add("bg-gray-50", "text-gray-900");
      document.body.classList.remove("bg-gray-900", "text-gray-100");
    }
  });
}

export function init() {
  initThemeToggle();
}
