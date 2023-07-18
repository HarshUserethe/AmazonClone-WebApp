function scrollTopDealProducts(){
    

var pointerNext = document.querySelector(".pointer");
var pointerPrev = document.querySelector(".pointerPrev");
var productCard = document.querySelector(".product-card");
var productsContainer = document.querySelector(".productsContainer");

pointerNext.addEventListener("click", function(){
 productsContainer.scrollLeft += 100;
})

pointerPrev.addEventListener("click", function(){
 productsContainer.scrollLeft -= 100;
})
}


function hoverOnTopDealProducts(){
    document.querySelector(".dets").addEventListener("mouseenter", function(){
        document.querySelector(".overlay").style.display = "initial";
    
    })
      document.querySelector(".dets").addEventListener("mouseleave", function(){
        document.querySelector(".overlay").style.display = "none";
    
      })

}


function hoverOnTopDealProducts2(){
    document.querySelector(".dets2").addEventListener("mouseenter", function(){
        document.querySelector(".overlay2").style.display = "initial";
    
    })
      document.querySelector(".dets2").addEventListener("mouseleave", function(){
        document.querySelector(".overlay2").style.display = "none";
    
      })

}

function profile(){
  
var flag = 0;

document.querySelector("#profileDets").addEventListener("click", function(){
  if(flag == 0){
    document.querySelector(".yourProfile").style.display = "flex";
    flag = 1;
}else{
  document.querySelector(".yourProfile").style.display = "none";
  flag = 0;
}
});

}


profile();
scrollTopDealProducts();
hoverOnTopDealProducts();
hoverOnTopDealProducts2();
