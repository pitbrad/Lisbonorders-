/* ===== MENU FILE - edit only the text and numbers, keep the punctuation ( " , { } [ ] ) ===== */

const ADMIN_USERNAME = "cashPayment_only";   // without @
const PICKUP_MIN = 60;
const FREE_DELIVERY_FROM = 300;              // free delivery only in "Lisbon center" (or 20 euro discount elsewhere)

const ZONES = [
  {name:"Lisbon center", fee:20, min:100, free:true},
  {name:"Oeiras and area", fee:25, min:125},
  {name:"Almada", fee:30, min:150},
  {name:"West of Oeiras to Cascais", fee:40, min:200},
  {name:"Costa da Caparica", fee:40, min:220},
  {name:"Cascais", fee:50, min:250},
  {name:"Setubal", fee:70, min:300},
  {name:"Ericeira", fee:100, min:400},
  {name:"Peniche", fee:120, min:500},
  {name:"Algarve", fee:250, min:750},
  {name:"Porto", fee:500, min:1000}
];

/* Two separate menus: Menu 1 (with 3+1 promo on bags) and Menu 2 (no promos).
   Both menus are available for both Pickup and Delivery choices. */

const MENUS = {

  pickup: {
    title: "Pickup menu",
    categories: [
      { 
        name: "Menu 1 (Promo 3+1)", 
        products: [
          { 
            name: "Bags Collection", 
            desc: "70 per bag. Buy 3 bags and get the 4th free! (3+1)", 
            img: "",
            options: [
              { label: "1 bag", price: 70 },
              { label: "3 bags + 1 Free (Total 4)", price: 210 }
            ] 
          }
        ]
      },
      { 
        name: "Menu 2 (Regular)", 
        products: [
          { 
            name: "Regular Product A", 
            desc: "Description of regular product A", 
            img: "",
            options: [
              { label: "1 unit", price: 40 },
              { label: "3 units", price: 110 }
            ] 
          }
        ]
      }
    ]
  },

  delivery: {
    title: "Delivery menu",
    categories: [
      { 
        name: "Menu 1 (Promo 3+1)", 
        products: [
          { 
            name: "Bags Collection", 
            desc: "70 per bag. Buy 3 bags and get the 4th free! (3+1)", 
            img: "",
            options: [
              { label: "1 bag", price: 70 },
              { label: "3 bags + 1 Free (Total 4)", price: 210 }
            ] 
          }
        ]
      },
      { 
        name: "Menu 2 (Regular)", 
        products: [
          { 
            name: "Regular Product A", 
            desc: "Description of regular product A", 
            img: "",
            options: [
              { label: "1 unit", price: 45 },
              { label: "3 units", price: 120 }
            ] 
          }
        ]
      }
    ]
  }

};
