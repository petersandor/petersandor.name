import { promises as fs } from 'fs'
import { unstable_cache } from 'next/cache'
import Calendar, {
  Skeleton,
  type Props as ActivityCalendarProps,
  type ThemeInput,
} from 'react-activity-calendar'

export interface Activity {
  date: string
  count: number
  level: 0 | 1 | 2 | 3 | 4
}

export type Year = number | 'last'

export interface ApiResponse {
  total: {
    [year: number]: number
    [year: string]: number // 'lastYear;
  }
  contributions: Array<Activity>
}

export interface ApiErrorResponse {
  error: string
}

export interface Props extends Omit<ActivityCalendarProps, 'data'> {
  username: string
  errorMessage?: string
  throwOnError?: boolean
  transformData?: (data: Array<Activity>) => Array<Activity>
  transformTotalCount?: boolean
  year?: Year
}

export const transformData = (
  data: Array<Activity>,
  transformFn?: (data: Array<Activity>) => Array<unknown>
): Array<Activity> => {
  if (typeof transformFn !== 'function') {
    return data
  }

  const transformedData = transformFn(data)

  if (!Array.isArray(transformedData)) {
    throw Error(`transformData() function must return a list of Activity objects.`)
  }

  for (const d of transformedData) {
    if (!isRecord(d)) {
      throw Error(`transformData() must return a list of valid Activity objects.`)
    }

    if (typeof d.count !== 'number' || d.count < 0) {
      throw Error(`Required property "count: number" missing or invalid. Got: ${d.count}`)
    }

    if (typeof d.date !== 'string' || !/\d{4}-\d{2}-\d{2}/.test(d.date)) {
      throw Error(`Required property "date: YYYY-MM-DD" missing or invalid. Got: ${d.date}`)
    }

    if (typeof d.level !== 'number' || d.level < 0 || d.level > 4) {
      throw Error(
        `Required property "level: 0 | 1 | 2 | 3 | 4" missing or invalid: Got: ${d.level}.`
      )
    }
  }

  return transformedData as Array<Activity>
}

const isRecord = (o: unknown): o is Record<string, unknown> =>
  Object.prototype.toString.call(o) === '[object Object]'

async function loadLocalCalendarData(username: string, year: Year): Promise<ApiResponse> {
  let data: ApiResponse

  try {
    console.log('Loading GitHub activity data from local file')

    data = JSON.parse(
      await fs.readFile(
        process.cwd() + `/data/github-calendar/github-activity-${year}.json`,
        'utf8'
      )
    )

    console.log('Successfully loaded GitHub activity data from local file')
  } catch (error) {
    throw Error(`Unable to load GitHub activity file: ${error}`)
  }

  return data
}

async function fetchCalendarData(username: string, year: Year): Promise<ApiResponse> {
  let data: ApiResponse | ApiErrorResponse

  try {
    data = await loadLocalCalendarData(username, year)
  } catch (error) {
    console.warn('Falling back to API data:', error)

    const apiUrl = 'https://github-contributions-api.jogruber.de/v4/'
    const response = await fetch(`${apiUrl}${username}?y=${year}`)
    data = await response.json()

    if (!response.ok) {
      throw Error(
        `Fetching GitHub contribution data for "${username}" failed: ${
          (data as ApiErrorResponse).error
        }`
      )
    }
  }

  return data as ApiResponse
}

const getGitHubCalendarData = unstable_cache(
  async (username: string, year: Year) => fetchCalendarData(username, year),
  ['github-calendar'],
  {
    revalidate: 3600 * 24,
  }
)

async function GitHubCalendar({
  username,
  year = 'last',
  labels,
  transformData: transformFn,
  transformTotalCount = true,
  throwOnError = process.env.NODE_ENV === 'development',
  errorMessage = `Error – Fetching GitHub contribution data for "${username}" failed.`,
  ...props
}: Props) {
  let data: ApiResponse

  try {
    data = await getGitHubCalendarData(username, year)
  } catch (error) {
    if (throwOnError) {
      throw new Error('Error fetching GitHub contribution data.')
    } else {
      return <div>{errorMessage}</div>
    }
  }

  const theme = props.theme ?? gitHubTheme

  const defaultLabels = {
    totalCount: `{{count}} contributions in ${year === 'last' ? 'the last year' : '{{year}}'}`,
  }

  const totalCount = year === 'last' ? data.total['lastYear'] : data.total[year]

  return (
    <Calendar
      data={transformData(data.contributions, transformFn)}
      labels={Object.assign({}, defaultLabels, labels)}
      totalCount={transformFn && transformTotalCount ? undefined : totalCount}
      {...props}
      theme={theme}
      maxLevel={4}
    />
  )
}

GitHubCalendar.displayName = 'GitHubCalendar'

const gitHubTheme = {
  light: ['#ebedf0', '#9be9a8', '#40c463', '#30a14e', '#216e39'],
  dark: ['#161b22', '#0e4429', '#006d32', '#26a641', '#39d353'],
} satisfies ThemeInput

export default GitHubCalendar
