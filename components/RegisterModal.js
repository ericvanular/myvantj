import React, { useState, useEffect } from 'react'
import Modal from './Modal'
import RegisterForm from './RegisterForm'

export default function RegisterModal(props) {
  return (
    <Modal open={props.open} setOpen={props.setOpen}>
      <RegisterForm signUpSubtext={`To see premium posts, chat with creators, and more`} />
    </Modal>
  )
}
