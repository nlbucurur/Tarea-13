/**
* Este codigo realiza una simulación de dos pendulos acoplados, uno debajo
* del otro, es posible variarles las masas, longitudes y condiciones iniciales.
*
* Lorena Bucurú Rodriguez; Andŕes Felipe Moreno Sarria
*/
var g = 9.81;  // Gravedad
var time = 0;  // Tiempo inicial


/**
* Este objeto corresponde al "canvas" o lienzo en el cual se realizará la
* animación
*/
var canvas = {
  element: document.getElementById("canvas"),
  width: 4000,
  height: 2000,

  init: function () {
    this.element.width = this.width;
    this.element.height = this.height;
    this.context = this.element.getContext("2d");
    this.interval = window.setInterval(setReset, 10);
  },
};


canvas.init();  // Inizcializar el canvas


/**
* Esta función retorna un pendulo
*
* @param mass {number} - La masa del pendulo
*
* @param anchor {object} - El anclaje del pendulo
*
* @param lenght {number} - La longitud del pendulo
*
* @param angle {number} - El angulo del pendulo respecto a la vertical
* (en grados)
*
* @param angularVelocity {number} - la velocidad angular del pendulo
*
* @return un pendulo nuevo
*/
var Pendulum = function (mass, anchor, length, angle, angularVelocity) {
  this.mass = mass;
  this.anchor = anchor;
  this.length = length;
  this.angle = angle*Math.PI/180;
  this.angularVelocity = angularVelocity;


  /**
  * Esta función imprime en pantalla los pendulos, a partir del centro del
  * canvas
  */
  this.draw = function () {
    xInitial = this.anchor[0];
    yInitial = this.anchor[1];
    xFinal = this.length*Math.sin(this.angle);
    yFinal = this.length*Math.cos(this.angle);

    canvas.context.beginPath();
    canvas.context.moveTo(xInitial + canvas.width/2, yInitial +
      canvas.height/2);
    canvas.context.lineTo(xInitial + xFinal + canvas.width/2, yInitial +
      yFinal + canvas.height/2);
    canvas.context.lineWidth = 5;
    canvas.context.stroke();

    canvas.context.beginPath();
    canvas.context.arc(xInitial + xFinal + canvas.width/2, yInitial + yFinal +
       canvas.height/2, 20, 0, 2 * Math.PI);
    canvas.context.fillStyle = "#3400aa";
    canvas.context.fill();
    canvas.context.lineWidth = 5;
    canvas.context.stroke();
  };

  return this;
};


var pendulum1 = new Pendulum(4, [0,0], 450, -40, 0.2); // pendulo 1

var pendulum2 = new Pendulum(16, [pendulum1.length*Math.sin(pendulum1.angle),
  pendulum1.length*Math.cos(pendulum1.angle)], 50, 70, 1); // pendulo 2


/**
* Ecuaciones diferenciales para los pendulos acoplados, para la implementación
* de Runge-Kutta de cuarto orden.
*
* @param pendulumA {pendulum} - Primer péndulo del sistema
*
* @param pendulumB {pendulum} - Segundo péndulo del sistema
*
* @param t {number} - Tiempo
*
* @param kTheta1 {number} - Parametro de Runge-Kutta para el angulo del primer
* pendulo
*
* @param kTheta2 {number} - Parametro de Runge-Kutta para el angulo del segundo
* pendulo
*
* @param kOmega1 {number} - Parametro de Runge-Kutta para la velocidad angular
* del primer pendulo
*
* @param kOmega2 {number} - Parametro de Runge-Kutta para la velocidad angular
* del primer pendulo
*/
function dTheta1 (pendulumA, pendulumB, t, kTheta1, kTheta2, kOmega1, kOmega2) {
  return pendulumA.angularVelocity+kOmega1;
}

function dTheta2 (pendulumA, pendulumB, t, kTheta1, kTheta2, kOmega1, kOmega2) {
  return pendulumB.angularVelocity+kOmega2;
}

function dOmega1 (pendulumA, pendulumB, t, kTheta1, kTheta2, kOmega1, kOmega2) {
  var m1 = pendulumA.mass;
  var m2 = pendulumB.mass;
  var l1 = pendulumA.length;
  var l2 = pendulumB.length;
  var theta1 = pendulumA.angle+kTheta1;
  var theta2 = pendulumB.angle+kTheta2;
  var omega1 = pendulumA.angularVelocity+kOmega1;
  var omega2 = pendulumB.angularVelocity+kOmega2;

  var dOmega = -(g * (2 * m1 + m2) * Math.sin(theta1) + m2 * g *
  Math.sin(theta1 - 2 * theta2) + 2 * Math.sin(theta1 - theta2) * m2 *
  (omega2 * omega2 * l2 + omega1*omega1 * l1 * Math.cos(theta1 - theta2))) /
  (l1 * (2 * m1 + m2 - m2 * Math.cos(2 * theta1 - 2 * theta2)));

  return dOmega;
}

