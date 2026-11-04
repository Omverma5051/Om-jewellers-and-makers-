<!-- coderabbit-ai-generated:v1 -->

# Managing the catalogue

Edit `catalogue/data.json` to update the catalogue. The site is static and has no database or admin login. Changes take effect after the updated files are published.

## Contact

Set `contact.phone` and `contact.whatsapp` to the store's verified numbers with country code, for example `+91...`. Leave either field empty until confirmed. The call and WhatsApp buttons are enabled only for valid configured numbers. The enquiry form opens WhatsApp with the product reference and the customer's details when WhatsApp is configured; otherwise it offers to copy the message. The website does not store enquiries.

## Products

<!-- coderabbit-ai-generated:v1 -->

<!-- coderabbit-ai-generated-section:v1:7826b029ecd4bac1a3b0a645e9dd61165cb07c23533c5be8406a2fd611905c37 -->

The initial entries are design references; they are not verified stock. Some use credited, reusable photographs. Replace them with confirmed store products and photographs. Each product has:

<!-- /coderabbit-ai-generated:v1 -->

- A unique `id` and `names` with `en`, `hi` and `hinglish` values.
- `metal` (`gold` or `silver`) and a `category` matching an ID in `categories`.
- `subcategory` with `en`, `hi` and `hinglish` names.
- `images`, an array of paths under `assets/` or `catalogue/` ending in jpg, jpeg, png, webp or avif. Add image files to the repository first.
- `description`, `designTypes` (any of `traditional`, `modern`, `antique`, `designer`, `bridal`, `daily`), and `gender` (`women`, `men`, `children`, `unisex`).
- `purity` and `weight` as strings only if verified or provided; use empty strings otherwise.
- `variations` as an array of confirmed design descriptions; leave it empty if unknown.
<!-- coderabbit-ai-generated:v1 -->

<!-- coderabbit-ai-generated-section:v1:7386e4583d710e89057918acdc3a75eb224bcb673f017e2fb9d5c908dd43d1a9 -->

- `published` set to `true` to show the item or `false` to hide it.
<!-- coderabbit-ai-generated:v1 -->

<!-- coderabbit-ai-generated-section:v1:372051664ffa2306fa8d82d0ff72dbf46f48b9ffc2d8e2d303c9db1cea1a6151 -->

- `referenceOnly` set to `true` for an illustrative design reference or `false` for a confirmed store product.
- Optional `additionalCategories` as an array of category IDs for items that belong to more than one category.
- Optional `credit` with `title`, `creator`, `url`, `license`, `licenseUrl` and `changes` for licensed imagery. Preserve required attribution when using images from others.

<!-- /coderabbit-ai-generated:v1 -->

<!-- /coderabbit-ai-generated:v1 -->

Category entries contain an ID, names in all three languages, a list of metals and a group (`jewellery`, `coins`, `pooja` or `bartan`). Use unique product and category IDs. Do not enter private information into this public file. Validate JSON before publishing.
