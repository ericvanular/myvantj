const fetchWithToken = async (url, method, token, data) => {
  if (method === 'POST' || method === 'PUT') {
    const res = await fetch(url, {
      method: method,
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })
    return res.json()
  } else {
    const res = await fetch(url, {
      method: method,
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    return res.json()
  }
}

export default fetchWithToken
