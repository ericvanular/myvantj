const API = async (url, options = {}) => {
    try {
        const response = await fetch(url, options)
        const data = await response.json()
        if (response.ok) {
            return data
        } else {
            throw data.error
        }
    } catch (err) {
        throw 'Error: ' + err
    }
}

export default API
