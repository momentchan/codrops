# Intro
False Earth is an interactive WebGPU project and the sequel to my first work, Drift. 
In Drift, I explored a storytelling experience about an astronaut lost in space, drifting while longing to return home. 
I implemented an AI-generated diary to reflect his mental state—the loneliness, the depression, and memories of the time he spent with his family.

Now, the story continues. The astronaut has landed on a new planet. It looks like Earth, but it feels strange and 'false.' 
The world is covered with a field of infinite grass that seems to never end. 
When he moves, cosmic beams fall from the sky, and flowers bloom and die instantly.
Creating this endless, reactive world required me to push beyond the limits of my previous WebGL experiments.


# The Ancestry (WebGL Prototypes)
Before diving into False Earth, I ran several experiments to see if the web could handle my vision.

Vertex animation texture (VAT) 🌸
Rendering thousands of animated vertices is a heavy task for the CPU. To solve this, I moved the work to the GPU using instancing and VAT—a technique where animation data (positions and normals) is baked into a texture. By replaying this data in the shader, I could offload the computational stress from the CPU to the GPU. In this demo, I created a scene where hundreds of flowers bloom, grow and die as the user moves the mouse.

Procedural Grass 🌱
Realistic grass is the soul of False Earth. While many web projects already feature beautiful grass, I wanted blades that could react realistically to lighting and interaction. Inspired by the Ghost of Tsushima team's technical breakdown, I built a procedural system that gives me total control over every blade's shape, color, and movement.

The WebGL Limit 🧱
However, I quickly hit a performance bottleneck. As I increased the number of flowers and grass blades, the frame rate dropped dramatically. I realized that to achieve the scale I wanted, I had to move to WebGPU. This is my first time using WebGPU and TSL, and I was amazed by how it simplified tasks that were once incredibly complex in WebGL.


# The Infinite Field

## The Spatial Strategy
Practically, it was impossible to generate enough individual blades to cover an entire world. To create the illusion of vastness, I divided the field into a grid system. As the camera crossed a grid boundary, the entire vertex group snapped forward. The "infinite scrolling" trick ensured the grass always surrounded the character, no matter how far they traveled. I used the world position as a deterministic seed to generate parameters for each blade's shape, color, and local terrain elevation, which guaranteed consistency during each grid snap.

# The GPU Data Pipeline
In WebGPU, I stored the parameters for each blade in a structured storage buffer, computed the data in a compute shader, and then passed it into the rendering pipeline. This was a significant upgrade from WebGL, where I previously had to use complex FBO hacks. To achieve a natural look, I adopted the Voronoi clustering method to group blades into clumps. Each blade's data package included:
* position and normal
* type variation (width and height)
* bending and facing angle
* wind strength 
* seeds for each blade/clump
* pushing force interaction


# Vertex Deformation
The blades were rendered using simple plane geometries. The bending logic was based on a Bézier control point method. To add life to the field, I introduced a sine-wave sway effect that increased in intensity toward the tip. However, to maintain visual stability, I faded the wind intensity for blades in the distance. To ensure the blades stayed on the terrain surface, I computed the tilting angle based on shared terrain parameters used across the grass, flowers, and character elevation. I also applied a view-dependent tilt to make the grass blades appear thicker when viewed from the side.

# Interaction
For the push interaction, I simply passed the character's position into the shader and gave each blade an outward force based on its distance to the character. In False Earth, cosmic beams fell from the sky, sending energy waves across the ground. I built a wave system that tracked position, startTime, maxRadius, and lifetime for each wave. This buffer was passed to the grass shader to trigger synchronized pushing and glow effects.

# Rendering
Each blade was composed of a plane without any texture. To enhance the structure of its shape, I tweaked the normals to create a "fake" rim and midrib effect. For the colors, I added a small amount of randomness based on the clump and blade seeds, ensuring each blade had subtle differences. For performance, I only applied ambient occlusion (AO) based on the height of the blade. Finally, I added a desaturation effect for distant blades to create atmospheric depth.


