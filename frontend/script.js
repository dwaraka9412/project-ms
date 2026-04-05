const API = "http://localhost:5000";

function login(){

const email=document.getElementById("email").value;
const password=document.getElementById("password").value;

fetch(API+"/api/auth/login",{

method:"POST",
headers:{"Content-Type":"application/json"},
body:JSON.stringify({email,password})

})
.then(res=>res.json())
.then(data=>{

document.getElementById("msg").innerText=data.message;

localStorage.setItem("email",email);

if(data.message==="OTP sent to email")
window.location="otp.html";

});

}

function verify(){

const otp=document.getElementById("otp").value;
const email=localStorage.getItem("email");

fetch(API+"/api/auth/verify",{

method:"POST",
headers:{"Content-Type":"application/json"},
body:JSON.stringify({email,otp})

})
.then(res=>res.json())
.then(data=>{

if(data.message==="Login successful")
window.location="dashboard.html";

});

}

function upload(){

const file=document.getElementById("file").files[0];
const password=document.getElementById("filepass").value;
const email=localStorage.getItem("email");

let formData=new FormData();

formData.append("file",file);
formData.append("password",password);
formData.append("email",email);

fetch(API+"/api/files/upload",{

method:"POST",
body:formData

}).then(()=>loadFiles());

}

function loadFiles(){

fetch(API+"/api/files/list")
.then(res=>res.json())
.then(files=>{

let html="";

files.forEach(f=>{

html+=`

<div class="fileCard">

<div class="fileIcon">📄</div>

<div class="fileName">${f.originalname}</div>

<div class="uploader">by ${f.uploader}</div>

<input id="pass${f.id}" placeholder="Password">

<button onclick="openFile(${f.id})">Open</button>

</div>

`;

});

document.getElementById("fileList").innerHTML=html;

});

}

function openFile(id){

const password=document.getElementById("pass"+id).value;

fetch(API+"/api/files/open",{

method:"POST",
headers:{"Content-Type":"application/json"},
body:JSON.stringify({id,password})

})
.then(res => {
  if(res.status===200){
    return res.blob().then(blob => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "";
      a.click();
    });
  } else {
    alert("Wrong password");
  }
});

}

if(document.getElementById("fileList"))
loadFiles();