import TOCInline from 'pliny/ui/TOCInline'
import Pre from 'pliny/ui/Pre'
import BlogNewsletterForm from 'pliny/ui/BlogNewsletterForm'
import type { MDXComponents } from 'mdx/types'
import GitHubCalendar from 'react-github-calendar'

import Image from './Image'
import CustomLink from './Link'
import ThemedTweet from './ThemedTweet'
import WebGPUGameOfLife from './experiments/webgpu-gol'

export const components: MDXComponents = {
  Image,
  TOCInline,
  a: CustomLink,
  pre: Pre,
  BlogNewsletterForm,
  ThemedTweet,
  WebGPUGameOfLife,
  GitHubCalendar,
}
