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
                out_planets.set(data[i].name, new Planet(data[i].name, data[i].radius_km, data[i].distance_from_sun, data[i].rotation_period_days, data[i].orbital_period_days, data[i].color));
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

    set_credits_mode()
    {
        this.current_mode = 2;
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
        return new Coordinate(width / 2, height / 2);
    }

    static calculate_center_of_window_x()
    {
        return width / 2;
    }

    static calculate_center_of_window_y()
    {
        return height / 2;
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

// GLOBAL VARIABLES //

const planets = PlanetAPI.get_planets(); // This is a map containing all of the planets. The key is the name of the planet, and the value is the planet object.
var maximum_distance_from_sun = 0; // This keeps track of the furthest distance from the sun. It is updated every frame.
var km_per_pixel_distance = 0; // This keeps track of how many kilometers should be used per pixel. It is updated every frame. We use this for distance between centers of planets only, otherwise every planet would effectively not exist due to sheer scale.
var km_per_pixel_radius = 0; // This keeps track of how many kilometers should be used per pixel. It is updated every frame. We use this for radius of planets only, otherwise distances between planets would be nonexistent.
var view_mode = new ViewMode(); // This keeps track of the current view mode. 0 is size to scale, 1 is distance to scale. -1 is uninitialized/starting up.
var clicked_planet = null;
var set_scroll_past_sun = false; // If true, we reset the scroll position to this.

var script_is_loaded = false;
var is_mouse_pressed = undefined;

// CLICK DETECTORS //

function determine_if_click_is_within_canvas(coordinate)
{
    return determine_if_coordinate_within_rectangle(coordinate, 0, 0, width, height);
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

function determine_if_coordinate_within_circle(coordinate, circle_center_x, circle_center_y, circle_radius)
{
    const distance_from_center = Math.sqrt(Math.pow(coordinate.x - circle_center_x, 2) + Math.pow(coordinate.y - circle_center_y, 2));
    return distance_from_center <= circle_radius;
}

// MAIN DRAWING FUNCTIONS //

function draw_startup_mode()
{
    if (windowWidth < 688) // We do this to prevent problems with wrapping on super narrow screens.
    {
        Window.resize_window_to_dimensions(688, windowHeight);
    }
    else
    {
        Window.resize_window_to_dimensions(windowWidth, windowHeight);
    }
    
    background(0);
    const center_x = Window.calculate_center_of_window_x();
    fill(255);
    stroke(255);
    strokeWeight(1);
    textSize(32);
    textAlign(CENTER, CENTER);
    textWrap(WORD);
    const text_center = width / 8; // Somehow width / 8 is the center of the screen. I don't know why, but it is. We calculate this here so we don't have to redo this on every line.
    text("Welcome to the Solar System Viewer!", text_center, 64, width * 0.75); 
    textSize(64);
    let max_box_width = max(textWidth("Planets to Scale"), textWidth("Distance to Scale"), textWidth("Credits")) + 32;
    text("Planets to Scale", text_center, 256, width * 0.75);
    fill(0, 0, 0, 0);
    strokeWeight(5);
    rect(center_x - (max_box_width / 2), 256 - 48, max_box_width, 96);
    fill(255);
    strokeWeight(1);
    text("Distance to Scale", text_center, 384, width * 0.75);
    fill(0, 0, 0, 0);
    strokeWeight(5);
    rect(center_x - (max_box_width / 2), 384 - 48, max_box_width, 96);
    fill(255);
    strokeWeight(1);
    text("Credits", text_center, 512, width * 0.75);
    fill(0, 0, 0, 0);
    strokeWeight(5);
    rect(center_x - (max_box_width / 2), 512 - 48, max_box_width, 96);
    fill(255);
    strokeWeight(1);

    // Now we check if we need to update the cursor type by comparing the rectangle position to the boxes.
    const cursor_position = new Coordinate(mouseX, mouseY);
    if (determine_if_coordinate_within_rectangle(cursor_position, center_x - (max_box_width / 2), 256 - 48, max_box_width, 96))
    {
        if (mouseIsPressed && !mouse_is_pressed)
        {
            cursor("default");
            set_view_mode(view_mode, 0);
            set_scroll_past_sun = true;
        }
        else
        {
            cursor("pointer");
        }
        
    }
    else if (determine_if_coordinate_within_rectangle(cursor_position, center_x - (max_box_width / 2), 384 - 48, max_box_width, 96))
    {
        if (mouseIsPressed && !mouse_is_pressed)
        {
            cursor("default");
            set_view_mode(view_mode, 1);
            set_scroll_past_sun = true;
        }
        else
        {
            cursor("pointer");
        }
    }
    else if (determine_if_coordinate_within_rectangle(cursor_position, center_x - (max_box_width / 2), 512 - 48, max_box_width, 96))
    {
        if (mouseIsPressed && !mouse_is_pressed)
        {
            cursor("default");
            set_view_mode(view_mode, 2);
        }
        else
        {
            cursor("pointer");
        }
        
    }
    else
    {
        cursor("default");
    }
    
}

function draw_scale_mode(planet_list)
{
    cursor("default");
    if (clicked_planet !== null)
    {
        let window_height = windowHeight;
        if (windowHeight < 688) // We do this to prevent problems with wrapping on super narrow screens.
        {
            window_height = 688;
        }
        if (windowWidth < 688) // We do this to prevent problems with wrapping on super narrow screens.
        {
            Window.resize_window_to_dimensions(688, window_height);
        }
        else
        {
            Window.resize_window_to_dimensions(windowWidth, window_height);
        }
        
        background(0);
        const center_x = Window.calculate_center_of_window_x();
        fill(255);
        stroke(255);
        strokeWeight(1);
        textSize(64);
        textAlign(CENTER, CENTER);
        textWrap(WORD);
        const text_center = width / 8; // Somehow width / 8 is the center of the screen. I don't know why, but it is. We calculate this here so we don't have to redo this on every line.
        text(clicked_planet.name, text_center, 64, width * 0.75);
        colorMode(RGB, 255);
        let planet_color = clicked_planet.convert_color_hex_to_rgb();
        fill(planet_color.r, planet_color.g, planet_color.b);
        stroke(planet_color.r, planet_color.g, planet_color.b);
        circle(width / 2, 192, 128);
        stroke(255);
        fill(255);
        textSize(32);
        text(`Radius: ${clicked_planet.radius} km`, text_center, 320, width * 0.75);
        text(`Distance from Sun: ${clicked_planet.distance_from_sun} million km`, text_center, 384, width * 0.75);
        text(`Rotation Period: ${clicked_planet.rotation_period} days`, text_center, 448, width * 0.75);
        text(`Orbital Period: ${clicked_planet.orbital_period} days`, text_center, 512, width * 0.75);
        const back_width = textWidth("Go Back") + 32;
        text("Go Back", text_center, 576 + 64, width * 0.75);
        fill(0, 0, 0, 0);
        strokeWeight(5);
        rect(center_x - (back_width / 2), 576 + 64 - 32, back_width, 64);
        fill(255);
        strokeWeight(1);
        const cursor_position = new Coordinate(mouseX, mouseY);

        if (determine_if_coordinate_within_rectangle(cursor_position, center_x - (back_width / 2), 576 + 64 - 32, back_width, 64))
        {
            if (mouseIsPressed && !mouse_is_pressed)
            {
                cursor("default");
                clicked_planet = null;
                set_scroll_past_sun = true;
            }
            else
            {
                cursor("pointer");
            }
            
        }
    }   
    else
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
        let shortest_window_side = Window.get_shortest_window_side_length();

        // We want the largest planet to be 90% of the shortest side of the screen in diameter.
        let largest_planet_screen_diameter = shortest_window_side * 0.9; // This is the largest diameter the largest planet should have.
        // We use this to calculate the sun.
        let sun_position = new Coordinate(Window.calculate_center_of_window().x, 0);
        const sun_radius_km = 696340; // This is the radius of the sun in kilometers.
        
        const planet_size_multiplier = largest_planet_screen_diameter / largest_planet_diameter; // This is the multiplier we use to scale the planets.
        // Now, we calculate how tall the canvas needs to be to render every planet. We render every planet to scale, with the largest being 90%. We want an additional 10% of screen height between each planet.
        const spacer_height = shortest_window_side * 0.1;
        let total_screen_height_required = 0;
        
        const sun_diameter_screen = Math.floor(sun_radius_km * planet_size_multiplier); // This is the radius of the sun in pixels.
        total_screen_height_required += (sun_diameter_screen / 2) + spacer_height;
        // Now, we iterate through the planets, and add their diameters to the total screen height required.
        planets.forEach(function(value)
        {
            total_screen_height_required += (value.diameter * planet_size_multiplier) + spacer_height;
        });

        // Now, we resize the canvas to the required height.
        Window.resize_window_to_dimensions(windowWidth, Math.floor(total_screen_height_required));
        background(0);
        
        // Draw the sun
        colorMode(RGB, 255);
        fill(253, 184, 19);
        stroke(253, 184, 19);
        circle(sun_position.x, sun_position.y, sun_diameter_screen);

        // Now, we iterate through the planets, and draw them to scale.
        let current_end_y = (sun_diameter_screen / 2) + spacer_height;
        let is_mouse_hovering = false;
        let mouse_clicked_planet = null;
        planets.forEach(function(value)
        {
            // We calculate the position of the planet.
            current_end_y += (value.radius * planet_size_multiplier);
            let planet_screen_diameter = Math.floor(value.diameter * planet_size_multiplier);
            let planet_coordinate = new Coordinate(width / 2, current_end_y);

            let color_rgb = value.convert_color_hex_to_rgb();
            fill(color_rgb.r, color_rgb.g, color_rgb.b);
            stroke(color_rgb.r, color_rgb.g, color_rgb.b);
            circle(planet_coordinate.x, planet_coordinate.y, planet_screen_diameter);
            current_end_y += (value.radius * planet_size_multiplier) + spacer_height;
            
            // Check if mouse is hovering over planet.
            if (determine_if_coordinate_within_circle(new Coordinate(mouseX, mouseY), planet_coordinate.x, planet_coordinate.y, planet_screen_diameter / 2))
            {
                is_mouse_hovering = true;
                if (mouseIsPressed && !mouse_is_pressed)
                {
                    mouse_is_pressed = true;
                    mouse_clicked_planet = value;
                }
            }
        });

        if (is_mouse_hovering)
        {
            if (mouse_clicked_planet !== null )
            {
                cursor("default");
                clicked_planet = mouse_clicked_planet;
            }
            else if (!mouse_is_pressed)
            {
                cursor("pointer");
            }
            else
            {
                cursor("default");
            }
            
        }
        else
        {
            cursor("default");
        }

        if (set_scroll_past_sun)
        {
            window.scrollTo(0, sun_diameter_screen / 2);
            set_scroll_past_sun = false;
        
        }
    }
    
}

function draw_distance_mode()
{

}

function draw_credits_mode()
{
    cursor("default");
    let window_height = windowHeight;
    if (windowHeight < 688) // We do this to prevent problems with wrapping on super narrow screens.
    {
        window_height = 688;
    }
    if (windowWidth < 688) // We do this to prevent problems with wrapping on super narrow screens.
    {
        Window.resize_window_to_dimensions(688, window_height);
    }
    else
    {
        Window.resize_window_to_dimensions(windowWidth, window_height);
    }
    
    background(0);
    const center_x = Window.calculate_center_of_window_x();
    fill(255);
    stroke(255);
    strokeWeight(1);
    textSize(64);
    textAlign(CENTER, CENTER);
    textWrap(WORD);
    const text_center = width / 8; // Somehow width / 8 is the center of the screen. I don't know why, but it is. We calculate this here so we don't have to redo this on every line.
    text("Credits", text_center, 64, width * 0.75);
    textSize(32);
    text("Created by: Kaden Duncan-Matis", text_center, 320, width * 0.75);
    text("Using: p5.js", text_center, 384, width * 0.75);
    const back_width = textWidth("Go Back") + 32;
    text("Go Back", text_center, 576 + 64, width * 0.75);
    fill(0, 0, 0, 0);
    strokeWeight(5);
    rect(center_x - (back_width / 2), 576 + 64 - 32, back_width, 64);
    fill(255);
    strokeWeight(1);
    const cursor_position = new Coordinate(mouseX, mouseY);

    if (determine_if_coordinate_within_rectangle(cursor_position, center_x - (back_width / 2), 576 + 64 - 32, back_width, 64))
    {
        if (mouseIsPressed && !mouse_is_pressed)
        {
            cursor("default");
            set_view_mode(view_mode, -1);
        }
        else
        {
            cursor("pointer");
        }
        
    }
}

// HTML ELEMENT FUNCTIONS //
function set_view_mode(active_view_mode, new_view_mode) // We do this this way so that we can check if view mode is valid yet.
{
    if (script_is_loaded)
    {
        switch (new_view_mode)
        {
            case -1:
                console.log("Switching to uninitialized mode.");
                view_mode.set_uninitialized_mode();
                break;
            case 0:
                console.log("Switching to scale mode.");
                view_mode.set_scale_mode();
                break;
            case 1:
                console.log("Switching to distance mode.");
                view_mode.set_distance_mode();
                break;
            case 2:
                console.log("Switching to credits mode.");
                view_mode.set_credits_mode();
                break;
            default:
                throw new Error(```Invalid view mode: ${view_mode.toString()}.```);
                break;
        }
    }
    else
    {
        console.log("Script is not loaded yet. Please wait a moment and try again.");
    }
}

// P5 MAIN FUNCTIONS //

function setup() // Called once before draw()
{
    if (mouseIsPressed)
    {
        mouse_is_pressed = true;
    }
    else
    {
        mouse_is_pressed = false;
    }
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
    if (!mouseIsPressed)
    {
        mouse_is_pressed = false;
    }
    background(0);
    switch (view_mode.current_mode)
    {
        case -1:
            draw_startup_mode();
            break;
        case 0:
            draw_scale_mode(planets);
            break;
        case 1:
            draw_distance_mode();
            break;
        case 2:
            draw_credits_mode();
            break;
        default:
            throw new Error(```Invalid view mode: ${view_mode.current_mode.toString()}.```);
            break;
    }
}

function mouseClicked() // Called whenever the mouse is clicked.
{
    const click_coord = new Coordinate(mouseX, mouseY); // We create this coordinate for processing anywhere we need it.
}

script_is_loaded = true;