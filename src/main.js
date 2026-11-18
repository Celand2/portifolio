import "./style.css";
const root = document.documentElement;
const toggle = document.querySelector("[data-theme-toggle]");
const themeIcon = document.querySelector("[data-theme-icon]");
const applyTheme = (theme) => {
  const isDark = theme === "dark";
  root.classList.toggle("dark", isDark);
  if (themeIcon) {
    themeIcon.src = isDark ? "./icones/lune.svg" : "./icones/soleil.svg";
    toggle?.setAttribute(
      "aria-label",
      isDark ? "Activer le mode jour" : "Activer le mode nuit",
    );
    toggle?.setAttribute(
      "title",
      isDark ? "Activer le mode jour" : "Activer le mode nuit",
    );
  }
  try {
    localStorage.setItem("theme", theme);
  } catch (error) {
    console.error("Impossible d’enregistrer le thème choisi.", error);
  }
};
let savedTheme = "light";
try {
  savedTheme = localStorage.getItem("theme") || "light";
} catch (error) {
  console.error("Impossible de lire le thème enregistré.", error);
}
applyTheme(savedTheme);
toggle?.addEventListener("click", () =>
  applyTheme(root.classList.contains("dark") ? "light" : "dark"),
);

const revealItems = document.querySelectorAll("main > section, main > footer");
if (
  "IntersectionObserver" in window &&
  !window.matchMedia("(prefers-reduced-motion: reduce)").matches
) {
  const revealObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12 },
  );

  revealItems.forEach((item, index) => {
    item.classList.add("section-reveal");
    item.style.setProperty("--reveal-delay", `${Math.min(index * 90, 270)}ms`);
    revealObserver.observe(item);
  });
}

const menu = document.querySelector("[data-mobile-menu]");
const menuToggle = document.querySelector("[data-menu-toggle]");
const menuIcon = document.querySelector("[data-menu-icon]");
const closeMenu = () => {
  menu?.classList.add("hidden");
  menu?.classList.remove("flex", "is-open");
  menuToggle?.setAttribute("aria-expanded", "false");
  menuToggle?.setAttribute("aria-label", "Ouvrir le menu");
  if (menuIcon) menuIcon.textContent = "☰";
  document.body.classList.remove("menu-open");
};
const openMenu = () => {
  menu?.classList.remove("hidden");
  menu?.classList.add("flex", "is-open");
  menuToggle?.setAttribute("aria-expanded", "true");
  menuToggle?.setAttribute("aria-label", "Fermer le menu");
  if (menuIcon) menuIcon.textContent = "×";
  document.body.classList.add("menu-open");
};
menuToggle?.addEventListener("click", () =>
  menu?.classList.contains("is-open") ? closeMenu() : openMenu(),
);
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
