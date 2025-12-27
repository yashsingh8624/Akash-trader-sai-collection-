const SHEET_ID = "1xgbzmBMSTUcOfcG2TQ9tk_hh_MV20kd0hzaUWANCkCg";
const URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json`;

let allProducts = [];
let cart = [];

fetch(URL)
.then(res=>res.text())
.then(text=>{
  const json = JSON.parse(text.substr(47).slice(0,-2));
  allProducts = json.table.rows.map(r=>({
    name:r.c[1]?.v,
    price:Number(r.c[2]?.v),
    image:r.c[3]?.v,
    desc:r.c[4]?.v,
    season:r.c[5]?.v
  }));
  showProducts(allProducts);
});

function showProducts(list){
  const div=document.getElementById("products");
  div.innerHTML="";
  list.forEach((p,i)=>{
    div.innerHTML+=`
    <div class="product-card">
      <img src="${p.image}">
      <h4>${p.name}</h4>
      <p>₹${p.price}</p>
      <input type="number" min="1" value="1" id="q${i}">
      <button onclick="addToCart(${i})">Add</button>
    </div>`;
  });
}

function filterSeason(s){
  if(s==="all") showProducts(allProducts);
  else showProducts(allProducts.filter(p=>p.season===s||p.season==="all"));
}

function addToCart(i){
  const qty=Number(document.getElementById("q"+i).value);
  const p=allProducts[i];
  const found=cart.find(x=>x.name===p.name);
  if(found) found.qty+=qty;
  else cart.push({name:p.name,price:p.price,qty});
}

function orderWhatsApp(){
  let msg="🛒 Order Details:%0A";
  let total=0;
  cart.forEach(p=>{
    let t=p.price*p.qty;
    total+=t;
    msg+=`${p.name} | Qty:${p.qty} | ₹${t}%0A`;
  });
  msg+=`Total: ₹${total}`;
  window.open("https://wa.me/918624091826?text="+msg);
}
