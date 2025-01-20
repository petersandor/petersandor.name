import { AlgoliaButton } from 'pliny/search/AlgoliaButton'
import { KBarButton } from 'pliny/search/KBarButton'
import siteMetadata from '@/data/siteMetadata'

const SearchButton = () => {
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
          className="h-6 w-6 text-gray-900 hover:text-primary-500 dark:text-gray-100
          dark:hover:text-primary-400"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
          />
        </svg>
        <div>
          <kbd className="ml-1 inline-block hidden whitespace-nowrap rounded border border-gray-400 px-1.5 align-middle text-xs font-medium leading-4 tracking-wide text-gray-400 md:inline-block">
            ⌘
          </kbd>
          <span className="mx-1 hidden text-xs font-medium leading-4 tracking-wide text-gray-400 md:inline-block">
            +
          </span>
          <kbd className="inline-block hidden whitespace-nowrap rounded border border-gray-400 px-1.5 align-middle text-xs font-medium leading-4 tracking-wide text-gray-400 md:inline-block">
            K
          </kbd>
        </div>
      </SearchButtonWrapper>
    )
  }
}

export default SearchButton
