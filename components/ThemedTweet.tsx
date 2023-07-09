import React, { useEffect, useState } from 'react'
import { Tweet } from 'mdx-embed'

interface Props {
  tweetLink: string
  align: 'left' | 'center' | 'right' | 'left'
  hideConversation: boolean
}

type ThemeToken = 'light' | 'dark'

export default function ThemedTweet(props: Props) {
  const [themeFromStorage, setThemeFromStorage] = useState<ThemeToken>()

  useEffect(() => {
    // Ghetto localStorage change check via setInterval
    // `Tweet` component from mdx-embed doesn't support dynamic theme change
    // therefore the theme is going to be picked up only once on page load

    // const themeCheckInterval = setInterval(() => {
    const currentTheme = window.localStorage.getItem('theme') as ThemeToken
    setThemeFromStorage(currentTheme)
    // }, 500)

    // return () => {
    //   clearInterval(themeCheckInterval);
    // }
  }, [])

  return themeFromStorage ? <Tweet {...props} theme={themeFromStorage} /> : null
}
