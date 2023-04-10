import Mail from './mail.svg'
import Github from './github.svg'
import Facebook from './facebook.svg'
import Youtube from './youtube.svg'
import Linkedin from './linkedin.svg'
import Twitter from './twitter.svg'

// Icons taken from: https://simpleicons.org/

const components = {
  mail: Mail,
  github: Github,
  facebook: Facebook,
  youtube: Youtube,
  linkedin: Linkedin,
  twitter: Twitter,
}

const defaultSvgClassNames = 'fill-current text-gray-700 dark:text-gray-200';

const SocialIcon = ({ kind, href, disabled = false, size = 8 }) => {
  if (!href || (kind === 'mail' && !/^mailto:\w+([.-]?\w+)@\w+([.-]?\w+)(.\w{2,3})+$/.test(href)))
    return null

  const SocialSvg = components[kind]
  const SvgSizeClassNames = `h-${size} w-${size}`

  return disabled ? (
    <SocialSvg
      className={`${defaultSvgClassNames} ${SvgSizeClassNames} opacity-25`}
    />
  ) : (
    <a
      className="text-sm text-gray-500 transition hover:text-gray-600"
      target="_blank"
      rel="noopener noreferrer"
      href={href}
    >
      <span className="sr-only">{kind}</span>
      <SocialSvg
        className={`${defaultSvgClassNames} hover:text-blue-500 dark:hover:text-blue-400 ${SvgSizeClassNames}`}
      />
    </a>
  )
}

export default SocialIcon
