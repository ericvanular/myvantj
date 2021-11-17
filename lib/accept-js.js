const dispatchData = async (payload) => {
  return new Promise((resolve, reject) =>
    window.Accept.dispatchData(payload, (response) => {
      switch (response.messages.resultCode) {
        case 'Ok':
          resolve(response)
          break
        case 'Error':
          reject(response)
          break
      }
    })
  )
}

export default { dispatchData }
