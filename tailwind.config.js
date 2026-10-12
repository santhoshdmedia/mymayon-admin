/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html","./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        navy:  { 50:"#f0f5fc",100:"#e0ecfb",200:"#bed3f4",300:"#83ace8",400:"#4b82d9",500:"#2260be",600:"#174a96",700:"#0f3775",800:"#0a2959",900:"#071f43" },
        gold:  { 50:"#fdfbf7",100:"#faf2df",200:"#f4e3be",300:"#ebd094",400:"#dfbb66",500:"#d4a359",600:"#bc8a38",700:"#986c24" },
        forest: { 50:"#f0f7f3",100:"#deede4",200:"#beddcb",300:"#95c5ac",400:"#66a788",500:"#3f8967",600:"#2a6e4f",700:"#1c573d",800:"#165b3d",900:"#0e3b2b" },
        cream: "#faf8f4",
      },
      fontFamily: { sans:["Inter","system-ui","sans-serif"], display:["'Playfair Display'","serif"] },
    },
  },
  plugins: [],
};

