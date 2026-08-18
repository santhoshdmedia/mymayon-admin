/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html","./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        navy:  { 50:"#eef1f8",100:"#d8dff0",200:"#b2bfe1",300:"#8599cf",400:"#5d73bc",500:"#3d54a5",600:"#2c3f8a",700:"#1e2d6b",800:"#12294F",900:"#0a1a30" },
        gold:  { 50:"#fdf9ee",100:"#f9eecc",200:"#f2db96",300:"#e9c45a",400:"#e0ae2a",500:"#C6992F",600:"#a67a1c",700:"#855e13" },
        cream: "#F8F4EC",
      },
      fontFamily: { sans:["Inter","system-ui","sans-serif"], display:["'Playfair Display'","serif"] },
    },
  },
  plugins: [],
};