function dOmega2 (pendulumA, pendulumB, t, kTheta1, kTheta2, kOmega1, kOmega2) {
  var m1 = pendulumA.mass;
  var m2 = pendulumB.mass;
  var l1 = pendulumA.length;
  var l2 = pendulumB.length;
  var theta1 = pendulumA.angle;
  var theta2 = pendulumB.angle;
  var omega1 = pendulumA.angularVelocity;
  var omega2 = pendulumB.angularVelocity;

  var dOmega = (2 * Math.sin(theta1 - theta2) * (omega1 * omega1 * l1 * (m1 +
    m2) + g * (m1 + m2) * Math.cos(theta1) + omega2 * omega2 * l2 * m2 *
    Math.cos(theta1 - theta2))) / (l2 * (2 * m1 + m2 - m2 * Math.cos(2 *
      theta1 - 2 * theta2)));

  return dOmega;
}


/**
* Ecuaciones diferenciales para los pendulos acoplados, para la implementación
* de Runge-Kutta de cuarto orden.
*
* @param pendulumA {pendulum} - Primer péndulo del sistema
*
* @param pendulumB {pendulum} - Segundo péndulo del sistema
*
* @param t {number} - Tiempo
*
* @param h {number} - Avance en el tiempo
*/
function RK4 (pendulumA, pendulumB, h, t) {
  var kThetaA1 = h*dTheta1(pendulumA, pendulumB, t, 0, 0, 0, 0);
  var kOmegaA1 = h*dOmega1(pendulumA, pendulumB, t, 0, 0, 0, 0);
  var kThetaB1 = h*dTheta2(pendulumA, pendulumB, t, 0, 0, 0, 0);
  var kOmegaB1 = h*dOmega2(pendulumA, pendulumB, t, 0, 0, 0, 0);


  var kThetaA2 = h*dTheta1(pendulumA, pendulumB, t +h * 0.5, kThetaA1 * 0.5,
    kThetaB1 * 0.5, kOmegaA1 * 0.5, kOmegaB1 * 0.5);
  var kOmegaA2 = h*dOmega1(pendulumA, pendulumB, t +h * 0.5, kThetaA1 * 0.5,
    kThetaB1 * 0.5, kOmegaA1 * 0.5, kOmegaB1 * 0.5);
  var kThetaB2 = h*dTheta2(pendulumA, pendulumB, t +h * 0.5, kThetaA1 * 0.5,
    kThetaB1 * 0.5, kOmegaA1 * 0.5, kOmegaB1 * 0.5);
  var kOmegaB2 = h*dOmega2(pendulumA, pendulumB, t +h * 0.5, kThetaA1 * 0.5,
    kThetaB1 * 0.5, kOmegaA1 * 0.5, kOmegaB1 * 0.5);


  var kThetaA3 = h*dTheta1(pendulumA, pendulumB, t +h * 0.5, kThetaA2 * 0.5,
    kThetaB2 * 0.5, kOmegaA2 * 0.5, kOmegaB2 * 0.5);
  var kOmegaA3 = h*dOmega1(pendulumA, pendulumB, t +h * 0.5, kThetaA2 * 0.5,
    kThetaB2 * 0.5, kOmegaA2 * 0.5, kOmegaB2 * 0.5);
  var kThetaB3 = h*dTheta2(pendulumA, pendulumB, t +h * 0.5, kThetaA2 * 0.5,
    kThetaB2 * 0.5, kOmegaA2 * 0.5, kOmegaB2 * 0.5);
  var kOmegaB3 = h*dOmega2(pendulumA, pendulumB, t + h * 0.5, kThetaA2 * 0.5,
    kThetaB2 * 0.5, kOmegaA2 * 0.5, kOmegaB2 * 0.5);


  var kThetaA4 = h*dTheta1(pendulumA, pendulumB, t + h, kThetaA3, kThetaB3,
    kOmegaA3, kOmegaB3);
  var kOmegaA4 = h*dOmega1(pendulumA, pendulumB, t + h, kThetaA3, kThetaB3,
    kOmegaA3, kOmegaB3);
  var kThetaB4 = h*dTheta2(pendulumA, pendulumB, t + h, kThetaA3, kThetaB3,
    kOmegaA3, kOmegaB3);
  var kOmegaB4 = h*dOmega2(pendulumA, pendulumB, t + h, kThetaA3, kThetaB3,
    kOmegaA3, kOmegaB3);


  pendulumA.angle += (kThetaA1 + kThetaA3 * 0.5 + kThetaA3 * 0.5 +
    kThetaA4)/6;
  pendulumA.angularVelocity += (kOmegaA1 + kOmegaA3 * 0.5 + kOmegaA3 * 0.5 +
    kOmegaA4)/6;
  pendulumB.anchor = [pendulumA.length * Math.sin(pendulumA.angle),
    pendulumA.length * Math.cos(pendulumA.angle)];
  pendulumB.angle += (kThetaB1 + kThetaB3 * 0.5 + kThetaB3 * 0.5 +
    kThetaB4) / 6;
  pendulumB.angularVelocity += (kOmegaB1 + kOmegaB3 * 0.5 + kOmegaB3 * 0.5 +
    kOmegaB4) / 6;
}


/**
* Función para actualizar la pantalla
*/
function setReset () {
  canvas.context.clearRect(0, 0, canvas.width, canvas.height);

  var h = 0.1;

  RK4(pendulum1, pendulum2, h, time);

  time += h;
  pendulum1.draw();
  pendulum2.draw();
}
