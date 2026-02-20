
let price=0,dataSeries=[],pointer=0,candles=[];
let balance=100000,position=0,avgPrice=0;
let openOrders=[],tradeHistory=[];

const ctx=document.getElementById("chart").getContext("2d");
const chart=new Chart(ctx,{
type:"line",
data:{labels:[],datasets:[{data:[],borderColor:"#00e5ff",pointRadius:0}]},
options:{animation:false,plugins:{legend:{display:false}}}
});

function showTab(id,e){
document.querySelectorAll(".tabContent").forEach(d=>d.style.display="none");
document.getElementById(id).style.display="block";
document.querySelectorAll(".tabBtn").forEach(b=>b.classList.remove("active"));
e.target.classList.add("active");
}

function loadCSV(){
const file=document.getElementById("csvFile").files[0];
if(!file) return alert("Upload CSV");
const reader=new FileReader();
reader.onload=e=>parseCSV(e.target.result);
reader.readAsText(file);
}

function parseCSV(text){
const rows=text.split("\n");
dataSeries=[];
for(let i=1;i<rows.length;i++){
let cols=rows[i].split(",");
let close=parseFloat(cols[4]);
if(!isNaN(close)) dataSeries.push(close);
}
pointer=0; loop();
}

function buyMarket(){
let q=+qty().value;
let cost=q*price;
if(balance>=cost){
balance-=cost;
avgPrice=((avgPrice*position)+(price*q))/(position+q);
position+=q;
logTrade("BUY",q,price);
}
}

function sellMarket(){
let q=+qty().value;
if(position>=q){
balance+=q*price;
position-=q;
logTrade("SELL",q,price);
if(position===0) avgPrice=0;
}
}

function buyLimit(){
openOrders.push({type:"buy",qty:+qty().value,price:+limit().value});
}
function sellLimit(){
openOrders.push({type:"sell",qty:+qty().value,price:+limit().value});
}

function matchOrders(){
openOrders.forEach((o,i)=>{
if(o.type==="buy" && price<=o.price){
balance-=o.qty*o.price;
position+=o.qty;
avgPrice=o.price;
logTrade("LIMIT BUY",o.qty,o.price);
openOrders.splice(i,1);
}
if(o.type==="sell" && price>=o.price){
balance+=o.qty*o.price;
position-=o.qty;
logTrade("LIMIT SELL",o.qty,o.price);
openOrders.splice(i,1);
}
});
}

function renderOrderBook(){
let div=document.getElementById("orderbook");
div.innerHTML="";
for(let i=0;i<8;i++){
let bid=(price-(Math.random()*5)).toFixed(2);
let ask=(price+(Math.random()*5)).toFixed(2);
div.innerHTML+=`<div class="bid">${bid}</div><div class="ask">${ask}</div>`;
}
}

function qty(){return document.getElementById("qty")}
function limit(){return document.getElementById("limit")}

function logTrade(t,q,p){
tradeHistory.push({t,q,p});
document.getElementById("trades").innerHTML+=`${t} ${q} @ ${p.toFixed(2)}<br>`;
}

function renderOrders(){
let div=document.getElementById("orders");
div.innerHTML="";
openOrders.forEach(o=>{
div.innerHTML+=`${o.type.toUpperCase()} ${o.qty} @ ${o.price}<br>`;
});
}

function renderPositions(){
document.getElementById("positions").innerHTML=`Qty ${position}<br>Avg ${avgPrice.toFixed(2)}`;
}

function updateUI(){
document.getElementById("bal").innerText=balance.toFixed(2);
document.getElementById("balTop").innerText=balance.toFixed(2);
document.getElementById("pos").innerText=position;
document.getElementById("avg").innerText=avgPrice.toFixed(2);
let pnl=(position*(price-avgPrice));
document.getElementById("pnl").innerText=pnl.toFixed(2);
document.getElementById("pnlTop").innerText=pnl.toFixed(2);
}

function loop(){
if(pointer>=dataSeries.length) return;
price=dataSeries[pointer++];
candles.push(price);
if(candles.length>300) candles.shift();

matchOrders();
renderOrderBook();

chart.data.labels=candles.map((_,i)=>i);
chart.data.datasets[0].data=candles;
chart.update();

updateUI();
renderOrders();
renderPositions();

setTimeout(loop,200);
}