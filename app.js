//variables
const cartBtn = document.querySelector(".cart-btn");
const closeCartBtn = document.querySelector(".close-cart");
const clearCartBtn = document.querySelector(".clear-cart");
const cartDOM = document.querySelector(".cart");
const cartOverlay = document.querySelector(".cart-overlay");
const cartItems = document.querySelector(".cart-items");
const cartTotal = document.querySelector(".cart-total");
const cartContent = document.querySelector(".cart-content");
const productsDOM = document.querySelector(".products-center");
const shopNowBtn = document.querySelector(".banner-btn");

// cart 
let cart = [];
//buttons
let buttonsDOM = [];
//products
let products = [];
// UI instance
let ui;

// Search functionality
const searchInput = document.querySelector(".search-input");
const searchBtn = document.querySelector(".search-btn");
const noResultsDOM = document.querySelector(".no-results");

searchBtn.addEventListener("click", () => {
  const searchTerm = searchInput.value.toLowerCase();
  const filteredProducts = products.filter(product =>
    product.title.toLowerCase().includes(searchTerm)
  );
  if (filteredProducts.length > 0) {
    ui.displayProducts(filteredProducts);
    noResultsDOM.style.display = "none";
  } else {
    productsDOM.innerHTML = "";
    noResultsDOM.style.display = "block";
  }
});

// Event listener for "Shop Now" button
shopNowBtn.addEventListener("click", () => {
  document.querySelector(".products").scrollIntoView({ behavior: "smooth" });
});

