// Using p5.js

// CLASSES //

class PlanetAPI
{
    static get_planets() // Returns a map containing planets
    {
        const out_planets = new Map();
        (async function () {
            const response = await fetch("https://raw.githubusercontent.com/LunarEcklipse/DynamicWeb-P4/main/data/planets.json");
            const data = await response.json();
            for (let i = 0; i < data.length; i++)
            {
                out_planets.set(data[i].name, new Planet(data[i].name, data[i].radius, data[i].distance_from_sun, data[i].rotation_period, data[i].orbital_period, data[i].color));
            }
        })();
        return out_planets;
    }
}

class ViewMode
{
    /* Display modes are:
    -1: Startup
    0 : Display planet sizes to scale, but not to distance. Make scrollable downwards.
    1 : Display planet sizes to distance, but not to size. Make scrollable downwards.

    */

    constructor()
    {
        this.current_mode = -1;
    }

    get current_mode()
    {
        return this.current_mode;
    }

    set_scale_mode()
    {
        this.current_mode = 0;
    }

    set_distance_mode()
    {
        this.current_mode = 1;
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

    convert_color_hex_to_rgb() // Returns an object containing rgb values
    {
        if (Planet.validate_color_hex(this.color))
        {
            const hex_string = this.color.replace("#", "");
            const r = parseInt(hex_string.substring(0, 2), 16);
            const g = parseInt(hex_string.substring(2, 4), 16);
            const b = parseInt(hex_string.substring(4, 6), 16);
            return {r: r, g: g, b: b};
        }
        else
        {
            console.error(```Invalid color hex string (${this.color.toString()}). Using default color (white).```);
            return {r: 255, g: 255, b: 255};
        }
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
            console.log(```Invalid color hex string (${color.toString()}). Using default color (white).```);
            this.color = "#FFFFFF";
        }
        this.current_rotation = 0; // Tracks the individual rotation of the planet.
        this.degrees_around_sun = 0; // Tracks the number of degrees around the sun the planet is, clockwise. 0 is top, 90 is right, 180 is bottom, 270 is left.
        
        this.starting_rotation = set_random_rotation(); // These determine random starting positions.
        this.starting_position = set_random_position_around_sun();
    }

    // RANDOM START POSITION SETTERS //

    set_random_rotation()
    {
        this.current_rotation = Math.floor(Math.random() * 360);
    }

    set_random_position_around_sun()
    {
        this.degrees_around_sun = Math.floor(Math.random() * 360);
    }

    // GETTERS //

    get diameter()
    {
        return this.radius * 2;
    }

    get_current_coordinates(frame_count, scale) // Returns a Coordinate object.
    {
        
    }

    // DRAWING FUNCTIONS + HELPERS //
    calculate_planet_position(frame_count, scale) // Calculates the position of the planet around the sun at this given moment. This is calculated per planet per frame.
    {
        // Calculate how many degrees to rotate per frame, and then the current rotation of this planet.
        let degrees_per_day = 360 / this.rotation_period;
        let degrees_per_second = degrees_per_day * scale; // Scale represents how many days per IRL second to simulate.
        let degrees_per_frame = degrees_per_second / 60; // 60 frames per second.
        let degrees_to_rotate = degrees_per_frame * frame_count;
        if (degrees_to_rotate >= 360)
        {
            degrees_to_rotate = degrees_to_rotate % 360;
        }
        this.current_rotation = this.starting_rotation + degrees_to_rotate;

        // Calculate how far around the sun this planet is. Imagine the planet is riding a circular track around the sun.
        degrees_per_day = 360 / this.orbital_period;
        degrees_per_second = degrees_per_day * scale; // Scale represents how many days per IRL second to simulate.
        degrees_per_frame = degrees_per_second / 60; // 60 frames per second.
        degrees_to_rotate = degrees_per_frame * frame_count;
        if (degrees_to_rotate >= 360)
        {
            degrees_to_rotate = degrees_to_rotate % 360;
        }
        this.degrees_around_sun = this.starting_position + degrees_to_rotate;
    }

    draw_planet()
    {

    }
}

// WINDOW FUNCTIONS //

class Window
{
    static resize_window_to_screen()
    {
        resizeCanvas(windowWidth, windowHeight);
    }

    static resize_window_to_dimensions(x, y)
    {
        resizeCanvas(x, y);
    }

    static calculate_center_of_window()
    {
        return new Coordinate(windowWidth / 2, windowHeight / 2);
    }

    static get_shortest_window_side_length()
    {
        return min(windowWidth, windowHeight);
    }

