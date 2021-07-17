importScripts("//unpkg.com/@tensorflow/tfjs-core@3.7.0/dist/tf-core.js")
importScripts("//unpkg.com/@tensorflow/tfjs-converter@3.7.0/dist/tf-converter.js")
importScripts("//unpkg.com/@tensorflow/tfjs-backend-webgl@3.7.0/dist/tf-backend-webgl.js");
async function load(){
    await tf.setBackend('webgl');
    const tfliteModel = await tf.loadGraphModel('./fmesh/model.json');
    setTimeout(()=>{
        this.postMessage(["keypoints",[]]);
        this.postMessage(["ready",[]]);
    },1000);
    onmessage = async function(mess){
        img = mess.data;
        let outputTensor = await tfliteModel.predict(tf.tensor(img,[1,192,192,3]));
        let keypoints = outputTensor[2].dataSync();
        this.postMessage(["keypoints",keypoints]);
    }
}
load();