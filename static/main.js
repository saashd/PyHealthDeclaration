// var wrapper = document.getElementById("demo").querySelector("#signature-pad");
var wrapper = document.getElementById("signature-pad");
var canvas = wrapper.querySelector("canvas");
var signaturePad = new SignaturePad(canvas, {
    // It's Necessary to use an opaque color when saving image as JPEG;
    // this option can be omitted if only saving as PNG or SVG
    backgroundColor: 'rgb(255, 255, 255)'
});

// Adjust canvas coordinate space taking into account pixel ratio,
// to make it look crisp on mobile devices.
// This also causes canvas to be cleared.
function resizeCanvas() {
    // When zoomed out to less than 100%, for some very strange reason,
    // some browsers report devicePixelRatio as less than 1
    // and only part of the canvas is cleared then.
    var ratio = Math.max(window.devicePixelRatio || 1, 1);

    // This part causes the canvas to be cleared
    canvas.width = canvas.offsetWidth * ratio;
    canvas.height = canvas.offsetHeight * ratio;
    canvas.getContext("2d").scale(ratio, ratio);

    // This library does not listen for canvas changes, so after the canvas is automatically
    // cleared by the browser, SignaturePad#isEmpty might still return false, even though the
    // canvas looks empty, because the internal data of this library wasn't cleared. To make sure
    // that the state of this library is consistent with visual state of the canvas, you
    // have to clear it manually.
    signaturePad.clear();
}

// On mobile devices it might make more sense to listen to orientation change,
// rather than window resize events.
window.onresize = resizeCanvas;
resizeCanvas();

function download(dataURL, filename) {
    if (navigator.userAgent.indexOf("Safari") > -1 && navigator.userAgent.indexOf("Chrome") === -1) {
        window.open(dataURL);
    } else {
        var blob = dataURLToBlob(dataURL);
        var url = window.URL.createObjectURL(blob);

        var a = document.createElement("a");
        a.style = "display: none";
        a.href = url;
        a.download = filename;

        document.body.appendChild(a);
        a.click();

        window.URL.revokeObjectURL(url);
    }
}

// One could simply use Canvas#toBlob method instead, but it's just to show
// that it can be done using result of SignaturePad#toDataURL.
function dataURLToBlob(dataURL) {
    // Code taken from https://github.com/ebidel/filer.js
    var parts = dataURL.split(';base64,');
    var contentType = parts[0].split(":")[1];
    var raw = window.atob(parts[1]);
    var rawLength = raw.length;
    var uInt8Array = new Uint8Array(rawLength);

    for (var i = 0; i < rawLength; ++i) {
        uInt8Array[i] = raw.charCodeAt(i);
    }

    return new Blob([uInt8Array], {type: contentType});
}

let demo = new Vue({
    el: "#demo",
    data: {
        signupForm: {
            'Name': null,
            'CellNum': null,
            'Id': null,
            'Coughing': null,
            'TemperatureAbove38': null,
            'ContactWithIll': null,
            'Sign': null,
            'Date': null
        }
    },
    methods: {

        addDeclaration: function () {

            if (this.signupForm.Name === null) {
                alert('נא להזין את שמך');
                return false
            }
            if (this.signupForm.CellNum === null) {
                alert('נא להזין את מספר הטלפון');
                return false
            }
            if ((this.signupForm.CellNum !== null) && (this.signupForm.CellNum.length !== 10)) {
                alert('מספר טלפון שהוזן אינו תקין');
                return false
            }
            if (this.signupForm.Id === null) {
                alert('נא להזין את מספר תעודת הזהות');
                return false
            }
            if ((this.signupForm.Coughing === null) ||
                (this.signupForm.TemperatureAbove38 === null) || (this.signupForm.ContactWithIll === null)) {
                alert('נא למלא את הפרטים החסרים');
                return false
            }
            if (signaturePad.isEmpty()) {
                alert("נא לחתום");
                return false;
            }
            this.signupForm.Sign = signaturePad.toDataURL("image/jpeg");
            let date = new Date();
            // this.signupForm.Date= date.getHours()+':'+date.getMinutes()+'_'+date.getDate()+'_'+(date.getMonth()+1)+'_'+date.getFullYear();
            this.signupForm.Date = date.getFullYear() + '_' + (date.getMonth() + 1) + '_' + date.getDate() + '_' + date.getHours() + ':' + date.getMinutes();

            console.log(this.signupForm.Date);
            let axiOpts = {
                // send a POST request
                method: 'POST',
                url: '/api/Post',
                data: this.signupForm

            };
            axios(axiOpts).then((response) => {
                alert("הצהרתך נקלטה בהצלחה.");
                location.replace("index.html");
                console.log(response);
            }, (error) => {
                console.log(error);
            });
            return true;
        }


    },
    mounted() {

        console.log("mounted");
        let axiOpts = {
            method: 'GET',
            url: '/api/index',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Accept': 'application/json'
            }
        };

        axios(axiOpts)
            .then(x => {
                this.gridData = x.data;
                this.isLoading = false;
            })
            .catch(x => console.log(x));

    }
});

