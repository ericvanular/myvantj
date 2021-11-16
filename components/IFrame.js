import { useEffect, useRef } from 'react'

const IFrame = () => {
	const authIFrame = useRef(null)

	useEffect(() => {
		window.addEventListener('message', messageHandler)

		// clean up
		return () => window.removeEventListener('message', messageHandler)
	}, []) // empty array => run only once

	const messageHandler = (event) => {
		const { action, key, token } = event.data
		if (action == 'returnData' && token) {
			document.cookie = `${key}=${token};SameSite=None;Secure`
			console.log(key, token)
		}
	}

	const getToken = () => {
		const iframe = authIFrame.current
		if (iframe.contentWindow) {
			iframe.contentWindow.postMessage(
				{
					action: 'get',
					key: 'next-auth.session-token',
				},
				'*'
			)
		}
	}

	return (
		<>
			<iframe
				ref={authIFrame}
				title="auth-jwt"
				height="0"
				width="0"
				src="http://auth.localhost:3000/jwt"
				onLoad={() => getToken()}
			/>
		</>
	)
}

export default IFrame
