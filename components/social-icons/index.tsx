import {
  Mail,
  Github,
  Facebook,
  Youtube,
  Linkedin,
  Mastodon,
  Threads,
  Instagram,
  TwitterNew,
  Rss,
} from './icons'

const components = {
  mail: Mail,
  github: Github,
  facebook: Facebook,
  youtube: Youtube,
  linkedin: Linkedin,
  twitter: TwitterNew,
  mastodon: Mastodon,
  threads: Threads,
  instagram: Instagram,
  rss: Rss,
}

type SocialIconProps = {
  kind: keyof typeof components
  href: string | undefined
  size?: number
  disabled?: boolean
}

const SocialIcon = ({ kind, href, size = 8, disabled = false }: SocialIconProps) => {
  if (!href || (kind === 'mail' && !/^mailto:\w+([.-]?\w+)@\w+([.-]?\w+)(.\w{2,3})+$/.test(href)))
    return null

  const SocialSvg = components[kind]
  const defaultSvgClassNames = `fill-current text-gray-700 dark:text-gray-200  h-${size} w-${size}`

  return disabled ? (
    <SocialSvg className={`${defaultSvgClassNames} opacity-25`} />
  ) : (
    <a
      className="text-sm text-gray-500 transition hover:text-gray-600"
      target="_blank"
      rel="noopener noreferrer"
      href={href}
    >
      <span className="sr-only">{kind}</span>
      <SocialSvg
        className={`${defaultSvgClassNames} hover:text-primary-500 dark:hover:text-primary-400`}
      />
    </a>
  )
}

export default SocialIcon
