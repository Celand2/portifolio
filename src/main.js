import "./style.css";
const root = document.documentElement;
const toggle = document.querySelector("[data-theme-toggle]");
const applyTheme = (theme) => {
  root.classList.toggle("dark", theme === "dark");
  localStorage.setItem("theme", theme);
};
applyTheme(localStorage.getItem("theme") || "light");
toggle?.addEventListener("click", () =>
  applyTheme(root.classList.contains("dark") ? "light" : "dark"),
);
const menu = document.querySelector("[data-mobile-menu]");
const menuToggle = document.querySelector("[data-menu-toggle]");
const closeMenu = () => {
  menu?.classList.add("hidden");
  menu?.classList.remove("flex", "is-open");
  menuToggle?.setAttribute("aria-expanded", "false");
  document.body.classList.remove("menu-open");
};
const openMenu = () => {
  menu?.classList.remove("hidden");
  menu?.classList.add("flex", "is-open");
  menuToggle?.setAttribute("aria-expanded", "true");
  document.body.classList.add("menu-open");
};
menuToggle?.addEventListener("click", () =>
  menu?.classList.contains("is-open") ? closeMenu() : openMenu(),
);
document.querySelector("[data-menu-close]")?.addEventListener("click", closeMenu);
menu?.addEventListener("click", (event) => {
  if (event.target === menu || event.target.closest("a")) closeMenu();
});
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") closeMenu();
});
document.querySelectorAll("[data-filter]").forEach((button) =>
  button.addEventListener("click", () => {
    document
      .querySelectorAll("[data-filter]")
      .forEach((item) => item.classList.remove("bg-[#0047AB]", "text-white"));
    button.classList.add("bg-[#0047AB]", "text-white");
    document.querySelectorAll("[data-project]").forEach((project) => {
      project.hidden =
        button.dataset.filter !== "all" &&
        project.dataset.project !== button.dataset.filter;
    });
  }),
);
document.querySelector("#contact-form")?.addEventListener("submit", (event) => {
  event.preventDefault();
  document.querySelector("[data-form-status]").textContent =
    "Merci ! Votre message a bien été préparé.";
  event.currentTarget.reset();
});
document
  .querySelectorAll("[data-year]")
  .forEach((item) => (item.textContent = new Date().getFullYear()));
