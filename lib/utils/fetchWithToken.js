const fetchWithToken = async (url, method, token) => {
  const res = await fetch(url, {
    method: method,
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
  return res.json()
}

export default fetchWithToken
