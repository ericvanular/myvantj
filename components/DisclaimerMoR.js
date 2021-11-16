import React from 'react'
import { createPopper } from '@popperjs/core'

const DisclaimerMoR = ({ creator, color }) => {
  const [tooltipShow, setTooltipShow] = React.useState(false)
  const btnRef = React.createRef()
  const tooltipRef = React.createRef()
  const openLeftTooltip = () => {
    createPopper(btnRef.current, tooltipRef.current, {
      placement: 'bottom',
    })
    setTooltipShow(true)
  }
  const closeLeftTooltip = () => {
    setTooltipShow(false)
  }
  return (
    <div
      className="text-center py-3 lg:px-4"
      onMouseEnter={openLeftTooltip}
      onMouseLeave={closeLeftTooltip}
      ref={btnRef}
    >
      <div
        className="bg-transparent items-center text-gray-600 leading-none lg:rounded-full flex lg:inline-flex"
        role="alert"
      >
        <span className="flex rounded-full uppercase px-2 py-1 text-xs font-bold mr-3">
          <img src="https://img.icons8.com/small/160/000000/info.png" className="w-6 h-6" />
        </span>
        <span className="font-semibold text-xs flex-auto">
          Payments are made to CreatorBase on behalf of {creator}.
        </span>
      </div>
      <div
        className={
          (tooltipShow ? '' : 'hidden ') +
          'bg-' +
          color +
          '-700 border-0 mt-3 block z-50 font-normal leading-normal text-xs max-w-xs no-underline break-words rounded-lg'
        }
        ref={tooltipRef}
      >
        <div>
          <div className="text-white p-3">
            JetPeak Ltd is the Merchant of Record for card payment transactions on this site.
            JetPeak Ltd will appear on your payment card statement. Any disputes will be settled
            with JetPeak.
          </div>
        </div>
      </div>
    </div>
  )
}

export default DisclaimerMoR
