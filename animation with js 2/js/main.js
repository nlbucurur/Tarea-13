/**
*Este programa simula el movimiento de dos pendulos acoplados por un resorte
*Estos pendulos tienen la misma longitud en la cuerda, diferentes masas,
*y diferentes velocidades angulares iniciales.
*Neidy Lorena Bucurú Rodríguez y Andrés Felipe Moreno Sarria.
*/
//El canvas es la pantalla (lienzo) y aquí es donde se imprimen los dibujos
var canvas = {
  element: document.getElementById("canvas"),
  width: 1500,
  height: 1000,

  // Esta función dibuja los elementos del sistema, usando la función screenP,
  //Que se encuentra más adelante.
  init: function() {
    this.element.width = this.width;
    this.element.height = this.height;
    this.context = this.element.getContext("2d");
    this.interval = window.setInterval(screenP, 10);
  }
};

canvas.init();

/**
* Esta funcion retorna un pendulo.
*
* @param length {Number} - la longitud del pendulo
* @param mass {Number} - la masa del pendulo
* @param positionIni {Object} - la posicion del punto de anclaje
* @param angle {Number} - el angulo inicial del pendulo
* @param velocityAng {Number} - la velocidad angular inicial del pendulo
* @return un nuevo pendulo
*/
var Pendulum = function(length, mass, positionIni, angle, velocityAng) {
  this.length = length;
  this.mass = mass;
  this.positionIni = positionIni;
  this.angle = angle*Math.PI/180; //se pasa de grados a radianes
  this.velocityAng = velocityAng;

  this.draw = function() {
    var xi = this.positionIni[0]; //el punto x de donde está colgado el pendulo
    var yi = this.positionIni[1]; //el punto x de donde está colgado el pendulo
    var xf = this.length*Math.sin(this.angle); //el punto x de la masa
    var yf = this.length*Math.cos(this.angle); //el punto y de la masa

    //Se dibuja el techo
    canvas.context.beginPath();
    canvas.context.moveTo(canvas.width/2 + xi - 100, yi);
    canvas.context.lineTo(canvas.width/2 + xi + 100, yi);
    canvas.context.lineWidth = 5;
    canvas.context.stroke();

    //se dibujan las cuerdas
    canvas.context.beginPath();
    canvas.context.moveTo(canvas.width/2 + xi, yi);
    canvas.context.lineTo(canvas.width/2 + xi + xf, yi + yf);
    canvas.context.lineWidth = 3;
    canvas.context.stroke();

    //se dibujan las masas
    canvas.context.beginPath();
    canvas.context.arc(canvas.width/2 + xi + xf, yi + yf, 20,
       0, 2 * Math.PI);
    canvas.context.fillStyle = "#458496";
    canvas.context.fill();
    canvas.context.lineWidth = 3;
    canvas.context.stroke();
  };

  return this;
};

/**
* Esta funcion retorna un resorte.
*
* @param length {Number} - la longitud del resorte
* @param positionIni {Object} - la posicion del punto de anclaje
* @param positionFin {Object} - la posicion del punto de anclaje
* @param k {number} - constante del resorte
* @return un nuevo resorte
*/
var spring = function(length, positionIni, positionFin, k) {
  this.length = length;
  this.positionIni = positionIni;
  this.positionFin = positionFin;
  this.k = k;
  this.img = document.getElementById("resorte");

  this.draw = function() {
    var xi = this.positionIni[0];
    var yi = this.positionIni[1];
    var xf = this.positionFin[0];
    var yf = this.positionFin[1];

    //aquí ae quiere usar una imagen para dibujar el resorte
    canvas.context.translate(canvas.width/2 + xi, yi);
    canvas.context.rotate(Math.atan2(yf-yi,xf-xi));
        canvas.context.translate(0, -37.84808/2);
    canvas.context.scale(Math.sqrt((yf-yi)*(yf-yi)+(xf-xi)*(xf-xi))/289.94702,1);
    canvas.context.drawImage(this.img, 0, 0);

    canvas.context.scale(289.94702/Math.sqrt((yf-yi)*(yf-yi)+(xf-xi)*(xf-xi)),1);
        canvas.context.translate(0, 37.84808/2);
    canvas.context.rotate(-Math.atan2(yf-yi,xf-xi));
    canvas.context.translate(-canvas.width/2 - xi, - yi);
  };

  return this;
};

