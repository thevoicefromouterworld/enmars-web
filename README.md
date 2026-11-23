# ENMARS — enmars.eu

Static website for ENMARS, hosted for free on GitHub Pages (migrated from Squarespace).

## Structure

| Path | Page |
|---|---|
| `index.html` | Home |
| `solutions/index.html` | Solutions |
| `our-industries/index.html` | Industries |
| `production-process/index.html` | Production Process |
| `sustainability/index.html` | Sustainability |
| `contact/index.html` | Contact |
| `thanks/index.html` | Thank-you page after a form submission (no-JS fallback) |
| `assets/css/style.css` | All styles (colours, fonts, layout) |
| `assets/js/main.js` | Mobile menu + contact form submission |
| `assets/img/` | Images |
| `CNAME` | Custom domain (enmars.eu) |

Header and footer are repeated in every page: if you change the menu or the contact details, change them in all `index.html` files.

## Contact form

The forms post to [FormSubmit](https://formsubmit.co) → emails arrive at **rokas@enmars.eu**, with **lucas@enmars.eu** in copy (`_cc` hidden field). No backend or account needed.
The very first submission triggers an activation email to rokas@enmars.eu — click the link in it once and the form is live.
To change recipients, edit the `action` of the `<form>` (main recipient) and the `_cc` field (copies, comma-separated) in `index.html` and `contact/index.html`.

## Editing

Edit any file on GitHub (pencil icon) or locally and push to `main`; GitHub Pages republishes in ~1 minute.
