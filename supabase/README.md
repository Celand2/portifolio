# Backend du formulaire de contact

Le formulaire envoie ses demandes à la fonction `contact`. Celle-ci valide les
champs, enregistre le message dans `contact_messages`, puis demande à Resend
d’envoyer une notification. Les clés privées restent dans les secrets Supabase.

## Préparation

1. Crée un projet Supabase et un compte Resend.
2. Vérifie auprès de Resend le domaine utilisé comme expéditeur. L’adresse
   `RESEND_FROM_EMAIL` doit appartenir à ce domaine.
3. Installe la CLI Supabase, connecte-toi et associe le projet :

   ```sh
   supabase login
   supabase link --project-ref YOUR_PROJECT_REF
   ```

4. Applique la migration qui crée la table avec RLS activé :

   ```sh
   supabase db push
   ```

5. Configure les secrets de la fonction, puis déploie-la :

   ```sh
   supabase secrets set RESEND_API_KEY=re_xxx CONTACT_TO_EMAIL=celeusndikumana060@gmail.com RESEND_FROM_EMAIL="Celeus Ndikumana <contact@your-domain.com>" CONTACT_ALLOWED_ORIGINS=https://your-site.vercel.app,http://localhost:5173
   supabase functions deploy contact
   ```

   Remplace `re_xxx`, l’adresse expéditrice et l’origine Vercel par tes vraies
   valeurs. N’ajoute jamais la clé `SUPABASE_SERVICE_ROLE_KEY` au code ou au
   dépôt : Supabase la fournit à la fonction. `CONTACT_ALLOWED_ORIGINS` accepte
   une liste d’origines séparées par des virgules ; ajoute le domaine de
   production et l’origine locale seulement si tu testes en local.

## Configuration du site

Copie `.env.example` vers `.env.local` à la racine du projet et renseigne
`VITE_SUPABASE_URL` et `VITE_SUPABASE_ANON_KEY` depuis les paramètres API du
projet Supabase. Ces deux variables sont publiques ; ne mets jamais la clé
service role dans une variable `VITE_`.

Ajoute les mêmes variables publiques dans les paramètres de l’application
Vercel, puis redéploie le site. Pour le développement local, utilise
`npm run dev`. Les secrets de la fonction doivent être configurés séparément
dans Supabase.

Les demandes enregistrées sont consultables dans la table
`public.contact_messages` du tableau de bord Supabase. La table n’autorise pas
la lecture publique. Si l’enregistrement réussit mais que Resend échoue, le
formulaire indique que le message est conservé sans notification email.