//para usar runge-kutta4
function dtheta1(penduloA, penduloB, resorte, t, kTheta1, kTheta2, kOmega1, kOmega2) {
  return penduloA.velocityAng + kOmega1;
}

//para usar runge-kutta4
function dtheta2(penduloA, penduloB, resorte, t, kTheta1, kTheta2, kOmega1, kOmega2) {
  return penduloB.velocityAng + kOmega2;
}

//para usar runge-kutta4 omega1 es la derivada de theta1 (masa 1) con respecto a t
function dOmega1(penduloA, penduloB, resorte, t, kTheta1, kTheta2, kOmega1, kOmega2) {
  var a = -resorte.length - penduloA.length * Math.sin(penduloB.angle + kTheta2) +
  penduloA.length * Math.sin(penduloA.angle + kTheta1);

  var b = penduloA.length * Math.cos(penduloB.angle + kTheta2) -
  penduloA.length * Math.cos(penduloA.angle + kTheta1);

  var c = Math.sqrt(a*a + b*b);

  var g = 9.81;

  var res = (resorte.k*(2*penduloA.length*Math.cos(penduloA.angle + kTheta1)*a+
  2*penduloA.length*Math.sin(penduloA.angle + kTheta1)*b)*(resorte.length-c))/
  (2*c*penduloA.length*penduloA.length*penduloA.mass)- g*Math.sin(penduloA.angle + kTheta1)/
  penduloA.length;

  return res;
}

//para usar runge-kutta4 omega2 es la derivada de theta2 con respecto a t
function dOmega2(penduloA, penduloB, resorte, t, kTheta1, kTheta2, kOmega1, kOmega2) {
  var a = -resorte.length - penduloA.length * Math.sin(penduloB.angle + kTheta2) +
  penduloA.length * Math.sin(penduloA.angle + kTheta1);

  var b = penduloA.length * Math.cos(penduloB.angle + kTheta2) -
  penduloA.length * Math.cos(penduloA.angle + kTheta1);

  var c = Math.sqrt(a*a + b*b);

  var g = 9.81;

  var res = (resorte.k*(-2*penduloA.length*Math.cos(penduloB.angle + kTheta2)*a-
  2*penduloA.length*Math.sin(penduloB.angle + kTheta2)*b)*(resorte.length-c))/
  (2*c*penduloA.length*penduloA.length*penduloB.mass)- g*Math.sin(penduloB.angle + kTheta2)/
  penduloA.length;

  return res;
}

