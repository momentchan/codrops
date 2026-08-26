GPU-Driven Spawning
In False Earth, flowers bloomed dynamically as energy waves expanded across the terrain. To handle this efficiently, I moved the spawning logic entirely into a compute shader. For every new instance, a unique position, lifetime, and seed were assigned.

To manage a constant stream of growth without expensive CPU readbacks, I implemented a circular buffer using a storage index. By applying atomicAdd to a global index and using a mod operator against the maximum instance count, the system automatically recycled the oldest flowers from the pool. This ensured a continuous lifecycle that remained performant even during heavy interaction.

The Lifecycle State Machine
Each active flower progressed through four distinct stages: Delay, Grow, Keep, and Die. I mapped these stages directly to the VAT playback progress (0.0 to 1.0):

Delay: The dormant period before the growth began.

Grow: The animated progress scaled from 0 to 1, triggering the blooming VAT sequence.

Keep: The flower remained at its final animated frame (1.0).

Die: The progress reversed from 1 back to 0, causing the flower to wither and shrink.

Once the entire sequence was complete, the flower was marked as inactive, making its slot available for the next spawning cycle.

Advanced Rendering & Visuals
In the vertex shader, I retrieved the animated positions by sampling the VAT textures based on the computed frame index. To prevent a "cookie-cutter" look, I applied size variations to each instance using its unique seed.

Similar to the grass, I aligned each flower to the terrain's surface, applied wind effects, and calculated an interaction force based on its proximity to the character. Although the petals and stems shared the same mesh, I encoded a mask into the vertex colors during preprocessing. This allowed me to colorize and animate the materials separately within a single draw call. For the final touch, I added a periodic glow and a Fresnel effect to give the flora a mystical, ethereal quality.