// Using p5.js

// CLASSES //

class Coordinate
{
    constructor(x, y)
    {
        this.x = x;
        this.y = y;
    }
}

class Star
{
    constructor(x, y, size, color)
    {
        this.x = x;
        this.y = y;
        this.size = size;
        this.color = color;
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
