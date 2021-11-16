import React, { useState, useEffect } from 'react'
import Cards from 'react-credit-cards'
import 'react-credit-cards/lib/styles-compiled.css'
import { PaymentInputsWrapper, usePaymentInputs } from 'react-payment-inputs'
import images from 'react-payment-inputs/images'

export default function PaymentMethodDisplay(props) {
  const {
    wrapperProps,
    getCardImageProps,
    getCardNumberProps,
    getExpiryDateProps,
    getCVCProps,
    meta,
  } = usePaymentInputs()

  const [card, setCard] = useState({
    cvc: '',
    expiryDate: '',
    focus: '',
    name: '',
    cardNumber: '',
  })

  const handleInputFocus = (e) => {
    const { name, value } = e.target
    setCard((prevState) => ({
      ...prevState,
      [focus]: name,
    }))
  }

  const handleCardChange = (e) => {
    const { name, value } = e.target
    setCard((prevState) => ({
      ...prevState,
      [name]: value.replace(/\D/g, ''),
    }))
    props.handleChange(name, value.replace(/\D/g, ''))
  }

  const handleSubmitButtonClick = () => {
    props.handleSubmit()
    setCard({
      cvc: '',
      expiryDate: '',
      focus: '',
      name: '',
      cardNumber: '',
    })
  }

  return (
    <div className="flex justify-center items-center" style={{ flexWrap: 'wrap' }}>
      <Cards
        cvc={card.cvc}
        expiry={card.expiryDate}
        focused={card.focus}
        name={''}
        number={card.cardNumber}
        placeholders={{ name: '' }}
        locale={{ valid: 'expiration' }}
      />
      <div className="flex flex-col m-4">
        <PaymentInputsWrapper {...wrapperProps}>
          <svg {...getCardImageProps({ images })} />
          <input
            className="focus:appearance-none"
            value={card.cardNumber}
            {...getCardNumberProps({ onTouch: handleInputFocus, onChange: handleCardChange })}
          />
          <input
            value={card.expiryDate}
            {...getExpiryDateProps({ onTouch: handleInputFocus, onChange: handleCardChange })}
          />
          <input
            value={card.cvc}
            {...getCVCProps({ onTouch: handleInputFocus, onChange: handleCardChange })}
          />
        </PaymentInputsWrapper>
        <button
          className="mt-3 bg-indigo-500 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded shadow"
          disabled={meta.error}
          onClick={handleSubmitButtonClick}
        >
          Add Card
        </button>
      </div>
    </div>
  )
}
