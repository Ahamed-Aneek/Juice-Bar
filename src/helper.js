''
export const calc=function(arr,e){
    return arr.filter(el=>el.id===e.id).map(e=>e.price).reduce((acc,curr)=>acc+curr)
}
export const str=function(num){
   return `${num.slice(0,4)} ${num.slice(4,8)} ${num.slice(8,12)} ${num.slice(12,16)}`
}

export const slash=function(v){
   
    let val=v.target.value.padEnd(3,'/').slice(0,3)
    // val=v.target.value.slice(2,4)
     console.log(val)
    return val
}