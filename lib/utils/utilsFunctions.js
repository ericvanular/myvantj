/* eslint-disable */

export const validateEmail = (email) => {
  var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
  return re.test(email)
}

export const validatePhoneNumber = (email) => {
  var re = /^\s*(?:\+?(\d{1,3}))?[-. (]*(\d{3})[-. )]*(\d{3})[-. ]*(\d{4})(?: *x(\d+))?\s*$/
  return re.test(email)
}

export const formatPhoneNumber = (value) => {
  if (!value) return value
  const phoneNumber = value.replace(/[^\d]/g, '')
  const phoneNumberLength = phoneNumber.length
  if (phoneNumberLength < 4) return phoneNumber
  if (phoneNumberLength < 7) {
    return `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(3)}`
  }
  return `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(3, 6)}-${phoneNumber.slice(6, 10)}`
}

export const formatDollars = (value) => {
  if (!value) return value
  const dollarAmount = Number(String(value))
  return dollarAmount
}

export const formatNumericInput = (value) => {
  if (!value) return value
  const cleanedInput = value.replace(/[^\d]/g, '')
  const numericValue = Number(String(value))
  return numericValue
}

export const displayAddress = (addressObj) => {
  const fields = [
    [addressObj?.address1],
    [addressObj?.city],
    [addressObj?.region],
    [addressObj?.country],
    [addressObj?.postal_code],
  ]
  return fields
    .map((part) => part.filter(Boolean).join(' '))
    .filter((str) => str.length)
    .join(', ')
}

export const validateAddress = (addressObj) => {
  const fields = [
    addressObj?.address1,
    addressObj?.city,
    addressObj?.region,
    addressObj?.country,
    addressObj?.postal_code,
  ]
  return fields.every(Boolean)
}
