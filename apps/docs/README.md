# 📖 BucketKit Documentation

Documentation site for BucketKit, built with [Fumadocs](https://fumadocs.dev) and Next.js.

## 🚀 Development

```bash
# From monorepo root
pnpm --filter docs dev

# Or from this directory
pnpm dev
```

Open [http://localhost:4000](http://localhost:4000) to view the docs.

## 📁 Structure

```
docs/
├── content/
│   └── docs/           # MDX documentation files
│       ├── index.mdx   # Introduction
│       ├── core/       # Core package docs
│       ├── react/      # React package docs
│       └── advanced/   # Advanced topics
├── src/
│   ├── app/            # Next.js app router
│   ├── lib/            # Utilities and config
│   └── mdx-components.tsx
└── source.config.ts    # Fumadocs MDX config
```

## ✏️ Adding Documentation

1. Create a new `.mdx` file in `content/docs/`
2. Add frontmatter with `title` and `description`
3. Update the `meta.json` in the parent folder to include the new page

Example:

```mdx
---
title: My New Page
description: A description of this page
---

# My New Page

Content goes here...
```

## 🔨 Building

```bash
pnpm build
```

The static site will be generated in `.next/`.
