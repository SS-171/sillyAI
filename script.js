// More API functions here:
// https://github.com/googlecreativelab/teachablemachine-community/tree/master/libraries/image

// the link to your model provided by Teachable Machine export panel
const URL = "https://teachablemachine.withgoogle.com/models/aePcO85Uh/";

let model, webcam, maxPredictions, timer;
let camArea = document.getElementById("webcam-container");
let start = document.getElementById("start-btn");
let myStop = document.getElementById("stop-btn");
let myStatus = document.getElementById("waiting-status");
let labelContainer = document.getElementById("label-container");
let imgArea = document.getElementById("img-area");
let countArea = document.querySelector(".Count-area");
let myImg = document.querySelector("#my-image");
let inputFile = document.querySelector('input[type="file"]');
let count = 0;
let lastText = '';
let isIos = false;
const flip = true; // whether to flip the webcam
const modelURL = URL + "model.json";
const metadataURL = URL + "metadata.json";

// fix when running demo in ios, video will be frozen;
if (window.navigator.userAgent.indexOf('iPhone') > -1 || window.navigator.userAgent.indexOf('iPad') > -1) {
    isIos = true;
}
myStop.style.display = 'none';
imgArea.style.display = 'none';
// let tmImage = document.querySelector('input[name="avatar"]').value;
// Load the image model and setup the webcam
function stopFun() {
    labelContainer.innerText = '';
    start.style.display = 'block';
    myStop.style.display = 'none';
    if (camArea.innerHTML) {
        count = 20;
        lastText = '';
        clearInterval(timer);
        myStatus.innerText = "";
        camArea.innerHTML = ''
        webcam.stop();
        countArea.style.display = 'none';
    }
    else {
        imgArea.style.display = 'none';
        inputFile.value = '';
    }


}
async function init() {
    //Config();
    lastText = '';
    count = 0;
    start.style.display = 'none';
    imgArea.style.display = 'none';
    myStop.style.display = 'block';
    myStop.disabled = true;
    labelContainer.innerText = '';
    countArea.innerText = '';
    countArea.style.display = 'block';
    webcam = new tmImage.Webcam(300, 300, flip); // width, height, flip
    responsiveVoice.speak('Đưa bản mặt zô đây!!', 'Vietnamese Female');
    await webcam.setup(); // request access to the webcam
    await webcam.play();
    myStatus.innerText = "Chờ chút!";
    if (isIos) {
        camArea.appendChild(webcam.webcam); // webcam object needs to be added in any case to make this work on iOS
        // grab video-object in any way you want and set the attributes
        const webCamVideo = document.getElementsByTagName('video')[0];
        webCamVideo.setAttribute("playsinline", true); // written with "setAttribute" bc. iOS buggs otherwise
        webCamVideo.muted = "true";
        webCamVideo.style.width = 300 + 'px';
        webCamVideo.style.height = 300 + 'px';
    }
    else {
        camArea.appendChild(webcam.canvas);
    }
    model = await tmImage.load(modelURL, metadataURL);
    maxPredictions = model.getTotalClasses();
    myStop.disabled = false;
    myStatus.innerText = '';
    window.requestAnimationFrame(loop);
    timer = setInterval(() => { count++ }, 1000);
    //setTimeout(()=>{keep=0}, 10000);

}

async function loop() {
    webcam.update(); // update the webcam frame
    await predict(webcam.canvas);
    if (count <= 10) {
        //setTimeout(()=>{count = count +1}, 1000);
        countArea.innerText = `Còn lại ${10 - count} giây`;
        window.requestAnimationFrame(loop);
    }
    else {
        webcam.stop();
        countArea.style.display = 'none';
        return false;
    }

}

// run the webcam image through the image model
async function predict(element) {
    // predict can take in an image, video or canvas html element
    let text = '';
    const prediction = await model.predictTopK(element, 1);

    if (prediction[0].className === 'K biết') text = 'Tao không biết.'
    else {
        text = "Mầy là " + prediction[0].className
    };
    if (text !== lastText) {
        lastText = text;
        responsiveVoice.speak(lastText, 'Vietnamese Female');

    }
    labelContainer.innerText = text;

    if (count === 20) labelContainer.innerText ='';

}

async function imageCheck() {
    start.style.display = 'none';
    myStop.style.display = 'block';
    if (!inputFile.value) {
        alert('Chọn ảnh đã 🙂🙂🙂');
    }
    else {
        let text = '';
        labelContainer.innerText = 'Chờ xí...';
        
         model = await tmImage.load(modelURL, metadataURL);
        //model = await tmImage.loadFromFiles('/model')
        const prediction = await model.predictTopK(myImg, 1);
        if (prediction[0].className === 'K biết') text = "Tao không biết.";
        else text = "Mầy là " + prediction[0].className
        labelContainer.innerText = text;
        responsiveVoice.speak(text, 'Vietnamese Female');
    }
}


if (window.FileList && window.File && window.FileReader) {

    inputFile.addEventListener('change', event => {
        myImg.src = '';
        const file = event.target.files[0];
        if (!file.type) {
            test.textContent = 'Error: The File.type property does not appear to be supported on this browser.';
            return;
        }
        if (!file.type.match('image.*')) {
            test.textContent = 'Error: The selected file does not appear to be an image.'
            return;
        }
        const reader = new FileReader();
        reader.addEventListener('load', event => {
            imgArea.style.display = 'block';
            myImg.src = event.target.result;
        });
        reader.readAsDataURL(file);

    });
}