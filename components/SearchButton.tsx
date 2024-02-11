import { AlgoliaButton } from 'pliny/search/AlgoliaButton'
import { KBarButton } from 'pliny/search/KBarButton'
import siteMetadata from '@/data/siteMetadata'
import { useDeviceSelectors } from 'react-device-detect'

const useDeviceDetection = () => {
  const userAgent =
    '__incrementalCache' in globalThis
      ? globalThis.__incrementalCache.requestHeaders['user-agent']
      : ''

  const deviceData = useDeviceSelectors(userAgent)

  if (Array.isArray(deviceData)) {
    return deviceData.at(0)
  }

  return {}
}

const SearchButton = () => {
  const { isDesktop, isMacOs } = useDeviceDetection()

  if (
    siteMetadata.search &&
    (siteMetadata.search.provider === 'algolia' || siteMetadata.search.provider === 'kbar')
  ) {
    const SearchButtonWrapper =
      siteMetadata.search.provider === 'algolia' ? AlgoliaButton : KBarButton

    return (
      <SearchButtonWrapper aria-label="Search" className="flex items-center">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="text-gray-900 dark:text-gray-100 h-6 w-6"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
          />
        </svg>
        {isDesktop && (
          <>
            <kbd className="ml-1 inline-block whitespace-nowrap rounded border px-1.5 align-middle font-medium leading-4 tracking-wide text-xs text-gray-400 border-gray-400">
              {isMacOs ? '⌘' : 'Ctrl'}
            </kbd>
            <span className="font-medium leading-4 tracking-wide text-xs text-gray-400 mx-1">
              +
            </span>
            <kbd className="inline-block whitespace-nowrap rounded border px-1.5 align-middle font-medium leading-4 tracking-wide text-xs text-gray-400 border-gray-400">
              K
            </kbd>
          </>
        )}
      </SearchButtonWrapper>
    )
  }
}

export default SearchButton
