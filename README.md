# Energy Plus — Transformer Procurement

Static site for GitHub Pages.

**Live:** https://danknowsaguy-web.github.io/transformers/

## Contact

- Phone: 864-777-0688
- Email: dan@yourenergyplus.com
- Web: YourEnergyPlus.com

## Local preview

```bash
python3 -m http.server 8080
```

## Update content

Edit `scripts/site-data.json`, then:

```bash
node scripts/generate-static-site.mjs
# copy static-export/* to site root and push
```
