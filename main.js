// Using p5.js

// CLASSES //
class Planet
{
    /*
        Radius is in km
        Distance from sun is in km * 1,000,000
        Rotation period is in days
        Orbital period is in days
    */
    constructor(name, radius, color, distance_from_sun, rotation_period, orbital_period)
    {
        this.name = name;
        this.radius = radius;
        this.color = color;
        this.distance_from_sun = distance_from_sun;
        this.rotation_period = rotation_period;
        this.orbital_period = orbital_period;
    }
}

function resize_window()
{
    resizeCanvas(windowWidth, windowHeight);
}

function calculate_center_of_window()
{

}

function setup()
{

}

function draw()
{

}
