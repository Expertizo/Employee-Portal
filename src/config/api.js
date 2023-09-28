const BASE_URL = 'https://api.geekbot.com/v1'
const apiKey = process.env.REACT_APP_API_KEY

const getStandupReports = async ({ standupId, before, after }) => {
  const res = await fetch(`${BASE_URL}/reports?standup_id=${standupId}&limit=100&after=${after}&before=${before}`, {
    headers: {
      Authorization: apiKey
    }
  })
  const json = await res.json()
  return json
}

export {
  getStandupReports
}

