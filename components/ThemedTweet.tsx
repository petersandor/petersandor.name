import { unstable_cache } from 'next/cache'
import { EmbeddedTweet, TweetNotFound } from 'react-tweet'
import { getTweet as _getTweet } from 'react-tweet/api'

const getTweet = unstable_cache(async (id: string) => _getTweet(id), ['tweet'], {
  revalidate: 3600 * 24,
})

export default async function ThemedTweet({ id }: { id: string }) {
  try {
    const tweet = await getTweet(id)
    return (
      <div className="not-prose flex justify-center">
        {tweet ? <EmbeddedTweet tweet={tweet} /> : <TweetNotFound />}
      </div>
    )
  } catch (error) {
    console.error(error)
    return (
      <div className="not-prose flex justify-center">
        <TweetNotFound error={error} />
      </div>
    )
  }
}
