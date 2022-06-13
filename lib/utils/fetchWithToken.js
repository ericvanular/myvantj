const fetchWithToken = async (url, token) => {
  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
  return res.json()
}

export default fetchWithToken
