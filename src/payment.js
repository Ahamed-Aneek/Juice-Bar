import { useContext, useRef, useState } from "react"
import { Head } from "./home"
import { flipCard, animateCashPayment, animatePaymentSuccess } from "./animation"
import { Context } from "./App"
import * as fun from 'lodash'
export const Pay = function () {
    return (
        <div className="pay">
            <Head></Head>
            <div className="pay__container">
                <Methods></Methods>
                <NewCard></NewCard>
                <Summary></Summary>
            </div>
        </div>
    )
}

const Methods = function () {
    const vals = useContext(Context)
    return (
        <div className="payment-methods">
            <span className="payment-methods__eyebrow">Payment Setup</span>
            <h5 className="payment-methods__title">Saved Payment methods</h5>
            <div className="payment-methods__list">
                <div className="payment-method-card payment-method-card--active">
                    <div className="payment-method-card__info">
                        <span className="payment-method-card__icon" aria-hidden="true">💳</span>
                        <div>
                            <span className="payment-method-card__name">Credit / Debit Card</span>
                            <span className="payment-method-card__desc">Visa, Mastercard, RuPay &amp; Amex</span>
                        </div>
                    </div>
                    <span className="payment-method-card__badge">Selected</span>
                </div>
                {vals.Payees && vals.Payees.map((e, index) => <Cards key={index} e={e}></Cards>)}
            </div>
        </div>
    )
}

