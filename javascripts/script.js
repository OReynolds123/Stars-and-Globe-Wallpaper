// Main
starCanvas();

if (screen.width > 1919) {
    canvasGlobe('canvasE', 1500, 0.8, -0.00002, '#ffe3e3aa', true, '#aa0000aa', true);
    canvasGlobe('canvasR', 100, 0.8, 0.00009, '#efffe3aa', true, '#008800aa');
    canvasGlobe('canvasL', 75, 0.8, 0.0001, '#ffffffff', false, '#ffffffff');
    canvasGlobe('canvasW', 300, 0.8, -0.00004, '#e3fcffaa', true, '#0000ffff');
    updateClock();
    httpRequestRefresh();
}

// Mouse Follow 
var mouseX = 0;
var mouseY = 0;
var mouseSize = 30;
var reset = false;
function mouseMove(e) {
    mouseX = e.clientX;
    mouseY = e.clientY;
}
document.addEventListener("mousemove", mouseMove);

// Star Canvas
function starCanvas() {
    const canvas = document.getElementById('bkgCanvas'); // Get the canvas element
    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;
    const bgCtx = canvas.getContext('2d');
    const width = canvas.clientWidth; // Width of the canvas
    const height = canvas.clientHeight; // Height of the canvas
    var canvasRect = canvas.getBoundingClientRect();

    // Background
    var backgroundColor = "#03031833";
    const now = new Date().getHours();
    if (!(now >= 7 && now < 19)) {
        backgroundColor = "#03031888";
    }
    bgCtx.fillStyle = backgroundColor;
    bgCtx.fillRect(0, 0, width, height);

    // Stars
    function Star(options) {
        this.size = Math.random() * 3;
        this.speed = Math.random() * .1;
        this.x = options.x;
        this.y = options.y;
        this.c = options.c;
        this.co = this.c;
    }
    Star.prototype.reset = function () {
        this.size = Math.random() * 3;
        this.speed = Math.random() * .1;
        this.x = width;
        this.y = Math.random() * height;
        this.c = this.co;
    }
    Star.prototype.colision = function () {
        var mousePosX = mouseX - canvasRect.left;
        var mousePosY = mouseY - canvasRect.top;
        if (((this.x > (mousePosX - mouseSize)) && (this.x < (mousePosX + mouseSize))) && ((this.y > (mousePosY - mouseSize)) && (this.y < (mousePosY + mouseSize)))) {
            this.c = "#ffd700";
        }
    }
    Star.prototype.update = function () {
        if (reset) {
            this.c = this.co;
        }
        this.colision();
        this.x -= this.speed;
        if (this.x < 0) {
            this.reset();
        } else {
            bgCtx.fillStyle = this.c;
            bgCtx.fillRect(this.x, this.y, this.size, this.size);
        }
    }

    // Shooting Stars
    function ShootingStar() {
        this.reset();
    }
    ShootingStar.prototype.reset = function () {
        this.x = Math.random() * width;
        this.y = 0;
        this.len = (Math.random() * 80) + 10;
        this.speed = (Math.random() * 10) + 6;
        this.size = (Math.random() * 1) + 0.1;
        // Non-constant shooting stars
        this.waitTime = new Date().getTime() + (Math.random() * 3000) + 500;
        this.active = false;
    }
    ShootingStar.prototype.update = function () {
        if (this.active) {
            this.x -= this.speed;
            this.y += this.speed;
            if (this.x < 0 || this.y >= height) {
                this.reset();
            } else {
                bgCtx.lineWidth = this.size;
                bgCtx.beginPath();
                bgCtx.moveTo(this.x, this.y);
                bgCtx.lineTo(this.x + this.len, this.y - this.len);
                bgCtx.stroke();
            }
        } else {
            if (this.waitTime < new Date().getTime()) {
                this.active = true;
            }
        }
    }

    // Init
    var entities = [];
    function init() {
        entities.length = 0;
        for (var i = 0; i < height; i++) { // Stars init
            entities.push(new Star({ x: Math.random() * width, y: Math.random() * height, c: "#ffffff" }));
        }
        for (var i = 0; i < 3; i++) { // Shooting stars init.
            entities.push(new ShootingStar());
        }
    }

    // Animate background
    function animate() {
        bgCtx.clearRect(0, 0, width, height);
        bgCtx.fillStyle = backgroundColor;
        bgCtx.fillRect(0, 0, width, height);
        bgCtx.fillStyle = '#ffffff';
        bgCtx.strokeStyle = '#ffffff';

        var entLen = entities.length;
        while (entLen--) {
            entities[entLen].update();
        }
        window.requestAnimationFrame(animate);
    }

    // Screen Resize
    function resize() {
        width = canvas.offsetWidth;
        height = canvas.offsetHeight;
        canvas.width = width;
        canvas.height = height;
        init();
    }
    window.addEventListener('resize', resize);

    init();
    window.requestAnimationFrame(animate);
}