//Aquí se usa el metodo runge-kutta, para resolver las ecuaciones diferenciales
function RK4(penduloA, penduloB, resorte, h, t) {
  var kThetaA1 = h * dtheta1(penduloA, penduloB, resorte, t, 0, 0, 0, 0);
  var kThetaB1 = h * dtheta2(penduloA, penduloB, resorte, t, 0, 0, 0, 0);
  var kOmegaA1 = h * dOmega1(penduloA, penduloB, resorte, t, 0, 0, 0, 0);
  var kOmegaB1 = h * dOmega2(penduloA, penduloB, resorte, t, 0, 0, 0, 0);

  var kThetaA2 = h * dtheta1(penduloA, penduloB, resorte, t+h/2,
    1/2*kThetaA1, 1/2*kThetaB1, 1/2*kOmegaA1, 1/2*kOmegaB1);
  var kThetaB2 = h * dtheta2(penduloA, penduloB, resorte, t+h/2,
    1/2*kThetaA1, 1/2*kThetaB1, 1/2*kOmegaA1, 1/2*kOmegaB1);
  var kOmegaA2 = h * dOmega1(penduloA, penduloB, resorte, t+h/2,
    1/2*kThetaA1, 1/2*kThetaB1, 1/2*kOmegaA1, 1/2*kOmegaB1);
  var kOmegaB2 = h * dOmega2(penduloA, penduloB, resorte, t+h/2,
    1/2*kThetaA1, 1/2*kThetaB1, 1/2*kOmegaA1, 1/2*kOmegaB1);

  var kThetaA3 = h * dtheta1(penduloA, penduloB, resorte, t+h/2,
    1/2*kThetaA2, 1/2*kThetaB2, 1/2*kOmegaA2, 1/2*kOmegaB2);
  var kThetaB3 = h * dtheta2(penduloA, penduloB, resorte, t+h/2,
    1/2*kThetaA2, 1/2*kThetaB2, 1/2*kOmegaA2, 1/2*kOmegaB2);
  var kOmegaA3 = h * dOmega1(penduloA, penduloB, resorte, t+h/2,
    1/2*kThetaA2, 1/2*kThetaB2, 1/2*kOmegaA2, 1/2*kOmegaB2);
  var kOmegaB3 = h * dOmega2(penduloA, penduloB, resorte, t+h/2,
    1/2*kThetaA2, 1/2*kThetaB2, 1/2*kOmegaA2, 1/2*kOmegaB2);

  var kThetaA4 = h * dtheta1(penduloA, penduloB, resorte, t+h,
    kThetaA3, kThetaB3, kOmegaA3, kOmegaB3);
  var kThetaB4 = h * dtheta2(penduloA, penduloB, resorte, t+h,
    kThetaA3, kThetaB3, kOmegaA3, kOmegaB3);
  var kOmegaA4 = h * dOmega1(penduloA, penduloB, resorte, t+h,
    kThetaA3, kThetaB3, kOmegaA3, kOmegaB3);
  var kOmegaB4 = h * dOmega2(penduloA, penduloB, resorte, t+h,
    kThetaA3, kThetaB3, kOmegaA3, kOmegaB3);

  penduloA.angle += (kThetaA1 + 2*kThetaA2 + 2*kThetaA3 + kThetaA4)/6;
  penduloB.angle += (kThetaB1 + 2*kThetaB2 + 2*kThetaB3 + kThetaB4)/6;
  penduloA.velocityAng += (kOmegaA1 + 2*kOmegaA2 + 2*kOmegaA3 + kOmegaA4)/6;
  penduloB.velocityAng += (kOmegaB1 + 2*kOmegaB2 + 2*kOmegaB3 + kOmegaB4)/6;
  resorte.positionIni = [penduloA.length*Math.sin(penduloA.angle),
    penduloA.positionIni[1] + penduloA.length*Math.cos(penduloA.angle)];
  resorte.positionFin = [penduloB.positionIni[0] + penduloB.length*Math.sin(penduloB.angle),
    penduloB.positionIni[1] + penduloB.length*Math.cos(penduloB.angle)];

}

//esta función dibuja
function screenP() {
  canvas.context.clearRect(0, 0, canvas.width, canvas.height);
  var h = 0.1;

  RK4(pendulo1, pendulo2, spring1, h, t);

  t += h;
  spring1.draw();
  pendulo1.draw();
  pendulo2.draw();

}

//estas variables crea los pendulos y se ponen sus condiciones iniciales
var pendulo1 = new Pendulum(300, 5, [0,320], -5, 0.1);
var pendulo2 = new Pendulum(300, 5, [100,320], 5, 0);
var spring1 = new spring(400, [pendulo1.length*Math.sin(pendulo1.angle),
  pendulo1.length*Math.cos(pendulo1.angle)], [pendulo2.positionIni[0]+
  pendulo2.length*Math.sin(pendulo2.angle), pendulo2.positionIni[1]+
  pendulo2.length*Math.cos(pendulo2.angle)], 5);

var t = 0;
spring1.draw();
pendulo1.draw();
pendulo2.draw();
