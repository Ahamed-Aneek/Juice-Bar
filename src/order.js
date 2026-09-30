import { useContext, useEffect, useRef } from "react"
import { Context } from "./App"
import { Head } from "./home"
import * as fun from 'lodash'
import { calc } from "./helper"
import { animateSubtotal } from "./animation"
export const Order=function(){
    return <main className="order">
        <Head></Head>
        <Items></Items>
        <SubTotal></SubTotal>
    </main>
}
export const Items=function(){
     const vals=useContext(Context)
     const clearAll=()=>{
        vals.setCart([])
     }
     const jcs=fun.uniqBy(vals.cart,'id')
     const remove=(e)=>{
        const newArr=jcs.filter(el=>el.id!==e.id)
        console.log(newArr)
        vals.setCart(newArr)
     }
return <section className="order-items">
<div className="order-items__header">
    <div>
        <span className="order-items__eyebrow">Your selection</span>
        <h1 className="order-items__title">Your order</h1>
    </div>
    <div className="order-items__actions">
        <span className="order-items__count"><strong>{vals.cart.length}</strong> items</span>
        <button className="order-items__clear" onClick={clearAll}>clear all</button>
    </div>
</div>
<div className="order-items__list">
{jcs.map((e,i)=>{
  return  <article className="order-item" key={i}>
<div className="order-item__media">
<img className="order-item__image" src={e.image} alt={e.name}></img>
</div>
<div className="order-item__details">
    <span className="order-item__label">Fresh pressed</span>
    <span className="order-item__name">{e.name}</span>
    <span className="order-item__size">{e.size}</span>
    <Btns e={e}></Btns>
</div>
<div className="order-item__total">
    <span className="order-item__total-label">Item total</span>
    <span className="order-item__price">{calc(vals.cart,e)}Rs</span>
    <button className="order-item__remove" onClick={()=>remove(e)}>remove</button>
</div>
    </article>
})}
</div>
</section>
}
const Btns=function({e}){
    const vals=useContext(Context)
    const filtered=vals.cart.filter((el,i)=>{
        return el.id===e.id
    })

    return <div className="order-item__quantity">
        <span className="order-item__quantity-label">Qty</span>
        <span className="order-item__quantity-value">{filtered.length}</span>
    </div>

}
const SubTotal=function(){
    const vals=useContext(Context)

    // 3-D counting animation – no logic changes below this block
    const amountRef=useRef(null)
    useEffect(()=>{
        const total=vals.cart.length>0
            ? vals.cart.map(e=>e.price).reduce((acc,curr)=>acc+curr)
            : 0
        animateSubtotal(amountRef.current, total)
    },[vals.cart])

    return <section className="order-subtotal">
        <div className="order-subtotal__heading">
            <span className="order-subtotal__eyebrow">Ready when you are</span>
            <span className="order-subtotal__title">Order summary</span>
        </div>
        <div className="order-subtotal__total">
            <span className="order-subtotal__label">Subtotal</span>
            <span className="order-subtotal__amount" ref={amountRef}>
{vals.cart.length >0 ?vals.cart.map(e=>e.price).reduce((acc,curr)=>acc+curr):0}<small>Rs</small>
            </span>
        </div>
    </section>
}