const Cards = function ({ e }) {
    const vals = useContext(Context)
    const select = () => {
        vals.setCurrCard(e)
    }
    return (
        <div className="saved-card" onClick={select}>
            <div className="saved-card__main">
                <div className="saved-card__icon-wrap">
                    <span className="saved-card__icon" aria-hidden="true">💳</span>
                </div>
                <div className="saved-card__details">
                    <div className="saved-card__header-line">
                        <span className="saved-card__brand">Visa</span>
                        <span className="saved-card__num">{e.cardNum.slice(0,4).padEnd(16, '*')}</span>
                    </div>
                    <div className="saved-card__meta">
                        <span className="saved-card__name">{e.name}</span>
                        <span className="saved-card__divider">•</span>
                        <span className="saved-card__exp">Exp: {e.date}</span>
                    </div>
                </div>
            </div>
            <div className="saved-card__status" >
                <span className="saved-card__chip-status">Saved</span>
                <input type="radio" checked={vals.currCard && e.cvv === vals.currCard.cvv}></input>
            </div>
        </div>
    )
}
const NewCard = function () {
    const vals = useContext(Context)
    const [cardNum, setCardNum] = useState('')
    const [date, setDate] = useState()
    const [cvv, setCvv] = useState('')
    const [name, setName] = useState('')
    const cardRef = useRef(null)
    const h1 = (e) => {
        const rawDigits = e.target.value.replace(/\D/g, '').slice(0, 16)
        const formatted = rawDigits.match(/.{1,4}/g)?.join(' ') || ''
        setCardNum(formatted)
    }

    const h2 = (e) => {
        console.log('Aneek'.slice(0, 2).padEnd(5, '*'))
        const input = e.target.value
        if (input.length === 2 && date.length === 3 && date.endsWith('/')) {
            setDate(input.slice(0, 1))
            return
        }
        const digits = input.replace(/\D/g, '').slice(0, 4)
        if (digits.length >= 2) {
            setDate(`${digits.slice(0, 2)}/${digits.slice(2)}`)
        } else {
            setDate(digits)
        }
    }

    const h3 = (e) => {
        setCvv(e.target.value)
    }

    const h4 = (e) => {
        setName(e.target.value)
    }
    const save = () => {
        if (!cardNum || !date || !cvv || !name) return
        vals.setPayees(prev => [...prev, { cardNum, date, cvv, name }])

        setCvv('')
        setDate('')
        setCardNum('')
        setName('')
    }
    return (
        <div className="new-card">
            <div className="new-card__header">
                <span className="new-card__eyebrow">Add New Card</span>
                <h3 className="new-card__title">Card Details</h3>
                <p className="new-card__subtitle">Your card information is end-to-end encrypted with 256-bit SSL security.</p>
            </div>

            {/* Virtual Card 3-D Flippable Container */}
            <div className="new-card__preview-wrapper">
                <div className="new-card__preview" ref={cardRef}>
                    {/* Front Face */}
                    <div className="new-card__side new-card__side--front">
                        <div className="new-card__preview-top">
                            <span className="new-card__chip"></span>
                            <span className="new-card__brand">Pulp &amp; Press</span>
                        </div>
                        <div className="new-card__preview-number">
                            {cardNum || '•••• •••• •••• ••••'}
                        </div>
                        <div className="new-card__preview-bottom">
                            <div className="new-card__preview-col">
                                <span className="new-card__preview-label">CARD HOLDER</span>
                                <span className="new-card__preview-val">{name || 'YOUR NAME'}</span>
                            </div>
                            <div className="new-card__preview-col">
                                <span className="new-card__preview-label">EXPIRES</span>
                                <span className="new-card__preview-val">{date || 'MM/YY'}</span>
                            </div>
                        </div>
                    </div>

                    {/* Back Face */}
                    <div className="new-card__side new-card__side--back">
                        <div className="new-card__mag-stripe"></div>
                        <div className="new-card__back-body">
                            <div className="new-card__cvv-row">
                                <span className="new-card__cvv-label">CVV / CVC</span>
                                <div className="new-card__cvv-strip">
                                    <span className="new-card__cvv-val" >{cvv ? cvv.slice(0, 3) || cvv : '•••'}</span>
                                </div>
                            </div>
                            <div className="new-card__back-footer">
                                <span className="new-card__brand-back">✦ Pulp &amp; Press</span>
                                <p className="new-card__back-disclaimer">256-bit SSL encrypted • Authorized Signature</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Form Fields - with original labels & input specs intact */}
            <div className="new-card__form">
                <div className="new-card__field">
                    <span className="new-card__label">card number</span>
                    <input
                        className="new-card__input"
                        type="text"
                        maxLength={19}
                        placeholder="e.g. 4532 8910 2345 6789"
                        value={cardNum}
                        onChange={h1}
                        inputMode="numeric"
                    />
                </div>
                <div className="new-card__row">
                    <div className="new-card__field">
                        <span className="new-card__label">Expiry Date</span>
                        <input
                            className="new-card__input"
                            type="text"
                            placeholder="MM/YY"
                            maxLength={5}
                            onChange={h2}
                            value={date}
                        />
                    </div>
                    <div className="new-card__field">
                        <span className="new-card__label">Security code</span>
                        <input
                            className="new-card__input"
                            type="number"
                            placeholder="CVV"
                            maxLength={3}
                            value={cvv.slice(0, 3)}
                            onChange={h3}
                            onFocus={() => flipCard(cardRef.current, true)}
                            onBlur={() => flipCard(cardRef.current, false)}
                        />
                    </div>
                </div>
                <div className="new-card__field">
                    <span className="new-card__label">Name on Card</span>
                    <input
                        className="new-card__input"
                        type="text"
                        placeholder="e.g. Ahamed Aneek"
                        value={name}
                        onChange={h4}
                    />
                </div>
                <button className="new-card__btn" type="button" onClick={save}>Save &amp; Pay Securely</button>
            </div>
        </div>
    )
}
const Summary = function () {
    const vals = useContext(Context)
    const item = fun.uniqBy(vals.cart, 'id')
    const count = Object.values(fun.countBy(vals.cart, 'id'))
    console.log(count)

    const total = vals.cart && vals.cart.length > 0
        ? vals.cart.map(e => e.price).reduce((acc, curr) => acc + curr, 0)
        : 0

    const handlePay = (e) => {
        if(!vals.currCard) return
        const btn = e.currentTarget
        const currentTotal = total
        animateCashPayment(btn, {
            currency: '₹',
            billCount: 8,
            coinCount: 10,
        })
        setTimeout(() => {
            animatePaymentSuccess({
                amount: currentTotal,
                onComplete: () => {
                    vals.setCart([])
                }
            })
        }, 550)
    }

    return (
        <div className="payment-summary">
            <div className="payment-summary__header">
                <span className="payment-summary__eyebrow">Order Review</span>
                <h4 className="payment-summary__title">Order Summary</h4>
            </div>

            {item.length === 0 ? (
                <div className="payment-summary__empty">
                    <span className="payment-summary__empty-icon" aria-hidden="true">🛒</span>
                    <p className="payment-summary__empty-text">No items in your cart</p>
                </div>
            ) : (
                <div className="payment-summary__list">
                    {item.map((e, i) => {
                        return (
                            <div className="payment-summary__item" key={e.id || i}>
                                <div className="payment-summary__item-info">
                                    <span className="payment-summary__name">{e.name}</span>
                                    <div className="payment-summary__meta">
                                        <span className="payment-summary__qty">
                                            qty: <strong>{count[i]}</strong>
                                        </span>
                                        <span className="payment-summary__divider">•</span>
                                        <span className="payment-summary__unit-price">
                                            price: {e.price} Rs
                                        </span>
                                    </div>
                                </div>
                                <div className="payment-summary__item-total">
                                    <span className="payment-summary__item-total-label">Subtotal</span>
                                    <span className="payment-summary__item-total-val">{(e.price * (count[i] || 1))} Rs</span>
                                </div>
                            </div>
                        )
                    })}
                </div>
            )}

            {item.length > 0 && (
                <div className="payment-summary__footer">
                    <div className="payment-summary__total-line">
                        <span className="payment-summary__total-label">Total Payable</span>
                        <span className="payment-summary__total-amount">
                            {total} <small>Rs</small>
                        </span>
                    </div>
                    <button className="payment-summary__pay-btn" type="button" onClick={handlePay}>
                        <span className="payment-summary__pay-btn-text">Pay {total} Rs</span>
                        <span className="payment-summary__pay-btn-icon" aria-hidden="true">→</span>
                    </button>
                </div>
            )}
        </div>
    )
}