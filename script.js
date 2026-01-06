function togglePass(){
  password.type = password.type === "password" ? "text" : "password";
}

// ROT13
const rot13 = s => s.replace(/[a-zA-Z]/g,c=>{
  let n=c.charCodeAt(0)+13;
  return String.fromCharCode((c<="Z"?90:122)>=n?n:n-26);
});

// Caesar
const caesar = (s,n) => s.replace(/[a-zA-Z]/g,c=>{
  let b=c<="Z"?65:97;
  return String.fromCharCode((c.charCodeAt(0)-b+n+26)%26+b);
});

// Vigenere
function vigenere(str,key,dec=false){
  if(!key) return str;
  let j=0;
  return str.replace(/[a-zA-Z]/g,c=>{
    let k=key[j++%key.length].toLowerCase().charCodeAt(0)-97;
    if(dec) k=26-k;
    let b=c<="Z"?65:97;
    return String.fromCharCode((c.charCodeAt(0)-b+k)%26+b);
  });
}

// XOR
function xorCipher(str,key){
  if(!key) return str;
  let o="";
  for(let i=0;i<str.length;i++)
    o+=String.fromCharCode(str.charCodeAt(i)^key.charCodeAt(i%key.length));
  return o;
}

// Shuffle
const shuffle=s=>[...s].map((c,i)=>String.fromCharCode((c.charCodeAt(0)+(i%7))%256)).join("");
const unshuffle=s=>[...s].map((c,i)=>String.fromCharCode((c.charCodeAt(0)-(i%7)+256)%256)).join("");

// Base32
const b32="ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
const b32e=s=>{
  let bits="",o="";
  for(let c of s) bits+=c.charCodeAt(0).toString(2).padStart(8,"0");
  for(let i=0;i<bits.length;i+=5)
    o+=b32[parseInt(bits.substr(i,5).padEnd(5,"0"),2)];
  return o;
};
const b32d=s=>{
  let bits="",o="";
  for(let c of s) bits+=b32.indexOf(c).toString(2).padStart(5,"0");
  for(let i=0;i<bits.length;i+=8){
    let b=bits.substr(i,8);
    if(b.length===8) o+=String.fromCharCode(parseInt(b,2));
  }
  return o;
};

// Morse / MCODE (formerly MC64)
const morse={A:".-",B:"-...",C:"-.-.",D:"-..",E:".",F:"..-.",G:"--.",H:"....",
I:"..",J:".---",K:"-.-",L:".-..",M:"--",N:"-.",O:"---",P:".--.",
Q:"--.-",R:".-.",S:"...",T:"-",U:"..-",V:"...-",W:".--",
X:"-..-",Y:"-.--",Z:"--..",0:"-----",1:".----",2:"..---",3:"...--",
4:"....-",5:".....",6:"-....",7:"--...",8:"---..",9:"----."};

const rev=Object.fromEntries(Object.entries(morse).map(([k,v])=>[v,k]));
const t2m=t=>t.toUpperCase().split(" ").map(w=>w.split("").map(c=>morse[c]||"").join(" ")).join(" / ");
const m2t=m=>m.split(" / ").map(w=>w.split(" ").map(c=>rev[c]||"").join("")).join(" ");

function mcodeEncode(d){
  d=t2m(d); d=btoa(d); d=b32e(d);
  d=t2m(d); d=btoa(d); d=b32e(d);
  return btoa(d);
}
function mcodeDecode(d){
  d=atob(d); d=b32d(d); d=atob(d);
  d=m2t(d); d=b32d(d); d=atob(d);
  return m2t(d);
}

// ===== MAIN =====
function encode(){
  let p=password.value;
  let d=input.value;

  d = mcodeEncode(d);

  if(!p){
    // EMPTY PASSWORD → Caesar +10
    d = caesar(d,10);
  } else {
    // PASSWORD MODE
    d = vigenere(d,p);
    d = xorCipher(d,p);
    d = shuffle(d);
  }

  // ALWAYS at end
  d = caesar(d,2);
  d = caesar(d,3);

  output.value = d;
}

function decode(){
  let p=password.value;
  let d=input.value;

  // reverse end
  d = caesar(d,-3);
  d = caesar(d,-2);

  if(!p){
    d = caesar(d,-10);
  } else {
    d = unshuffle(d);
    d = xorCipher(d,p);
    d = vigenere(d,p,true);
  }

  d = mcodeDecode(d);
  output.value = d; // wrong password → gibberish
}