// getting the products
class Products{
  async getProducts(){
      try{
          let result = await fetch("products.json");
          if (!result.ok) throw new Error("Network response was not ok");
          let data = await result.json();
          let products = data.items.map(item => {
            const {title,price}= item.fields;
            const {id} = item.sys;
            const image =item.fields.image.fields.file.url;
            return {title,price,id,image}
          })
           return products;  
      }catch (error){
          console.error("Error fetching products:", error);
          return [];
      }
      
   }
}
//display product
class UI{
   displayProducts(products){
   let result ="";
   products.forEach(product => {
     result += `
     <article class="product">
               <div class="img-container">
                   <img src=${product.image} alt="product" class="product-img">
                   <button class="bag-btn" data-id=${product.id}>
                       <i class="fas fa-shopping-cart"></i>
                       add to cart
                   </button>
               </div> 
               <h3>${product.title}</h3>
               <h4>${product.price} MRU</h4>
               <button class="buy-btn" data-id=${product.id}>Buy Now</button>
      </article>  
     ` ; 
   }); 
 productsDOM.innerHTML = result;
 this.getBagButtons();
 this.getBuyButtons();
   }
  getBagButtons(){
      const buttons = [...document.querySelectorAll(".bag-btn")];
      buttonsDOM = buttons;
      buttons.forEach(button => {
        let id =button.dataset.id;
        let inCart = cart.find(item =>item.id === id);
        if (inCart){
            button.innerText= "In cart";
            button.disabled = true;
        }
    
           button.addEventListener('click',(event)=>{
              inCart = cart.find(item => item.id === id);
              if (!inCart) {
                event.target.innerText = "In cart";
                event.target.disabled = true;
                //get product from products
                let cartItem = {...Storage.getProduct(id),amount:1};
                //add product to the cart
                cart = [...cart,cartItem];
                //save cart in local storage
                Storage.saveCart(cart );
                //set cart values
                 this.setCartValues(cart);
                //display cart item
                 this.addCardItem(cartItem);
                //show the cart
                 this.showCart();
              }
           });
        
      });
       
  } 
  getBuyButtons() {
    const buttons = [...document.querySelectorAll(".buy-btn")];
    buttons.forEach(button => {
      button.addEventListener('click', (event) => {
        event.preventDefault();
        const id = button.dataset.id;
        const product = Storage.getProduct(id);
        const whatsappMessage = `Hello, I would like to buy the product: ${product.title} for ${product.price} MRU.`;
        const whatsappUrl = `https://wa.me/+22231240088?text=${encodeURIComponent(whatsappMessage)}`;
        window.open(whatsappUrl, '_blank');
      });
    });
  }
  setCartValues(cart){
      let tempTotal = 0;
      let itemsTotal=0;
      cart.map(item =>{
          tempTotal += item.price * item.amount;
          itemsTotal += item.amount;
      })
      cartTotal.innerText = parseFloat (tempTotal.toFixed(2));
      cartItems.innerText = itemsTotal;
      //console.log(cartTotal,cartItems);
  }
  addCardItem(item){
    const div = document.createElement('div');
    div.classList.add('cart-item');
      div.innerHTML =` <img src=${item.image} alt="product"> 
                      <div>
                          <h4>${item.title}</h4>
                          <h5>${item.price} MRU</h5>
                          <span class="remove-item" data-id=${item.id}>remove</span>
                      </div>
                      <div>
                          <i class="fas fa-chevron-up" data-id=${item.id}></i>
                          <p class="item-amount">${item.amount}</p>
                          <i class="fas fa-chevron-down" data-id=${item.id}></i>
                      </div> `;
      cartContent.appendChild(div);

  }
   showCart(){
     cartOverlay.classList.add('transparentBcg') ;
     cartDOM.classList.add('showCart');
   }
  setupApp(){
     cart = Storage.getCart();
     this.setCartValues(cart);
     this.populateCart(cart);
     cartBtn.addEventListener('click',this.showCart);
     closeCartBtn.addEventListener('click',this.hideCart);
  } 
  populateCart(cart){
      cart.forEach(item => this.addCardItem(item));
  }
  hideCart(){
      cartOverlay.classList.remove('transparentBcg');
      cartDOM.classList.remove('showCart');
  }
  cartLogic(){
      //clear cart button
      clearCartBtn.addEventListener("click",()=>{this.clearCart();
    });
     //cart functionality 
      cartContent.addEventListener ('click',event=>{
      if(event.target.classList.contains('remove-item'))
      {
          let removeItem = event.target;
          let id = removeItem.dataset.id;
          cartContent.removeChild(removeItem.parentElement.parentElement); 
          this.removeItem(id);
      }  
      else if (event.target.classList.contains('fa-chevron-up')) 
      {
         let addAmount = event.target; 
         let id = addAmount.dataset.id;
         let tempItem = cart.find(item => item.id === id);
         tempItem.amount = tempItem.amount + 1;
         Storage.saveCart(cart);
         this.setCartValues(cart);
         addAmount.nextElementSibling.innerText =
         tempItem.amount;
      } 
      else if (event.target.classList.contains('fa-chevron-down')) 
      {
         let lowerAmount = event.target;
         let id = lowerAmount.dataset.id;
         let tempItem = cart.find(item => item.id === id);
         tempItem.amount = tempItem.amount - 1;
         if(tempItem.amount > 0){
             Storage.saveCart(cart);
             this.setCartValues(cart);
             lowerAmount.previousElementSibling.innerText = tempItem.amount;
         }
         else {
             cartContent.removeChild(lowerAmount.parentElement.parentElement);
             this.removeItem(id);
         }
      }
    });
  }
  clearCart(){
     let cartItems = cart.map(item =>item.id);
     cartItems.forEach(id => this.removeItem(id));
     while (cartContent.children.length > 0){
         cartContent.removeChild (cartContent.children[0]);
     }
     this.hideCart();
  }
  removeItem(id){
      cart = cart.filter(item => item.id !==id);
      this.setCartValues(cart);
      Storage.saveCart(cart);
      let button = this.getSingleButton(id);
      button.disabled = false;
      button.innerHTML = `<i class= "fas fa-shopping-cart"></i>add to cart`;
  }
  getSingleButton(id){
     return buttonsDOM.find(button => button.dataset.id === id);
  }
  addCartBuyButton() {
    const buyBtn = document.querySelector(".cart-footer .buy-btn");
    buyBtn.addEventListener('click', () => {
      let whatsappMessage = `Hello, I would like to buy the following products:\n`;
      cart.forEach(item => {
        whatsappMessage += `- ${item.title} for ${item.price} MRU (Quantity: ${item.amount})\n`;
      });
      const whatsappUrl = `https://wa.me/+22231240088?text=${encodeURIComponent(whatsappMessage)}`;
      window.open(whatsappUrl, '_blank');
    });
  }
}
//local storage 
class Storage{
 static saveProducts(products){
     localStorage.setItem("products",JSON.stringify(products));
 }
 static getProduct(id){
    let products =JSON.parse(localStorage.getItem('products'));
    return products.find(product => product.id=== id); 
 }
 static saveCart(cart){
     localStorage.setItem('cart',JSON.stringify(cart))
 }
 static getCart(){
    return localStorage.getItem('cart')?JSON.parse(localStorage.getItem('cart')):[] 
 }
}
document.addEventListener("DOMContentLoaded", () => {
  ui = new UI();
  const productsInstance = new Products();
  //setup app
  ui.setupApp();
  //get all products
  productsInstance.getProducts().then(fetchedProducts => {
    products = fetchedProducts;
    ui.displayProducts(products);
    Storage.saveProducts(products);
  }).then(() => {
    ui.getBagButtons();
    ui.cartLogic();
    ui.addCartBuyButton();
  });
});