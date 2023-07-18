var createBtn = document.querySelector("#crt");
var loginBtn = document.querySelector("#lgin");
var loginCont = document.querySelector(".login-container");
var regCont = document.querySelector(".reg-container");

loginBtn.addEventListener("click", ()=>{
    loginCont.style.display = "initial";
    regCont.style.display = "none";
});

createBtn.addEventListener("click", ()=>{
  loginCont.style.display = "none";
    regCont.style.display = "initial";
});