// Canvas Globe
function canvasGlobe(c, da, grf, rotFact, color, col, colColor, earth) {
    var canvas = document.getElementById(c); // Get the canvas element
    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;
    const ctx = canvas.getContext('2d');

    // Variables
    let width = canvas.clientWidth; // Width of the canvas
    let height = canvas.clientHeight; // Height of the canvas
    var canvasRect = canvas.getBoundingClientRect();
    let rotation = 0; // Rotation of the globe
    let ROTATION_FACTOR = rotFact;
    let dots = [];
    var DOTS_AMOUNT = 0 // Amount of dots on the screen
    if (earth == true) {
        DOTS_AMOUNT = globeDots.length;
    } else {
        DOTS_AMOUNT = da;
    }
    var DOT_COLOR = color; // Color of the dots
    var DOT_COL_COLOR = colColor; // Colision color of the dots
    const GLOBE_RADIUSFACTOR = grf;
    let GLOBE_RADIUS = width * GLOBE_RADIUSFACTOR; // Radius of the globe
    let GLOBE_CENTER_Z = -GLOBE_RADIUS; // Z value of the globe center
    let FIELD_OF_VIEW_FACTOR = 0.8;
    let PROJECTION_CENTER_X = width / 2; // X center of the canvas HTML
    let PROJECTION_CENTER_Y = height / 2; // Y center of the canvas HTML
    let FIELD_OF_VIEW = width * FIELD_OF_VIEW_FACTOR;
    var coloredAmount = 0;

    class Dot {
        constructor(x, y, z, r, c) {
            this.x = -x;
            this.y = y;
            this.z = z;
            this.r = r;
            this.color = c;
            this.col = false;
            this.xProject = 0;
            this.yProject = 0;
            this.sizeProjection = 0;
        }
        colision() {
            if (col == true) {
                var mousePosX = mouseX - canvasRect.left;
                var mousePosY = mouseY - canvasRect.top;
                if (((this.xProject > (mousePosX - mouseSize)) && (this.xProject < (mousePosX + mouseSize))) && ((this.yProject > (mousePosY - mouseSize)) && (this.yProject < (mousePosY + mouseSize)))) {
                    if (this.col == false) {
                        this.color = DOT_COL_COLOR;
                        coloredAmount = coloredAmount + 1;
                        this.col = true;
                    }
                }
            }
        }
        project(sin, cos) { // Math to project the 3D position into the 2D canvas
            const rotX = cos * this.x + sin * (this.z - GLOBE_CENTER_Z);
            const rotZ = -sin * this.x + cos * (this.z - GLOBE_CENTER_Z) + GLOBE_CENTER_Z;
            this.sizeProjection = FIELD_OF_VIEW / (FIELD_OF_VIEW - rotZ);
            this.xProject = (rotX * this.sizeProjection) + PROJECTION_CENTER_X;
            this.yProject = (this.y * this.sizeProjection) + PROJECTION_CENTER_Y;
            if (this.sizeProjection < 0.65) {
                this.color = (this.color).substring(0, 7) + "55";
            } else {
                this.color = (this.color).substring(0, 7) + "aa";
            }
        }
        draw(sin, cos) { // Draw the dot on the canvas
            if (reset == true) {
                this.color = DOT_COLOR;
                coloredAmount = 0;
                this.col = false;
            }
            this.colision();
            this.project(sin, cos);
            ctx.beginPath();
            if (c == "canvasE") {
                if (coloredAmount > 3868) {
                    ctx.fillRect(this.xProject - this.r, this.yProject - this.r, this.r * 2 * this.sizeProjection, this.r * 2 * this.sizeProjection);
                } else {
                    ctx.arc(this.xProject, this.yProject, this.r * this.sizeProjection, 0, Math.PI * 2);
                }
            } else {
                if (coloredAmount == DOTS_AMOUNT) {
                    ctx.fillRect(this.xProject - this.r, this.yProject - this.r, this.r * 2 * this.sizeProjection, this.r * 2 * this.sizeProjection);
                } else {
                    ctx.arc(this.xProject, this.yProject, this.r * this.sizeProjection, 0, Math.PI * 2);
                }
            }
            ctx.closePath();
            ctx.fill();
        }
    }
    function createDots() {
        dots.length = 0; // Empty the array of dots    
        if (earth == true) {
            for (var i = 0; i < DOTS_AMOUNT; i++) { // Create a new dot based on the amount needed
                var xold = (globeDots[i][0] / 1500);
                var yold = (globeDots[i][1] / 750);
                const theta = xold * 2 * Math.PI;
                const phi = Math.acos((yold * 2) - 1);
                // Calculate the [x, y, z] coordinates of the dot along the globe
                const x = (GLOBE_RADIUS * Math.sin(phi) * Math.cos(theta));
                const z = (GLOBE_RADIUS * Math.sin(phi) * Math.sin(theta)) + GLOBE_CENTER_Z;
                const y = ((GLOBE_RADIUS * Math.cos(phi)));
                DOT_RADIUS = Math.floor(Math.random() * 6) + 1;
                dots.push(new Dot(x, y, z, DOT_RADIUS, DOT_COLOR));
            }
        } else {
            for (var i = 0; i < DOTS_AMOUNT; i++) { // Create a new dot based on the amount needed
                const theta = Math.random() * 2 * Math.PI; // Random value between [0, 2PI]
                const phi = Math.acos((Math.random() * 2) - 1); // Random value between [-1, 1]
                // Calculate the [x, y, z] coordinates of the dot along the globe
                const x = (GLOBE_RADIUS * Math.sin(phi) * Math.cos(theta));
                const z = (GLOBE_RADIUS * Math.sin(phi) * Math.sin(theta)) + GLOBE_CENTER_Z;
                const y = ((GLOBE_RADIUS * Math.cos(phi)));
                DOT_RADIUS = Math.floor(Math.random() * 6) + 1;
                dots.push(new Dot(x, y, z, DOT_RADIUS, DOT_COLOR));
            }
        }
    }

    // Render
    function render(a) {
        ctx.clearRect(0, 0, width, height); // Clear the scene
        ctx.fillStyle = DOT_COLOR;
        rotation = a * ROTATION_FACTOR; // Increase the globe rotation
        const sineRotation = Math.sin(rotation); // Sine of the rotation
        const cosineRotation = Math.cos(rotation); // Cosine of the rotation
        for (var i = 0; i < dots.length; i++) { // Loop through the dots array and draw every dot
            ctx.fillStyle = dots[i].color;
            dots[i].draw(sineRotation, cosineRotation);
        }
        window.requestAnimationFrame(render);
    }

    // Screen resize
    function resize() {
        width = canvas.offsetWidth;
        height = canvas.offsetHeight;
        if (window.devicePixelRatio > 1) {
            canvas.width = canvas.clientWidth * 2;
            canvas.height = canvas.clientHeight * 2;
            ctx.scale(2, 2);
        } else {
            canvas.width = width;
            canvas.height = height;
        }
        GLOBE_RADIUS = width * GLOBE_RADIUSFACTOR;
        GLOBE_CENTER_Z = -GLOBE_RADIUS;
        PROJECTION_CENTER_X = width / 2;
        PROJECTION_CENTER_Y = height / 2;
        FIELD_OF_VIEW = width * FIELD_OF_VIEW_FACTOR;
        createDots(); // Reset all dots
    }
    window.addEventListener('resize', resize);

    // Main
    createDots();
    window.requestAnimationFrame(render); // Render the scene
}

