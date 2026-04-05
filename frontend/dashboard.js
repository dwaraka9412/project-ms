const API = "http://localhost:5000/api/files";

let filesData = [];

/* Logout */

function logout(){
  localStorage.clear();
  window.location = "login.html";
}

/* Upload File */

function upload(){

  const file = document.getElementById("file").files[0];
  const password = document.getElementById("password").value;
  const email = localStorage.getItem("email");

  const formData = new FormData();
  formData.append("file", file);
  formData.append("password", password);
  formData.append("email", email);

  fetch(API + "/upload",{
    method:"POST",
    body:formData
  })
  .then(res => res.json())
  .then(data=>{
    alert(data.message);
    loadFiles();
  });

}

/* Load Files */

function loadFiles(){

  fetch(API + "/list")
  .then(res => res.json())
  .then(data=>{
    filesData = data;
    displayFiles(data);
  });

}

/* Display Files */

function displayFiles(files){

  const container = document.getElementById("files");
  container.innerHTML = "";

  files.forEach(file => {

    const div = document.createElement("div");
    div.className = "file";

    let previewButton = "";

    if(file.originalname.match(/\.(jpg|jpeg|png|gif)$/i)){
      previewButton = `<button onclick="previewFile(${file.id})">Preview Image</button>`;
    }

    if(file.originalname.match(/\.(pdf)$/i)){
      previewButton = `<button onclick="previewFile(${file.id})">Open PDF</button>`;
    }

    let deleteButton = "";

    if(localStorage.getItem("email") === file.uploader){
      deleteButton = `<button onclick="deleteFile(${file.id})">Delete</button>`;
    }

    div.innerHTML = `
      <b>${file.originalname}</b><br>
      ${previewButton}
      <button onclick="downloadFile(${file.id})">Download</button>
      ${deleteButton}
    `;

    container.appendChild(div);

  });

}

/* Preview File (Password Protected) */

function previewFile(id){

  const password = prompt("Enter file password");

  if(!password) return;

  fetch(API + "/open",{
    method:"POST",
    headers:{
      "Content-Type":"application/json"
    },
    body:JSON.stringify({id,password})
  })
  .then(res=>{
    if(res.status === 200){
      return res.blob();
    }else{
      alert("Wrong password");
    }
  })
  .then(blob=>{

    if(!blob) return;

    const url = window.URL.createObjectURL(blob);
    window.open(url);

  });

}

/* Download File */

function downloadFile(id){

  const password = prompt("Enter file password");

  if(!password) return;

  fetch(API + "/open",{
    method:"POST",
    headers:{
      "Content-Type":"application/json"
    },
    body:JSON.stringify({id,password})
  })
  .then(res=>{
    if(res.status === 200){
      return res.blob();
    }else{
      alert("Wrong password");
    }
  })
  .then(blob=>{

    if(!blob) return;

    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");

    a.href = url;
    a.download = "file";

    a.click();

  });

}

/* Delete File */

function deleteFile(id){

  fetch(API + "/delete/" + id,{
    method:"DELETE",
    headers:{
      "Content-Type":"application/json"
    },
    body:JSON.stringify({
      email: localStorage.getItem("email")
    })
  })
  .then(res => res.json())
  .then(data=>{
    alert(data.message);
    loadFiles();
  });

}

/* Search Files */

document.getElementById("search").addEventListener("input",function(){

  const text = this.value.toLowerCase();

  const filtered = filesData.filter(f =>
    f.originalname.toLowerCase().includes(text)
  );

  displayFiles(filtered);

});

/* Initial Load */

loadFiles();