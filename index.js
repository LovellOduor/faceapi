var canv = document.getElementById("canv");
var contx = canv.getContext("2d");
var imvid = document.getElementById("im");
var vid = document.getElementById("vid");
var stats = new Stats();
stats.showPanel(0); // 0: fps, 1: ms, 2: mb, 3+: custom
stats.domElement.style.position = 'absolute';
stats.domElement.style.left = '0px';
stats.domElement.style.top = '50px';
document.body.appendChild(stats.dom );

async function run(){
if("mediaDevices" in navigator){
    var cam = await navigator.mediaDevices.getUserMedia({video:{width:"192px",height:"192px"},audio:false});
    vid.srcObject = cam;
    vid.autoplay = true;
}

vid.onloadedmetadata = async function(){
await tf.setBackend('wasm');
const tfliteModel = await tf.loadGraphModel('/f/fmesh/model.json');
 // Get pixels data from an image
imvidctx = imvid.getContext("2d");

async function play(){
    stats.begin();
    imvidctx.drawImage(vid,0,0,192,192);
    contx.drawImage(vid,0,0,192,192);

    var img = tf.browser.fromPixels(imvid);
       // Normalize (might also do resize here if necessary).
       // Run the inference

    img = tf.div(img,tf.scalar(255));
    img.dtype = "float32";

    let outputTensor = await tfliteModel.predict(img.reshape([1,192,192,3]));
        var keypoints = await outputTensor[2].dataSync();
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
}
play();
}

}
run();