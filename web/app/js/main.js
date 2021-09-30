 //var serverUrl =  "http://192.168.0.44";
 var serverUrl =  "";
 $(document).ready(function () {
   console.log('DOM is ready');

   var socket;
   
   var snapshots = [];
   var birds = [];
   
   $.ajaxSetup({
     headers:{
         'Content-Type': "application/json",
         'contentType': "application/json; charset=utf-8"
     }
   });


   var token = localStorage.getItem("token");

   if(token){
     $("#login-page").hide();
     $("#home-page").show();
     //document.querySelector('#video').src = '/video_feed?token=' + token;
     connectToSocket(token);
   }else{
     $("#login-page").show();
     $("#home-page").hide();
   }

   $("#settings-page").hide();
   $("#gallery-page").hide();
   $("#alert").hide();
   $("#birds-page").hide();
   
   

   $("#login").click(()=>{
       
       var username = $("#username").val();
       var password = $("#password").val();
       token = window.btoa(username+':'+password);
       
       localStorage.setItem("token",token);
       //document.querySelector('#video').src = '/video_feed?token=' + token;
       connectToSocket(token);
       $("#login-page").hide();
       $("#home-page").show();

   });

  

   $("#logout").click(()=>{
     $("#login-page").show();
     $("#settings-page").hide();
     localStorage.removeItem("token");
     token = undefined;
     disconnectSocket();
     $("#home-button").addClass('active');
     $("#settings-button").removeClass('active');
   })

   $("#capture").click(()=>{

     $.post( "/api/capture",{}, function(response) {
       
       showAlert('Image captured successfully!');
       
     })

   })

   //tab buttons
   

   $("#settings-button").click(()=>{
     $("#settings-button").addClass('active');
     $("#home-button").removeClass('active');
     $("#gallery-button").removeClass('active');
     $("#notif-button").removeClass('active');
     $("#birds-button").removeClass('active');
     $("#home-page").hide();
     $("#settings-page").show();
     $("#birds-page").hide();
     $.get( "/api/tg", function(response) {
       //console.log(response);
       if(response.status === "N"){
           $("#tg-btn").html("Disable");
       }else{
         $("#tg-btn").html("Enable");
       }
       
       
     })

   })
   $("#tg-btn").click(()=>{
     var tgStatus = "N";
     if($("#tg-btn").html() === "Disable"){
       tgStatus = "Y";
       $("#tg-btn").html("Enable");
     }else{
       tgStatus = "N";
       $("#tg-btn").html("Disable");
     }
     $.post( `/api/tg-update`,JSON.stringify({status: tgStatus}), function(response) {
       
     })

   });


   $("#home-button").click(()=>{
     $("#settings-button").removeClass('active');
     $("#home-button").addClass('active');
     $("#gallery-button").removeClass('active');
     $("#notif-button").removeClass('active');
     $("#birds-button").removeClass('active');

     if(token){
       $("#home-page").show();
     }else{
       $("#login-page").show();
     }
     
     $("#settings-page").hide();
     $("#gallery-page").hide();
     $("#birds-page").hide();
   })

   $("#gallery-button").click(()=>{
     $("#settings-button").removeClass('active');
     $("#home-button").removeClass('active');
     $("#gallery-button").addClass('active');
     $("#notif-button").removeClass('active');
     $("#birds-button").removeClass('active');

     $("#home-page").hide();
     $("#settings-page").hide();
     $("#gallery-page").show();
     $("#birds-page").hide();
     
     
     $.get( serverUrl+"/api/snapshots", function(data) {
       snapshots = data;
       loadSnapshots();
       
     })

    

   })

   $("#birds-button").click(()=>{
     $("#settings-button").removeClass('active');
     $("#home-button").removeClass('active');
     $("#gallery-button").removeClass('active');
     $("#notif-button").removeClass('active');
     $("#birds-button").addClass('active');
     $("#home-page").hide();
     $("#settings-page").hide();
     $("#birds-page").show();
     $("#gallery-page").hide();

     
     
     $.get( serverUrl+"/api/birds", function(data) {
       console.log(data);
       birds = data;
       loadBirds();
       
     })

    
   })

   $("#settings-button").click(()=>{
     $("#settings-button").addClass('active');
     $("#home-button").removeClass('active');
     $("#gallery-button").removeClass('active');
     $("#notif-button").removeClass('active');
     $("#birds-button").removeClass('active');

     $("#home-page").hide();
     $("#gallery-page").hide();
     $("#settings-page").show();
     $("#birds-page").hide();
   })

   showAlert = function(message){
     $("#alert").html(message);
     $("#alert").show();
     setTimeout(()=>{
       $("#alert").hide();
     },2000);
   }
   
   loadSnapshots = function(){
     var html = "";
     var offset = new Date().getTimezoneOffset(); //in minutes
       snapshots.forEach(item=>{
                 var dt = new Date(item.ts);
                 var localDt = new Date(dt.getTime() + offset*-1*60*1000).toLocaleString();
                 
                 html = html+ `<div class="col-sm-6 col-md-4">
                           <div class="thumbnail">
                             <img src="/${item.filename}">
                             <div class="caption">
                               <h4 class="${item.bird}">${item.bird}</h4>
                               <h6>${localDt}</h6>
                               <p><a onclick="trainSnap(${item.id}, '${item.filename}','${item.bird}')"  class="btn btn-success" role="button">Train Edge Impulse</a> 
                                 <a onclick="deleteSnap(${item.id}, '${item.filename}')" class="btn btn-danger" role="button">Delete</a></p>
                             </div>
                           </div>
                         </div>`
       });
       $("#gallery-view").html(html);
       $("#gallery-count").html(`${snapshots.length} images`);
   }

   loadBirds = function(){
     var html = "";
       birds.forEach(item=>{
                 html = html+ `<div class="col-sm-6 col-xs-12">
                           <div class="thumbnail">
                             <img src="${item.thumbnail}">
                             <div class="caption">
                               <h3 >${item.name}</h3>
                               <p>${item.description}</p>
                               <h4>Habitat</h4>
                               <p>${item.habitat}</p>
                               <h4>Diet</h4>
                               <p>${item.diet}</p>
                               <h4>Reproduction</h4>
                               <p>${item.reproduction}</p>
                             </div>
                           </div>
                         </div>`
       });
       $("#birds-view").html(html);
   }

   deleteSnap = function(id,filename){
    
     var index = snapshots.findIndex(m=> m.id == id);
     
     $.post( serverUrl+"/api/delete-snap",JSON.stringify({id:id,filename:filename}), function(response) {
       showAlert('Snap deleted successfully!');
       
       snapshots.splice(index,1);
       loadSnapshots();
       
     })
   }

   deleteAllSnap = function(){
     $.post( serverUrl+"/api/delete-all-snap",JSON.stringify({}), function(response) {
       showAlert('Gallery cleared successfully!');
       
       $.get( serverUrl+"/api/snapshots", function(data) {
         snapshots = data;
         loadSnapshots();
       
       })
       
     })
   }

   trainSnap = function(id,filename, caption){
    
    
    $.post( serverUrl+"/api/train",JSON.stringify({id:id,filename:filename, caption: caption}), function(response) {
      console.log(response);
      showAlert('Added to Edge Impulse Data Collection successfully!');
      
      
    })
  }

 });
 
 function disconnectSocket(){
   if(socket){
     socket.disconnect();
   }
 }
 function connectToSocket(token){
   socket = io.connect(serverUrl,{query:{token:token}});
   
   socket.on( 'ei_event', function(predictions) {
     //console.log('ei_event',predictions);
     var html ="";
     
     predictions.forEach(m=>{
       html = html = `<li>${m.label} ${m.score}%</li>`;
     })

     $("#classification").html(html);

   });

   socket.on( 'stream', function(image) {
    
     document.querySelector('#video').src = image;
   });



 }