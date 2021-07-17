var canv = document.getElementById("canv");
var contx = canv.getContext("2d");
var imvid = document.getElementById("im");
var vid = document.getElementById("vid");
var stats = new Stats();
stats.showPanel(0); // 0: fps, 1: ms, 2: mb, 3+: custom
stats.domElement.style.position = 'absolute';
stats.domElement.style.left = '0px';
stats.domElement.style.top = '50px';
document.body.appendChild(stats.dom);
if(navigator.getUserMedia){
    var cam = navigator.getUserMedia({video:{width:"192px",height:"192px"},audio:false},
    function(cam){
        vid.srcObject = cam;
        vid.autoplay = true;
        vid.onloadeddata = function(){
            vid.play();
        }
    },function(err){
        console.log(err);
    });
}
imvidctx = imvid.getContext("2d");

var worker;
// Add the web worker
if(window.Worker){
    worker = new Worker("worker.js");
}

var ready = false;
var keypoints = [];
vid.onloadedmetadata = async function(){
await tf.setBackend('wasm');
 // Get pixel data from an image
 worker.onmessage = function(mess){
    var result = mess.data;
    if (result[0] == "keypoints"){
    ready = true;
    keypoints = result[1];
    }
}
var count = 0;
async function play(){
    stats.begin();
    imvidctx.drawImage(vid,0,0,192,192);
    contx.drawImage(vid,0,0,192,192);
    var img = tf.browser.fromPixels(imvid);
        // Normalize (might also do resize here if necessary).
       // Run the inference
    img = tf.div(img,tf.scalar(255));
    img.dtype = "float32";
    img = img.reshape([1,192,192,3]);
    if(ready){
        worker.postMessage(img.dataSync());     
        ready = false;
    }
    for(let i=0;i<keypoints.length;i+=3){
        x = parseInt(keypoints[i]);
        y = parseInt(keypoints[i+1]);
        z = parseInt(keypoints[i+2]);
        contx.beginPath();
        contx.arc(x,y,2,0,2*Math.PI);
        contx.fillStyle = "green";
        contx.fill();
    }
    stats.end();
requestAnimationFrame(play);
count += 1;
}
play();
}