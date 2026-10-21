# Portify — Online Portfolio Template Generator

A student-friendly portfolio generator built with **HTML, CSS, vanilla JavaScript, and Supabase**. It follows the supplied HCI project requirements: personal information form, exactly three distinct templates, preview, create/read/update/delete management, online database support, and a responsive interface.

## Included files

- `index.html` — all website screens and form controls
- `styles.css` — responsive interface and the three portfolio styles
- `app.js` — navigation, form handling, template rendering, local demo storage, CRUD, export, and Supabase connection/auth
- `supabase-schema.sql` — online database table and Row Level Security policies
- `README.md` — setup, testing, and deployment instructions

## 1. Run the website locally

1. Extract the ZIP.
2. Open the project folder in VS Code.
3. Use the **Live Server** extension to open `index.html` (recommended), or serve the folder with any static web server.
4. You can immediately create, preview, edit, and delete portfolios in **Local demo mode**. Local demo data is stored in your current browser only.

> Do not open the file in a way that blocks scripts or browser storage. A local static server is recommended.

## 2. Connect the online Supabase database

### Create the database

1. Create a project at [Supabase](https://supabase.com/).
2. Open **SQL Editor** in your Supabase project.
3. Copy all contents of `supabase-schema.sql` into a new query and run it.
4. In **Project Settings → API** (or the project's API keys page), copy:
   - Project URL
   - Public anon / publishable key
5. Open Portify, click the small account/settings button in the sidebar (or the avatar in the top bar).
6. Paste the Project URL and public anon/publishable key, then click **Connect online**.
7. Create an account with your email and a password. If email confirmation is enabled, confirm your email before signing in.
8. Sign in. Your cloud portfolios are private to your authenticated account and stored in Supabase.

### Security notes

- Only use the **public anon/publishable key** in this browser app. Never expose a service-role key or database password.
- Keep the supplied Row Level Security policies enabled. They restrict each account to its own portfolio rows.
- For a real public-facing service, configure Supabase Auth email settings and review your project's security settings.
- Profile picture fields expect a public image URL. This version does not upload image files to Supabase Storage.
- Local demo portfolios are not automatically migrated to the cloud. Re-create them after signing in if you want them online.

## 3. Deploy the website

This is a static site, so it can be deployed to Vercel, Netlify, or another static hosting service.

### Netlify (simple option)

1. Create/sign in to a [Netlify](https://www.netlify.com/) account.
2. Choose **Add new site → Deploy manually**.
3. Drag the extracted project folder (containing `index.html`, `styles.css`, and `app.js`) into the deploy area, or connect your Git repository.
4. Open the public URL Netlify provides.
5. Open the deployed URL and test the full workflow after connecting Supabase.

### Vercel

1. Push the project folder to a GitHub repository.
2. Import the repository in [Vercel](https://vercel.com/).
3. Deploy with no build command and no output directory (the root folder contains `index.html`).
4. Test the public URL and Supabase sign-in.

The app remembers the Supabase URL and public key in the browser's local storage after connection. Each person who uses the deployed site must connect the project and sign in unless you configure an alternative setup.

## 4. Required workflow

1. Open Overview.
2. Click **Create a portfolio**.
3. Enter a name and optional information.
4. Click **Save & choose template**.
5. Select Simple, Modern, or Creative.
6. Preview the generated portfolio.
7. Use **Edit details** to update it, or open **My portfolios** to preview, edit, or delete a saved portfolio.
8. Use **Export HTML** to download a standalone HTML copy of the preview.

## 5. Database structure

`portfolios` table:

| Column | Type | Purpose |
|---|---|---|
| `id` | UUID | Unique portfolio ID |
| `user_id` | UUID | Authenticated owner |
| `full_name` | text | Required name |
| `job_title` | text | Professional title |
| `email` | text | Email |
| `phone` | text | Contact number |
| `address` | text | Location |
| `profile_picture` | text | Public profile image URL |
| `about` | text | About me |
| `education` | text | Education entries |
| `skills` | text | Skills |
| `projects` | text | Project entries |
| `experience` | text | Experience entries |
| `social_links` | text | Social links |
| `template` | text | `simple`, `modern`, or `creative` |
| `created_at` | timestamptz | Creation time |
| `updated_at` | timestamptz | Last update time |

## 6. Testing checklist

- [ ] Website opens on desktop and mobile
- [ ] Create a portfolio with at least a name
- [ ] Save and select each of the three templates
- [ ] Preview the generated portfolio
- [ ] Edit saved information and verify the update
- [ ] Delete a portfolio
- [ ] In cloud mode, refresh the page and verify cloud data remains
- [ ] Sign out and sign back in
- [ ] Verify another account cannot see the first account's portfolios
- [ ] Deploy and test the public URL

## 7. Suggested project documentation

**Project Title:** Portify — Online Portfolio Template Generator

**Project Description:** Portify is a responsive web application that helps users build personal portfolios without manually coding a portfolio website. Users enter personal information, education, skills, projects, experience, and social links. They can select one of three distinct templates, preview their portfolio, and manage saved records. Supabase provides online authentication and data storage.

**Technologies Used:** HTML5, CSS3, JavaScript, Supabase Auth, Supabase PostgreSQL.

**Hosting Platform:** Netlify or Vercel (fill in the platform and actual deployed URL after deployment).

**Database Platform:** Supabase.

**Templates:** Simple, Modern, Creative.

**Important:** A deployed website URL is not included in the source ZIP because deployment requires your hosting account. Complete the deployment steps and insert your actual public URL in your submission.
