''

import { useContext, useEffect, useRef } from "react"
import { Context } from "./App"
import { Head, Home } from "./home"
import { animateJuices, animateAddToCart, particleBurst, animateFallToCart } from "./animation"

export const Menu = function () {
    return (
        <div className="menu">
            <Head></Head>
            <Search />
            <Catogery />
            <Juices></Juices>
            <Aboutus></Aboutus>
            <Rights></Rights>
            
        </div>
    )
}

const Search = function () {
    const vals=useContext(Context)
    return (
        <div className="search">
            <span className="search__brand">Pulp &amp; Press</span>
            <div className="search__field">
                <span className="search__icon" aria-hidden="true"></span>
                <input className="search__input" type="text" placeholder="Search fresh juices" aria-label="Search fresh juices" />
            </div>
            <div className="search__cart"><span>cart:{vals.cart.length}</span></div>
        </div>
    )
}

const Catogery = function () {
    const vals = useContext(Context)
    const unique = ['All',...new Set(vals.juices.map((e) => e.category))]
const fil=(e)=>{
    if(e.target.textContent){
        vals.setCurr(e.target.textContent)
console.log(e.target.textContent)
    }
}
    return (
        <div className="category">
            {unique.map((e, i) => (
                <span
                    key={i}
                    className={`category__item${vals.curr === e ? ' category__item--active' : ''}`}
                    onClick={fil}
                >
                    {e}
                </span>
            ))}
        </div>
    )
}
const Juices=function(){
    const vals=useContext(Context)

    // 3-D entrance animation – no logic changes below this block
    const juicesRef=useRef(null)
    useEffect(()=>{ animateJuices(juicesRef.current) },[vals.juices])

    // 3-D Add-to-cart button & fall-into-cart animation – event delegation, addToCart untouched
    useEffect(()=>{
        const el=juicesRef.current
        if(!el) return
        const onCartClick=(e)=>{
            const btn=e.target.closest('.juice-card__button')
            if(btn){
                // animateAddToCart(btn)
                particleBurst(btn)          // particle burst – no logic touched
                animateFallToCart(btn)      // Anime.js fall into cart – no logic touched
            }
        }
        el.addEventListener('click',onCartClick)
        return ()=> el.removeEventListener('click',onCartClick)
    },[])

    const addToCart=(e)=>{
        vals.setCart(prev=>[...prev,e])
        // vals.setCurr(e)
    }
    const filtredJ=vals.curr!=='All'?vals.juices.filter(e=>e.category===vals.curr):vals.juices
    console.log(filtredJ)
    return <div className="juices" ref={juicesRef}>
        {filtredJ.map((e,i)=>{
            return <div className="juice-card">
                <img className="juice-card__image" src={e.image}  alt="img"></img>
                <div className="juice-card__content">
                    <span className="juice-card__name">{e.name}</span>
                    <Ing ing={e.ingredients}></Ing>
                    <div className="juice-card__footer">
                        <div>
                            <h4 className="juice-card__price">{e.price}Rs</h4>
                            <p className="juice-card__size">{e.size}</p>
                        </div>
                        <button className="juice-card__button" onClick={()=>{addToCart(e)}}>Add to cart</button>
                    </div>
                </div>
            </div>
        })}
    </div>
}
const Ing=function({ing}){
    return <div className="ingredients">
        {ing.map((e)=><span className="ingredients__item">{e}</span>)}
    </div>
}
const Aboutus=function(){
    return<div className="about-us">
        <span className="about-us__eyebrow">Good to know</span>
        <h5 className="about-us__brand">Pulp &amp; Press</h5>
        <p className="about-us__copy">All juices are pressed in a facility that also handles tree nuts, peanuts, and sesame. Ask a team member about specific allergens.</p>
        <div className="about-us__divider"></div>
        <p className="about-us__contact">Questions? <span>Call (512) 555-0143</span> or <span>email hello@pulpandpress.com</span></p>
    </div>
}
const Rights=function(){
    return<footer className="rights">
        <span>© 2026 Ahamed Aneek. All rights reserved.</span>
        <span>Privacy
</span>
<span>Terms</span>
<span>Accessibility</span>
    </footer>
}