    static get_longest_window_side_length()
    {
        return max(windowWidth, windowHeight);
    }
}

// SCALING FUNCTIONS //
function get_maximum_distance_from_sun(planet_list) // This calculates the planet with the furthest distance from the sun. The planet should be displayed no further than 90% of the shortest side of the canvas (so 45% of center).
{
    let furthest_distance = 0;
    planet_list.forEach(function(value) {
        if (value.distance_from_sun > furthest_distance)
        {
            furthest_distance = value.distance_from_sun;
        }
    });

    return furthest_distance;
}

function get_effective_radius_of_sun() // The sun should take up 8% of the total screen space (4% on each side of center). This converts that number to pixels and returns it because other planets can scale based on this information. No planet should be smaller than 2% of the screen size.
{
    return Math.floor(Window.get_shortest_window_side_length() * 0.04);
}

function get_km_per_pixel_radius(planets) // Sets a scale to render planets against. We can't render to scale because otherwise planets would literally just not exist at the scale of screens.
{
    let smallest_radius = null;
    let largest_radius = null;
    planets.forEach(function(value)
    {
        if (smallest_radius === null || value.radius < smallest_radius)
        {
            smallest_radius = value.radius;
        }

        if (largest_radius === null || value.radius > largest_radius)
        {
            largest_radius = value.radius;
        }
    })

    // Smallest planet should be 2% of screen size, while largest planet should be 5% of screen size.
    let difference_between_radii = largest_radius - smallest_radius;
    let shortest_window_side = Window.get_shortest_window_side();
    let smallest_radius_size = shortest_window_side * 0.02;
    let largest_radius_size = shortest_window_side * 0.05;
    
}

function get_km_per_pixel_distance(maximum_distance_from_sun) // This function calculates how many kilometers should be used per pixel based on the screen size. Since everything displays in a square, we use the shortest window side. We always round 
{

    return maximum_distance_from_sun / (Window.get_shortest_window_side() * 0.45);
}

// DRAWING HELPER FUNCTIONS //

function draw_sun()
{    
    // The radius of the sun is 696,340 km.
    // Figure out the scaling of the sun.
    const sun_radius = 696340;
    const effective_sun_radius = get_effective_radius_of_sun();
    let center_of_window = Window.calculate_center_of_window();
    let shortest_side = Window.get_shortest_window_side();
    
    // Draw the sun.
    colorMode(RGB, 255);
    fill(253, 184, 19);
    stroke(253, 184, 19);
    circle(center_of_window.x, center_of_window.y, effective_sun_radius * 2);
}

// MAIN DRAWING FUNCTIONS //

function draw_startup_mode()
{

}

function draw_scale_mode()
{

}

function draw_distance_mode()
{

}

// GLOBAL VARIABLES //

const planets = PlanetAPI.get_planets(); // This is a map containing all of the planets. The key is the name of the planet, and the value is the planet object.
var maximum_distance_from_sun = 0; // This keeps track of the furthest distance from the sun. It is updated every frame.
var km_per_pixel_distance = 0; // This keeps track of how many kilometers should be used per pixel. It is updated every frame. We use this for distance between centers of planets only, otherwise every planet would effectively not exist due to sheer scale.
var km_per_pixel_radius = 0; // This keeps track of how many kilometers should be used per pixel. It is updated every frame. We use this for radius of planets only, otherwise distances between planets would be nonexistent.
var view_mode = new ViewMode(); // This keeps track of the current view mode. 0 is size to scale, 1 is distance to scale. -1 is uninitialized/starting up.

// P5 MAIN FUNCTIONS //

function setup() // Called once before draw()
{
    colorMode(RGB, 255);
    createCanvas(windowWidth, windowHeight);
}

/*
STEPS

Get user input on if they want to see the planets to scale or to distance

SCALE:
1. Find biggest planet
2. Set render scale to be 90% of shortest side of screen
3. Render every planet to scale based on that scale

Sun is going to be bigger so we set the sun to the normal render scale and render it at y=0

DISTANCE:
1. Find furthest planet
2. Set distance of that planet to be equal to y = 3 * screen length, set planets to scale based on that. Planets won't be to scale though because of size or else they'd be invisible
3. Render every planet based on that distance scale

*/
function draw() // Called every frame
{
    background(0);
    switch (view_mode.current_mode)
    {
        case -1:
            draw_startup_mode();
            break;

        case 0:
            draw_scale_mode();
            break;

        case 1:
            draw_distance_mode();
            break;
        default:
            throw new Error(```Invalid view mode: ${view_mode.current_mode.toString()}.```);
            break;
    }
}
