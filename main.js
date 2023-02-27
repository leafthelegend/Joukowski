
class Plane {
    constructor(centerX, centerY) {
        this.centerX = centerX;
        this.centerY = centerY;
    }
    zoom(factor, focusX, focusY) {
        this.centerX = (this.centerX - focusX) / factor + focusX;
        this.centerY = (this.centerY - focusY) / factor + focusY;
    }
    pan(dx, dy) {
        this.centerX += dx;
        this.centerY += dy;
    }
}
class CanvasUI {
    constructor(canvas, plane, scale) {
        this.dragging = false;
        this.canvas = canvas;
        canvas.addEventListener("contextmenu", (e) => {
            e.preventDefault();
        }, false);
        this.plane = plane;
        let context = canvas.getContext('2d');
        this.scale = scale;
        if (!context || !(context instanceof CanvasRenderingContext2D)) {
            throw new Error('Failed to get 2D context');
        }
        this.ctx = context;
        this.initialiseListeners();
    }
    ;
    xPixelToCart(xPix) {
        let offset = (xPix - this.canvas.width / 2) / this.scale;
        return this.plane.centerX + offset;
    }
    ;
    yPixelToCart(yPix) {
        let offset = (yPix - this.canvas.height / 2) / this.scale;
        return this.plane.centerY + offset;
    }
    ;
    xToPixel(x) {
        let offset = (x - this.plane.centerX) * this.scale;
        return (this.canvas.width / 2 + offset);
    }
    ;
    yToPixel(y) {
        let offset = (y - this.plane.centerY) * this.scale;
        return (this.canvas.height / 2 + offset);
    }
    ;
    zoom(factor, mouseX, mouseY) {
        let cartFocusX = this.xPixelToCart(mouseX);
        let cartFocusY = this.yPixelToCart(mouseY);
        this.scale *= factor;
        this.plane.zoom(factor, cartFocusX, cartFocusY);
    }
    pan(dx, dy) {
        this.plane.pan(dx / this.scale, dy / this.scale);
    }
    initialiseListeners() {
        this.canvas.onwheel = (e) => {
            if (e.deltaY < 0) {
                this.zoom(1.05, e.offsetX * this.canvas.width / this.canvas.clientWidth, e.offsetY * this.canvas.height / this.canvas.clientHeight);
            }
            else {
                this.zoom(0.95, e.offsetX * this.canvas.width / this.canvas.clientWidth, e.offsetY * this.canvas.height / this.canvas.clientHeight);
            }
        };
        this.canvas.onmousemove = (e) => {
            if (e.buttons == 2) {
                this.dragging = true;
                this.pan(-e.movementX, -e.movementY);
            }
        };
    }
}

var cX = 0;
var cY = 0;

function loaded() {

    var canvas = document.getElementById("canvas");
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    //listen for resize events
    window.addEventListener("resize", function () {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        draw();
    }, false);
    var plane = new Plane(0, 0);
    var canvasUI = new CanvasUI(canvas, plane, 100);
    canvas.addEventListener("mousedown", function (e) {
        if (e.button == 0) {
            cX = canvasUI.xPixelToCart(e.offsetX * canvas.width / canvas.clientWidth);
            cY = canvasUI.yPixelToCart(e.offsetY * canvas.height / canvas.clientHeight);
        }
    }, false);
    canvas.addEventListener("mousemove", function (e) {
        if (e.buttons == 1) {
            cX = canvasUI.xPixelToCart(e.offsetX * canvas.width / canvas.clientWidth);
            cY = canvasUI.yPixelToCart(e.offsetY * canvas.height / canvas.clientHeight);
        }
    }, false);





    function draw() {
        let ctx = canvasUI.ctx;
        ctx.strokeStyle = "grey";
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        //draw the axes
        ctx.beginPath();
        ctx.lineWidth = 1;
        ctx.moveTo(0, canvasUI.yToPixel(0));
        ctx.lineTo(canvasUI.canvas.width, canvasUI.yToPixel(0));
        ctx.moveTo(canvasUI.xToPixel(0), 0);
        ctx.lineTo(canvasUI.xToPixel(0), canvasUI.canvas.height);
        ctx.stroke();
        let r = get_radius(cX,cY);
        //draw the circle
        ctx.beginPath();
        ctx.lineWidth = 1;
        ctx.arc(canvasUI.xToPixel(cX), canvasUI.yToPixel(cY), r * canvasUI.scale, 0, 2 * Math.PI);
        ctx.stroke();
        [oldx, oldy] = j_transform(cX + r, cY);
        //set color to red
        ctx.strokeStyle = "red";
        for (let theta = 0; theta < 2 * Math.PI; theta += 0.01) {
            let x = r * Math.cos(theta) + cX;
            let y = r * Math.sin(theta) + cY;
            let [newx, newy] = j_transform(x, y);
            ctx.beginPath();
            ctx.lineWidth = 1;
            ctx.moveTo(canvasUI.xToPixel(oldx), canvasUI.yToPixel(oldy))
            ctx.lineTo(canvasUI.xToPixel(newx), canvasUI.yToPixel(newy));
            [oldx, oldy] = [newx, newy];
            ctx.stroke();
        }
    }

    function animate() {
        draw();
        requestAnimationFrame(animate);
    }
    animate();
}

loaded();

function j_transform(a,b){
    z = math.complex(a,b);
    newz = math.add(z,z.inverse())
    return [newz.re,newz.im]
}

function get_radius(a,b){
    return(math.sqrt((a-1)**2+b**2))
}