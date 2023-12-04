var script_is_loaded = false;

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
        this.set_uninitialized_mode();
    }

    set_uninitialized_mode()
    {
        this.current_mode = -1;
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
        this.coordinates = new Coordinate(0, 0);
    }


    // GETTERS //

    get diameter()
    {
        return this.radius * 2;
    }

    // DRAWING FUNCTIONS + HELPERS //
    calculate_planet_position(view_mode)
    {
        switch(view_mode.current_mode)
        {
            case -1: // Uninitialized mode. We do not draw the planet.
                break;
            case 0: // Scale mode. We draw the planet to scale, but not to distance.
                break;
            case 1: // Distance mode. We draw the planet to distance, but not to scale.
                break;
            default: // This should never happen. If it does, then throw an error.
                throw new Error(```Invalid view mode: ${view_mode.toString()}.```);
                break;
        }
    }

    calculate_planet_screen_size(km_per_pixel)
    {
        let minimum_pixel_size = 2; // We don't want planets to be smaller than 2 pixels.
        let planet_size = Math.floor(this.diameter / km_per_pixel);
        if (planet_size < minimum_pixel_size)
        {
            planet_size = minimum_pixel_size;
        }
        return planet_size;
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

    static calculate_center_of_window_x()
    {
        return windowWidth / 2;
    }

    static calculate_center_of_window_y()
    {
        return windowHeight / 2;
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
    Window.resize_window_to_screen();
    background(0);

}

function draw_scale_mode(planets)
{
    
    // First, we iterate through the list of planets, and find the planet with the largest radius. We use this to scale the planets.
    let largest_planet_diameter = null;
    planets.forEach(function(value)
    {
        if (largest_planet_diameter === null || value.diameter > largest_planet_diameter)
        {
            largest_planet_diameter = value.diameter;
        }
    });
    let shortest_window_side = Window.get_shortest_window_side();

    // We want the largest planet to be 90% of the shortest side of the screen in diameter.
    let largest_planet_screen_diameter = shortest_window_side * 0.9; // This is the largest diameter the largest planet should have.

    // We use this to calculate the sun.
    let sun_position = new Coordinate(Window.calculate_center_of_window().x, 0);
    const sun_radius_km = 696340; // This is the radius of the sun in kilometers.
    const sun_radius_multiplier = sun_radius_km / (largest_planet_diameter / 2); // This is the multiplier used to scale the sun based on the largest planet.
    const sun_diameter_screen = Math.floor(largest_planet_screen_diameter * (sun_radius_multiplier * 2)); // This is the radius of the sun in pixels.
    
    // Now, we calculate how tall the canvas needs to be to render every planet. We render every planet to scale, with the largest being 90%. We want an additional 10% of screen height between each planet.
    const spacer_height = shortest_window_side * 0.1;
    let total_screen_height_required = 0;
    
    // First, we account for the half of the sun at the top of the screen that will be visible.
    total_screen_height_required += (sun_diameter_screen / 2) + spacer_height;

    // Now, we iterate through the planets, and add their diameters to the total screen height required.
    planets.forEach(function(value)
    {
        total_screen_height_required += value.diameter + spacer_height;
    });
    
    colorMode(RGB, 255);
    fill(253, 184, 19);
    stroke(253, 184, 19);
    circle(sun_position.x, sun_position.y, sun_diameter_screen);
}

function draw_distance_mode()
{

}

// CLICK DETECTORS //

function determine_if_click_is_within_canvas(coordinate)
{
    return determine_if_coordinate_within_rectangle(coordinate, 0, 0, windowWidth, windowHeight);
}

function determine_if_coordinate_within_rectangle(coordinate, rectangle_start_x, rectangle_start_y, rectangle_width, rectangle_height)
{
    const rectangle_end_x = rectangle_start_x + rectangle_width;
    const rectange_end_y = rectangle_start_y + rectangle_height;
    if (coordinate.x >= rectangle_start_x && coordinate.x <= rectangle_end_x && coordinate.y >= rectangle_start_y && coordinate.y <= rectange_end_y)
    {
        return true;
    }
    return false;
}

// HTML ELEMENT FUNCTIONS //
function set_view_mode(view_mode) // We do this this way so that we can check if view mode is valid yet.
{
    if (script_is_loaded)
    {
        switch (view_mode)
        {
            case -1:
                view_mode.set_uninitialized_mode();
                break;
            case 0:
                view_mode.set_scale_mode();
                break;
            case 1:
                view_mode.set_distance_mode();
                break;
            default:
                throw new Error(```Invalid view mode: ${view_mode.toString()}.```);
                break;
        }
    
    }

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

function mouseClicked() // Called whenever the mouse is clicked.
{
    console.log("Clicked. X: " + mouseX.toString() + ", Y: " + mouseY.toString() + ".");
    if (determine_if_click_is_within_canvas(new Coordinate(mouseX, mouseY)))
    {
        console.log("Clicked within canvas.");
    }
    else
    {
        console.log("Clicked outside canvas.");
    }
}

script_is_loaded = true;