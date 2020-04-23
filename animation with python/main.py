"""Serie de Fourier animada."""
from matplotlib import pyplot as plt
from matplotlib import animation
import math

"""
Este código genera un archivo mp4 con una animación de la serie de Fourier de
una función con n terminos.

Lorena Bucurú Rodriguez; Andŕes Felipe Moreno Sarria
"""

"""Cofigurar las figuras, los ejes y los entornos donde se animará."""
fig = plt.figure()
ax = plt.axes(xlim=(0, 2 * math.pi), ylim=(-3.5, 2.5))
ax.grid()
line, = ax.plot([], [], lw=1)
time_text = ax.text(0.02, 0.95, '', transform=ax.transAxes)


def f(x, n):
    """Serie de Fourier."""
    """
    Esta función retorna la serie de Fourier para una función a trozos
    con n terminos, en x.
    """

    s = 1/4

    for m in range(1, n+1):
        a = -(3 * math.sin(2 * math.pi * m))/(math.pi * m) + \
         (5 * math.sin((3 * math.pi * m) / 2)) / (math.pi * m) \
         - math.sin(math.pi * m) / (math.pi * m)

        b = (3 * math.cos(2 * math.pi * m)) / (math.pi * m) - \
            (5 * math.cos((3 * math.pi * m) / 2)) / (math.pi * m) + \
            math.cos(math.pi * m) / (math.pi * m) + 1 / (math.pi * m)

        s += a * math.cos(m * x) + b * math.sin(m * x)

    return s


def init():
    """Establecer los datos de la grafica a animar."""
    line.set_data([], [])  # gráifca
    time_text.set_text('')  # terminos de la serie

    return line, time_text


def animate(i):
    """Actualización de la animación."""
    x = []
    y = []

    print("{:.2f}%".format(i/1.50))

    for j in range(500):
        x.append(j/500*2*math.pi)
        y.append(f(x[j], i))

    line.set_data(x, y)  # gráifca
    time_text.set_text("n={}".format(i))  # terminos de la serie

    return line, time_text


"""Animación."""
anim = animation.FuncAnimation(fig, animate, init_func=init,
                               frames=150, interval=20, blit=True)

"""Guardar animación."""
anim.save('Fourier.mp4', fps=30, extra_args=['-vcodec', 'libx264'])
