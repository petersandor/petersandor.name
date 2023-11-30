[![blog-banner](/public/static/images/twitter-card.png)](https://petersandor.name)

# petersandor.name

[![Hits](https://hits.seeyoufarm.com/api/count/incr/badge.svg?url=https%3A%2F%2Fgithub.com%2Fpetersandor%2Fpetersandor.name&count_bg=%2379C83D&title_bg=%23555555&icon=&icon_color=%23E7E7E7&title=Repo+views&edge_flat=false)](https://hits.seeyoufarm.com)

Source code of my personal website.

## Tech stack

This blog uses a [Next.js](https://nextjs.org/), [Tailwind CSS](https://tailwindcss.com/) blogging [template](https://github.com/timlrx/tailwind-nextjs-starter-blog). It's based on Next App directory with [React Server Component](https://nextjs.org/docs/getting-started/react-essentials#server-components) and uses [Contentlayer](https://www.contentlayer.dev/) to manage markdown content.

## Features

- Next.js with Typescript
- [Contentlayer](https://www.contentlayer.dev/) to manage content logic
- Easy styling customization with [Tailwind 3.0](https://tailwindcss.com/blog/tailwindcss-v3) and primary color attribute
- [MDX - write JSX in markdown documents!](https://mdxjs.com/)
- Near perfect lighthouse score - [Lighthouse report](https://www.webpagetest.org/result/230805_BiDcBQ_4H7)
- Lightweight, 85kB first load JS
- Mobile-friendly view
- Light and dark theme
- Font optimization with [next/font](https://nextjs.org/docs/app/api-reference/components/font)
- Integration with [pliny](https://github.com/timlrx/pliny) that provides:
  - Multiple analytics options including [Umami](https://umami.is/), [Plausible](https://plausible.io/), [Simple Analytics](https://simpleanalytics.com/), Posthog and Google Analytics
  - Comments via [Giscus](https://github.com/laymonage/giscus), [Utterances](https://github.com/utterance/utterances) or Disqus
  - Newsletter API and component with support for Mailchimp, Buttondown, Convertkit, Klaviyo, Revue, and Emailoctopus
  - Command palette search with [Kbar](https://github.com/timc1/kbar) or Algolia
- Server-side syntax highlighting with line numbers and line highlighting via [rehype-prism-plus](https://github.com/timlrx/rehype-prism-plus)
- Math display supported via [KaTeX](https://katex.org/)
- Citation and bibliography support via [rehype-citation](https://github.com/timlrx/rehype-citation)
- Automatic image optimization via [next/image](https://nextjs.org/docs/basic-features/image-optimization)
- Support for tags - each unique tag will be its own page
- Support for multiple authors
- 3 different blog layouts
- 2 different blog listing layouts
- Support for nested routing of blog posts
- Projects page
- Preconfigured security headers
- SEO friendly with RSS feed, sitemaps and more!
