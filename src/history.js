import { useContext } from "react"
import { Head } from "./home"
import { Context } from "./App"

export const History = function () {
    return (
        <div className="history">
            <Head></Head>
            <Header></Header>
            <Purchases></Purchases>
        </div>
    )
}

const Header = function () {
    const vals = useContext(Context);
    const spent = vals.history && vals.history.length > 0
        ? vals.history.map((e) => e.total).reduce((acc, curr) => acc + curr, 0)
        : 0;

    return (
        <header className="history-header">
            <div className="history-header__glow" aria-hidden="true"></div>
            <div className="history-header__banner">
                <div className="history-header__badge">
                    <span className="history-header__badge-icon">✦</span>
                    <span className="history-header__badge-text">Order Activity</span>
                </div>
                <h2 className="history-header__title">Purchase History</h2>
                <p className="history-header__subtitle">
                    Track your cold-pressed wellness journey, receipts, and lifetime spend.
                </p>
            </div>

            <div className="history-header__stats">
                <div className="history-header__stat-card history-header__stat-card--purchases">
                    <div className="history-header__icon-box">
                        <span className="history-header__stat-icon">🛍️</span>
                    </div>
                    <div className="history-header__stat-info">
                        <span className="history-header__stat-label">Total Purchases</span>
                        <div className="history-header__stat-value-group">
                            <span className="history-header__stat-value">{vals.history.length}</span>
                            <span className="history-header__stat-unit">Orders</span>
                        </div>
                        <span className="history-header__stat-subtext">Completed orders</span>
                    </div>
                </div>

                <div className="history-header__stat-card history-header__stat-card--spent">
                    <div className="history-header__icon-box">
                        <span className="history-header__stat-icon">💳</span>
                    </div>
                    <div className="history-header__stat-info">
                        <span className="history-header__stat-label">Total Spent</span>
                        <div className="history-header__stat-value-group">
                            <span className="history-header__stat-currency">Rs</span>
                            <span className="history-header__stat-value">{spent}</span>
                        </div>
                        <span className="history-header__stat-subtext">Lifetime investment</span>
                    </div>
                </div>
            </div>
        </header>
    )
}
const Purchases = function () {
    const vals = useContext(Context)
    return <div className="purchases">
        <div className="purchases__head">
            <span className="purchases__col purchases__col--num">Order No</span>
            <span className="purchases__col purchases__col--date">Date</span>
            <span className="purchases__col purchases__col--items">Items</span>
            <span className="purchases__col purchases__col--total">Total Amount</span>
        </div>
        <div className="purchases__body">
            {vals.history.map((e, i) => <P key={i} el={e}></P>)}
        </div>
        {/* <button onClick={()=>vals.setHistory([])}>remove</button> */}
    </div>
}
const P = function ({ el }) {
    return <div className="purchases__row">
        <span className="purchases__cell purchases__cell--num">#{el.num}</span>
        <span className="purchases__cell purchases__cell--date">{el.odrDate}</span>
        <span className="purchases__cell purchases__cell--items">
            {el.item.map((e, i) => <span key={i} className="purchases__item-tag">{e} {el.count[i]}</span>)}
        </span>
        <span className="purchases__cell purchases__cell--total">{el.total}Rs</span>
    </div>
}