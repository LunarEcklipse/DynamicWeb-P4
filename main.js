// Using p5.js

// CLASSES //

class PlanetAPI
{
    static fetch_planets_from_api()
    {
        (async function () {
            const response = await fetch("https://raw.githubusercontent.com/LunarEcklipse/DynamicWeb-P4/main/data/planets.json");
            const data = await response.json();
            console.log(data);
        })();
    }
}

class Coordinate
{
    constructor(x, y)
    {
        this.x = x;
        this.y = y;
    }
}

class Planet
{
    static validate_color_hex(hex_string) // Returns true or false
    {
        const hex_regex = new RegExp("^#?(?:[0-9a-fA-F]{3}){1,2}$");
        return hex_regex.test(hex_string);
    }

    constructor(name, radius, distance_from_sun, rotation_period, orbital_period, color)
    {
        this.name = name;
        this.radius = radius;
        this.distance_from_sun = distance_from_sun * 1000000;
        this.rotation_period = rotation_period;
        this.orbital_period = orbital_period;
        if (Planet.validate_color_hex(color))
        {
            this.color = color;
        }
        else
        {
            console.log("Invalid color hex string. Using default color (white)");
            this.color = "#FFFFFF";
        }
    }
}

// WINDOW FUNCTIONS //

class Window
{
    static resize_window()
    {
        resizeCanvas(windowWidth, windowHeight);
    }

    static calculate_center_of_window()
    {
        return new Coordinate(windowWidth / 2, windowHeight / 2);
    }

    static get_shortest_window_side()
    {
        return min(windowWidth, windowHeight);
    }

    static get_longest_window_side()
    {
        return max(windowWidth, windowHeight);
    }
}

// DRAWING FUNCTIONS //


function setup()
{

}

function draw()
{

}
