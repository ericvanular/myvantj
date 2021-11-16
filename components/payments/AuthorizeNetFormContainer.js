import React from 'react'
import Accept from '@/lib/utils/accept-js'

const AuthorizeNetScriptUrl = {
    Production: 'https://js.authorize.net/v1/Accept.js',
    Sandbox: 'https://jstest.authorize.net/v1/Accept.js'
}

export default class FormContainer extends React.Component {
    state = this.props.initialState || {
        apiErrors: [],
        focused: undefined,
        values: { cardNumber: '', cvc: '', expiryDate: '' }
    }

    constructor(props) {
        super(props)
        this.submitHandler = this.submitHandler.bind(this)
        this.changeHandler = this.changeHandler.bind(this)
        this.blurHandler = this.blurHandler.bind(this)
        this.focusHandler = this.focusHandler.bind(this)
    }

    componentDidMount() {
        const script = document.createElement('script')
        switch (this.props.environment) {
        case 'production':
            script.src = AuthorizeNetScriptUrl.Production
            break
        case 'sandbox':
            script.src = AuthorizeNetScriptUrl.Sandbox
            break
        }
        document.head.appendChild(script)
    }

    componentWillUnmount() {
        const head = document.head
        const scripts = head.getElementsByTagName('script')
        Array.from(scripts)
        .filter(
            script =>
            script.src === AuthorizeNetScriptUrl.Production ||
            script.src === AuthorizeNetScriptUrl.Sandbox
        )
        .forEach(injectedScript => head.removeChild(injectedScript))
    }
    submitHandler() {
        const authData = {
            apiLoginID: this.props.apiLoginId,
            clientKey: this.props.clientKey
        }
        const [month, year] = this.state.values.expiryDate.match(/.{1,2}/g)
        const cardData = {
            cardCode: this.state.values.cvc,
            cardNumber: this.state.values.cardNumber.replace(/\s/g, ''),
            month,
            year
        }
        const secureData = { authData, cardData }
        return Accept.dispatchData(secureData)
        .then(response => {
            if (this.props.onSuccess) {
            this.props.onSuccess(response, this.state.values)
            }

            this.setState({
            values: { cvc: '', cardNumber: '', expiryDate: '' }
            })

            return response
        })
        .catch(response => {
            this.setState({
            apiErrors: response.messages.message.map((err) => err.text)
            })
            if (this.props.onError) {
            this.props.onError(response)
            }
            throw response
        })
    }

    changeHandler(field, fieldValue) {
        this.setState(oldState => ({
        ...oldState,
        values: {
            ...oldState.values,
            [field]: fieldValue
        }
        }))
    }

    focusHandler(field, e) {
        this.setState({ focused: field })
        return e
    }

    blurHandler(e) {
        this.setState({ focused: undefined })
        return e
    }

    render() {
        const View = this.props.render || this.props.component || this.props.children
        return View ? (
            <div>
                <View
                    amount={this.props.amount}
                    apiErrors={this.state.apiErrors}
                    focused={this.state.focused}
                    handleChange={this.changeHandler}
                    handleFocus={this.focusHandler}
                    handleBlur={this.blurHandler}
                    handleSubmit={this.submitHandler}
                />
            </div>
        ) : null
    }
}