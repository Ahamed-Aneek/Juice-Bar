import logo from './logo.svg';
import './App.css';
import { Home } from './home';
import { createContext,useEffect,useState } from 'react';
export const Context=createContext()
function App() {
  const[page,setPage]=useState(<Home></Home>)
  const [juices,setJuices]=useState([])
  const[cart,setCart]=useState(JSON.parse(localStorage.getItem('cart'))||[])
  const[curr,setCurr]=useState('All')
  const[Payees,setPayees]=useState(JSON.parse(localStorage.getItem('payees'))||[])
  const[currCard,setCurrCard]=useState()
  useEffect(()=>{
    const getJuice=async function(){
      const res=await fetch('juice.json')
      const data=await res.json()
      console.log(data)
      setJuices(data)
    }
    getJuice()
  },[])
  useEffect(()=>{
    localStorage.setItem('cart',JSON.stringify(cart))
  },[cart])
  useEffect(()=>{
    localStorage.setItem('payees',JSON.stringify(Payees))
  },[Payees])
  return (
    <div className="App">
      <Context value={{page,setPage,juices,cart,setCart,setJuices,curr,setCurr,Payees,setPayees,currCard,setCurrCard}}>
        {page}
      </Context>
    
    </div>
  );
}

export default App;
