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
document
  .querySelector("#contact-form")
  ?.addEventListener("submit", async (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    const status = form.querySelector("[data-form-status]");
    const submitButton = form.querySelector('button[type="submit"]');
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

    status.classList.remove(
      "text-emerald-600",
      "text-amber-700",
      "text-red-600",
    );

    if (!supabaseUrl || !supabaseAnonKey) {
      status.textContent =
        "Le formulaire n’est pas encore configuré. Contactez-moi directement par email.";
      status.classList.add("text-red-600");
      return;
    }

    const originalLabel = submitButton.textContent;
    submitButton.disabled = true;
    submitButton.textContent = "Envoi en cours...";
    form.setAttribute("aria-busy", "true");
    status.textContent = "";

    try {
      const response = await fetch(
        `${supabaseUrl.replace(/\/$/, "")}/functions/v1/contact`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            apikey: supabaseAnonKey,
            Authorization: `Bearer ${supabaseAnonKey}`,
          },
          body: JSON.stringify(
            Object.fromEntries(new FormData(form).entries()),
          ),
        },
      );
      let result;
      try {
        result = await response.json();
      } catch {
        throw new Error("La réponse du serveur est invalide. Réessayez plus tard.");
      }

      if (
        !response.ok ||
        result?.ok !== true ||
        typeof result.notificationSent !== "boolean"
      ) {
        throw new Error(result?.error || "Impossible d’envoyer votre message.");
      }

      form.reset();
      if (result.notificationSent === false) {
        status.textContent =
          "Votre message a été enregistré, mais la notification email n’a pas pu être envoyée. Contactez-moi directement par email si nécessaire.";
        status.classList.add("text-amber-700");
      } else {
        status.textContent = "Merci, votre message a bien été envoyé.";
        status.classList.add("text-emerald-600");
      }
    } catch (error) {
      status.textContent =
        error instanceof Error
          ? error.message
          : "Une erreur est survenue. Veuillez réessayer.";
      status.classList.add("text-red-600");
    } finally {
      submitButton.disabled = false;
      submitButton.textContent = originalLabel;
      form.removeAttribute("aria-busy");
    }
  });
document
  .querySelectorAll("[data-year]")
  .forEach((item) => (item.textContent = new Date().getFullYear()));
