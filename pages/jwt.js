import { useEffect } from 'react'

const domains = ['http://eric.localhost:3000', 'https://www.domaine2.com']

function getCookie(name) {
	const value = `; ${document.cookie}`
	const parts = value.split(`; ${name}=`)
	if (parts.length === 2) return parts.pop().split(';').shift()
}

const JWTPass = () => {
	useEffect(() => {
		window.addEventListener('message', messageHandler, false)

		// clean up
		return () => window.removeEventListener('message', messageHandler)
	}, [])

	const messageHandler = (event) => {
		//if (!domains.includes(event.origin)) return

		const { action, key, value } = event.data
		if (action == 'save') {
			window.localStorage.setItem(key, JSON.stringify(value))
		} else if (action == 'get') {
			let token = getCookie(key)
			event.source.postMessage(
				{
					action: 'returnData',
					key,
					token,
				},
				'*'
			)
		}
	}

	return (
		<>
			<div>Test</div>
		</>
	)
}

export default JWTPass
