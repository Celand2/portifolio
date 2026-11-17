const jsonResponse = (
  body: Record<string, unknown>,
  status: number,
  origin: string,
) =>
  new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": origin,
      "Access-Control-Allow-Headers":
        "authorization, apikey, content-type, x-client-info",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      Vary: "Origin",
    },
  });

const readText = (value: unknown, maxLength: number) => {
  if (typeof value !== "string") return null;
  const text = value.trim();
  return text.length > 0 && text.length <= maxLength ? text : null;
};

Deno.serve(async (request) => {
  const allowedOrigins = (Deno.env.get("CONTACT_ALLOWED_ORIGINS") ?? "")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);
  const origin = request.headers.get("origin") ?? "";

  if (!origin || !allowedOrigins.includes(origin)) {
    return new Response("Origin not allowed", { status: 403 });
  }

  if (request.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": origin,
        "Access-Control-Allow-Headers":
          "authorization, apikey, content-type, x-client-info",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        Vary: "Origin",
      },
    });
  }

  if (request.method !== "POST") {
    return jsonResponse({ error: "Méthode non autorisée." }, 405, origin);
  }

  if (!request.headers.get("content-type")?.includes("application/json")) {
    return jsonResponse({ error: "Format de requête invalide." }, 415, origin);
  }

  const contentLength = Number(request.headers.get("content-length") ?? 0);
  if (contentLength > 24000) {
    return jsonResponse({ error: "Le formulaire est trop volumineux." }, 413, origin);
  }

  let payload: unknown;
  try {
    const body = await request.text();
    if (body.length > 24000) {
      return jsonResponse({ error: "Le formulaire est trop volumineux." }, 413, origin);
    }
    payload = JSON.parse(body);
  } catch {
    return jsonResponse({ error: "Le contenu du formulaire est invalide." }, 400, origin);
  }

  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    return jsonResponse({ error: "Le contenu du formulaire est invalide." }, 400, origin);
  }

  const form = payload as Record<string, unknown>;
  if (typeof form.website === "string" && form.website.trim()) {
    return jsonResponse({ error: "La demande n’a pas été acceptée." }, 400, origin);
  }

  const name = readText(form.nom, 120);
  const email = readText(form.email, 254);
  const subject = readText(form.sujet, 160);
  const message = readText(form.message, 5000);
  if (
    !name ||
    !email ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
    !subject ||
    !message
  ) {
    return jsonResponse(
      { error: "Vérifiez les champs et réessayez." },
      400,
      origin,
    );
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  const resendApiKey = Deno.env.get("RESEND_API_KEY");
  const recipient = Deno.env.get("CONTACT_TO_EMAIL");
  const sender = Deno.env.get("RESEND_FROM_EMAIL");

  if (
    !supabaseUrl ||
    !serviceRoleKey ||
    !resendApiKey ||
    !recipient ||
    !sender
  ) {
    console.error("Contact function configuration is incomplete.");
    return jsonResponse(
      { error: "Le service de contact n’est pas encore configuré." },
      503,
      origin,
    );
  }

  let saveResponse: Response;
  try {
    saveResponse = await fetch(
      `${supabaseUrl.replace(/\/$/, "")}/rest/v1/contact_messages`,
      {
        method: "POST",
        headers: {
          apikey: serviceRoleKey,
          Authorization: `Bearer ${serviceRoleKey}`,
          "Content-Type": "application/json",
          Prefer: "return=minimal",
        },
        body: JSON.stringify({
          name,
          email,
          subject,
          message,
        }),
      },
    );
  } catch (error) {
    console.error("Could not save contact message.", error);
    return jsonResponse(
      { error: "Le message n’a pas pu être enregistré. Réessayez plus tard." },
      503,
      origin,
    );
  }

  if (!saveResponse.ok) {
    console.error("Could not save contact message.", saveResponse.status);
    return jsonResponse(
      { error: "Le message n’a pas pu être enregistré. Réessayez plus tard." },
      503,
      origin,
    );
  }

  try {
    const emailResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: sender,
        to: [recipient],
        reply_to: email,
        subject: `Nouveau message portfolio : ${subject}`,
        text: `Nom : ${name}\nEmail : ${email}\nSujet : ${subject}\n\n${message}`,
      }),
    });

    if (!emailResponse.ok) {
      console.error("Contact email notification failed.", emailResponse.status);
      return jsonResponse({ ok: true, notificationSent: false }, 202, origin);
    }
  } catch (error) {
    console.error("Contact email notification failed.", error);
    return jsonResponse({ ok: true, notificationSent: false }, 202, origin);
  }

  return jsonResponse({ ok: true, notificationSent: true }, 200, origin);
});