// Reset Canvas 
function canvasRPress() {
    reset = true;
    setTimeout(function () {
        reset = false;
    }, 100);
}

// Canvas Hover
function canvasOn(elem) {
    var cont = document.getElementById('container' + elem);
    var can = document.getElementById('canvas' + elem);
    can.classList.remove("show");
    can.classList.add("hide");
    cont.classList.remove("hide");
    cont.classList.add("show");
    if (elem == "W") {
        document.getElementsByClassName("wBlur")[0].style.borderRadius = "0px";
    }
}
function canvasOff(elem) {
    var cont = document.getElementById('container' + elem);
    var can = document.getElementById('canvas' + elem);
    cont.classList.remove("show");
    cont.classList.add("hide");
    can.classList.remove("hide");
    can.classList.add("show");
    if (elem == "W") {
        document.getElementsByClassName("wBlur")[0].style.borderRadius = "100%";
    }
}

// Clock
function updateClock() {
    var currentDate = new Date();
    var today = currentDate.toLocaleDateString("en", { month: "short", day: "2-digit", year: "numeric", hour: "numeric", minute: "2-digit" });
    var date = today.split(" ")[0] + " " + today.split(" ")[1] + " " + today.split(" ")[2].replace(",", "");
    var time = today.split(" ")[3];
    var ampmTime = today.split(" ")[4];
    document.getElementsByClassName("clock")[0].innerHTML = time + '<span class="ampm">' + ampmTime + '</span>';
    document.getElementsByClassName("date")[0].innerHTML = date;
    setTimeout(updateClock, 1000);
}
function clockContainerOn() {
    var e1 = document.getElementsByClassName('dayDateDiv')[0];
    e1.classList.remove("hide");
    e1.classList.add("show");
}
function clockContainerOff() {
    var e1 = document.getElementsByClassName('dayDateDiv')[0];
    e1.classList.remove("show");
    e1.classList.add("hide");
}

