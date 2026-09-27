''

import { useContext, useEffect, useRef } from "react"
import { Context } from "./App"
import { Menu } from "./menu"
import { Order } from "./order"
import { animateHead } from "./animation"
import { Pay } from "./payment"
export const Home=function(){
    return <div className="home">
<Head></Head>
<Content></Content>
<Lineup></Lineup>
<Points></Points>
<OurStory></OurStory>
<Footer></Footer>
    </div>
}
 export const Head=function(){
    const vals=useContext(Context)
    const arr=['menu','order','payment','reward','our story']

    // 3-D entrance animation – no logic changes below this block
    const headRef=useRef(null)
    useEffect(()=>{ animateHead(headRef.current) },[])

    const swap=(e)=>{
        console.log(e.target.textContent)
        e.target.textContent==='menu' &&vals.setPage(<Menu></Menu>)
        e.target.textContent==='order' && vals.setPage(<Order></Order>)
        e.target.textContent==='payment' && vals.setPage(<Pay></Pay>)
    }
    return<div className="head" ref={headRef}>
      
{arr.map((el,i)=><span className="head__link" onClick={swap} key={i}>{el}</span>)}
    </div>
}
const Content=function(){
    const teams=['Green Grove',
'Sunny Side',
'Pulse Juice',
'Fresh Fleet',
'Vitality Co']
    return <div className="content">
        <h1 className="content__title">Cold-pressed juice,</h1>
        <h1 className="content__title content__title--accent">squeezed fresh daily.</h1>
        <p className="content__copy">No concentrate. No added sugar. Just produce from farms within 90 miles, pressed the morning you drink it.</p>
        <div className="content__actions">
          <button className="content__button content__button--primary">order for pickup</button>
          <button className="content__button content__button--secondary">Find a Store</button>
          </div>
        <div className="content__teams">
          {teams.map((e,i)=><span key={i}>{e}</span>)}
        </div>
        </div>
}
const Lineup=function(){
    const best=[{catogery:'Best seller',image:"",ing:'Kale, cucumber, green apple, lemon, ginger'
,price:8.5
}]
    return <div className="lineup">
          <h1 className="lineup__title">This week's lineup</h1>
{best.map(e=><div className="lineup__card">
    <span className="lineup__badge">{e.catogery}</span>
    <img className="lineup__image" src={e.image} alt=""></img>
    <p className="lineup__ingredients">{e.ing}</p>
    <h2 className="lineup__price">{e.price}$</h2>
</div>)}
    </div>
}
const Points=function(){
    return<div className="points">
        <div className="points__details">
            <h1 className="points__title">Earn 1 point for every $1 you spend.</h1>
            <p className="points__copy">Join free. Reach 50 points and your next 16 oz juice is on us. Points never expire while you order at least once every 6 months.
Join Rewards</p>
<button className="points__button">Join Rewards</button>
        </div>
        <div className="points__balance">
            <h2>142 <span>points</span></h2>
            <Bar></Bar>
        </div>
    </div>
}
const Bar=function(){
    return<div className="progress" aria-label="142 of 150 points">
        <div className="progress__track"><div className="progress__fill"></div></div>
        <div className="progress__labels">
        <span>0</span>
        <span>50</span>
        <span>100</span>
        <span>150</span>
        </div>
    </div>
}
const OurStory=function(){
    return <div className="story">
        <div className="story__media">
            <img className="story__image" src="" alt="chef"></img>
        </div>
        <div className="story__content">
            <h3 className="story__title">We started with one press and a farmers market stall.</h3>
            <p className="story__copy">In 2016, Marisol Vega and Dev Okonkwo were pressing juice in a rented commercial kitchen in East Austin and selling it from a folding table on Saturdays. Ten years later we run seven shops, and every bottle still gets pressed the morning it's sold.
<span>Read our story</span></p>
        </div>
    </div>
}

const Footer=function(){
    return<footer className="footer">
        <h3 className="footer__title">One email a week. What we're pressing and what's on sale.</h3>
        <p className="footer__copy">We send one email a week. Unsubscribe any time.</p>
    </footer>
}
