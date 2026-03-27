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


# Infinite Field