// Light
function httpRequest(type, url) {
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.addEventListener("load", transferComplete);
    xmlhttp.addEventListener("error", transferFailed);
    xmlhttp.open(type, url);
    xmlhttp.setRequestHeader("accountId", "");
    xmlhttp.setRequestHeader("tk", "");
    xmlhttp.send();
}
function transferComplete() {
    var resp = this.responseText;
}
function transferFailed() {
    var resp = this.responseText;
    console.log("(Error) Light Status Not Changed: " + resp);
}
function httpRequestRefresh() {
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.addEventListener("load", transferCompleteRefresh);
    xmlhttp.addEventListener("error", transferFailedRefresh);
    xmlhttp.open('GET', '');
    xmlhttp.setRequestHeader("accountId", "");
    xmlhttp.setRequestHeader("tk", "");
    xmlhttp.send();
}
function transferCompleteRefresh() {
    var ckbx = document.getElementById("check");
    var temp = this.responseText.split(":");
    var temp1 = temp[1].split(",");
    var status = temp1[0].slice(1, -1);
    if (status == "on") {
        ckbx.checked = true;
    } else if (status == "off") {
        ckbx.checked = false;
    } else {
        console.log("(Error) Light Status: " + status);
    }
}
function transferFailedRefresh() {
    var resp = this.responseText;
    console.log("(Error) Light Status: " + resp);
}
document.getElementById("check").addEventListener('change', function () {
    if (this.checked) {
        var type = "PUT";
        var url = "";
        httpRequest(type, url, 0);
    } else {
        var type = "PUT";
        var url = "";
        httpRequest(type, url, 0);
    }
});

// Weather
function parseWeatherData() {
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            try {
                var responseText = this.responseText;
                var responseLine = responseText.split('\n');
                console.log("(Success) Parsed Weather Data");
                populateWeatherData(responseLine);
            } catch (e) {
                console.log("(Error) Failed To Parse Weather Data");
            }
        }
    };
    xhttp.open("GET", "", true);
    xhttp.send();
}
function populateWeatherData(line) {
    document.getElementsByClassName("weatherWidget_locationText")[0].innerHTML = line[0].split('\t')[0].split('\t')[0];
    document.getElementsByClassName("weatherWidget_currIconImg")[0].src = line[0].split('\t')[1].split('\t')[0];
    document.getElementsByClassName("weatherWidget_currTemp")[0].innerHTML = line[0].split('\t')[2].split('\t')[0];
    document.getElementsByClassName("weatherWidget_currDesc")[0].innerHTML = line[0].split('\t')[3].split('\t')[0];
    for (var i = 0; i < 5; i++) {
        document.getElementsByClassName("weatherWidget_dayText")[i].innerHTML = line[i + 1].split('\t')[0].split('\t')[0];
        document.getElementsByClassName("weatherWidget_dayIconImg")[i].src = line[i + 1].split('\t')[1].split('\t')[0];
        document.getElementsByClassName("weatherWidget_dayHigh")[i].innerHTML = line[i + 1].split('\t')[2].split('\t')[0];
        document.getElementsByClassName("weatherWidget_dayLow")[i].innerHTML = line[i + 1].split('\t')[3].split('\t')[0];
    }
}