import locations from '@/data/bangladesh.json';
import lawn from '@/assets/lawn.jpg';
import scarf from '@/assets/scarf.jpg';
import tote from '@/assets/tote.jpg';
export const divisions = ['Dhaka','Chattogram','Rajshahi','Khulna','Barishal','Sylhet','Rangpur','Mymensingh'];
export const locationData: Record<string, Record<string, string[]>> = locations;
export const districtsFor = (division: string) => Object.keys(locationData[division] ?? {}).sort();
export const areasFor = (division: string, district: string) => [...(locationData[division]?.[district] ?? []), 'Other Area'];
export type Product = {id: string; name: string; image: string; color: string; size: string; price: number; quantity: number; selected: boolean};
export const initialCart: Product[] = [
 {id:'1',name:'Zebaish Digital and Embroidered Lawn — Premium Three-Piece Collection with Detailed Floral Work',image:lawn,color:'Multicolor',size:'Standard',price:2350,quantity:1,selected:true},
 {id:'2',name:'Classic Everyday Cotton Scarf with Soft Breathable Fabric',image:scarf,color:'Olive',size:'One size',price:850,quantity:1,selected:true},
 {id:'3',name:'Minimal Everyday Tote Bag — Durable Reusable Shopping Bag',image:tote,color:'Sand',size:'Medium',price:450,quantity:1,selected:true}
];
export type Address = {fullName:string;phone:string;division:string;district:string;area:string;otherArea:string;street:string;landmark:string;notes:string;label:'Home'|'Office'};
export const blankAddress: Address = {fullName:'',phone:'',division:'',district:'',area:'',otherArea:'',street:'',landmark:'',notes:'',label:'Home'};
export const paymentNames = {cod:'Cash on Delivery',bkash:'bKash',nagad:'Nagad',online:'Card / Online Payment'};
export type Payment = keyof typeof paymentNames;
export type Coupon = 'SHOLOK10'|'SAVE100'|null;
export const money = (value: number) => `৳ ${value.toLocaleString('en-BD',{maximumFractionDigits:2})}`;
export function delivery(division:string) {
 if (!divisions.includes(division)) return {fee:0,estimate:'Select your division to see the delivery estimate.',region:'Select your division to confirm delivery charge'};
 return division==='Dhaka' ? {fee:100,estimate:'Estimated delivery in 2–3 business days',region:'Delivery within Dhaka Division'} : {fee:150,estimate:'Estimated delivery in 3–7 business days',region:'Delivery outside Dhaka Division'};
}
export const clampQuantity = (quantity:number) => Math.min(20,Math.max(1,Math.trunc(quantity)||1));
export function totals(cart:Product[], division:string, coupon:Coupon) {
 const selected=cart.filter(p=>p.selected);
 const subtotal=selected.reduce((sum,p)=>sum+p.price*p.quantity,0);
 const count=selected.reduce((sum,p)=>sum+p.quantity,0);
 const shipping=delivery(division).fee;
 const discount=coupon==='SHOLOK10' ? Math.round(subtotal*10)/100 : coupon==='SAVE100' ? Math.min(100,subtotal) : 0;
 return {subtotal,count,shipping,discount,total:Math.max(0,subtotal+shipping-discount)};
}
export function validateCoupon(input:string, hasItems:boolean): {coupon:Coupon;message:string;valid:boolean} {
 const code=input.trim().toUpperCase();
 if (!code) return {coupon:null,message:'Enter a promo code first.',valid:false};
 if (!hasItems) return {coupon:null,message:'Select at least one product before applying a code.',valid:false};
 if (code==='SHOLOK10'||code==='SAVE100') return {coupon:code,message:code==='SHOLOK10'?'Code applied — 10% discount on items.':'Code applied — ৳ 100 discount on items.',valid:true};
 return {coupon:null,message:'This promo code is invalid.',valid:false};
}
export const validPhone = (phone:string) => /^(?:\+?880|0)1[3-9]\d{8}$/.test(phone.replace(/[\s()-]/g,''));
export function validateAddress(a:Address): Partial<Record<keyof Address,string>> {
 const errors: Partial<Record<keyof Address,string>> = {};
 if (!a.fullName.trim()) errors.fullName='Please enter your full name.';
 if (!validPhone(a.phone)) errors.phone='Enter a valid Bangladesh mobile number (01XXXXXXXXX or +8801XXXXXXXXX).';
 if (!divisions.includes(a.division)) errors.division='Please select your division.';
 if (!districtsFor(a.division).includes(a.district)) errors.district='Please select a district in your division.';
 if (!a.area || !areasFor(a.division,a.district).includes(a.area)) errors.area='Please select your area / upazila.';
 if (a.area==='Other Area'&&!a.otherArea.trim()) errors.otherArea='Please enter your locality.';
 if (!a.street.trim()) errors.street='Please enter your house, road or block details.';
 return errors;
}
export type Order = {id:string;date:string;address:Address;products:Product[];payment:Payment;coupon:Coupon;status:'Simulated';subtotal:number;count:number;shipping:number;discount:number;total:number};
export function orderId(existing:Pick<Order,'id'>[], date=new Date()) {
 const day=`${date.getFullYear()}${String(date.getMonth()+1).padStart(2,'0')}${String(date.getDate()).padStart(2,'0')}`;
 const prefix=`SHL-${day}-`;
 const sequence=Math.max(0,...existing.filter(o=>o.id.startsWith(prefix)).map(o=>Number(o.id.slice(prefix.length))||0))+1;
 return `${prefix}${String(sequence).padStart(6,'0')}`;
}
export const keys={cart:'sholok_cart',address:'sholok_checkout_address',preferences:'sholok_checkout_preferences',coupon:'sholok_checkout_coupon',orders:'sholok_orders',state:'sholok_checkout_state'};
export function readStorage<T>(key:string,fallback:T,valid:(value:unknown)=>boolean=()=>true):T {
 try {const raw=localStorage.getItem(key);if(!raw)return fallback;const record=JSON.parse(raw);return record.version===1&&valid(record.data)?record.data as T:fallback;} catch {return fallback;}
}
export function writeStorage(key:string,data:unknown):boolean {
 try {localStorage.setItem(key,JSON.stringify({version:1,data}));return true;}catch{return false;}
}
export function removeStorage(key:string) {try{localStorage.removeItem(key);}catch{/* Storage may be unavailable. */}}
export function isCart(value:unknown):value is Product[] {
 return Array.isArray(value)&&value.every(p=>p&&typeof p.id==='string'&&typeof p.name==='string'&&typeof p.color==='string'&&typeof p.size==='string'&&typeof p.image==='string'&&Number.isFinite(p.price)&&p.price>=0&&Number.isInteger(p.quantity)&&p.quantity>=1&&p.quantity<=20&&typeof p.selected==='boolean');
}
export function isAddress(value:unknown):value is Address {return !!value&&typeof value==='object'&&Object.keys(blankAddress).every(key=>typeof (value as Record<string,unknown>)[key]==='string')&&['Home','Office'].includes((value as Address).label);}
export function isOrders(value:unknown):value is Order[] {return Array.isArray(value)&&value.every(o=>o&&typeof o.id==='string'&&typeof o.date==='string'&&isAddress(o.address)&&isCart(o.products)&&o.payment in paymentNames&&Number.isFinite(o.total));}
