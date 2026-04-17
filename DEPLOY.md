# External Publish

This dashboard is ready for static hosting on GitHub Pages.

## Recommended path

1. Create a new public GitHub repository.
2. Upload the contents of `/Users/sanj/Documents/emea-org-design-dashboard`.
3. Set the default branch to `main`.
4. In GitHub repo settings, enable **Pages** with source **GitHub Actions**.
5. Push to `main`.

The workflow at `.github/workflows/deploy-pages.yml` will publish the site automatically.

## What gets published

- `index.html`
- `styles.css`
- `app.js`
- `data.js`
- `salesforce-data.js`

## Important note

`salesforce-data.js` contains internal business data. If you publish this to a public repository or public Pages site, that data will also be public.

If you want an externally shareable version, the safer route is usually:

1. remove or redact sensitive data first, or
2. publish to a private/internal host instead of public GitHub Pages.
