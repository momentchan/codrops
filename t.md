## Section 3: The Infinite Field
The Spatial Strategy
Practically, it was impossible to generate enough individual blades to cover an entire world. To create the illusion of vastness, I divided the field into a grid system. As the camera crossed a grid boundary, the entire vertex group snapped forward. This "infinite scrolling" trick ensured the grass always surrounded the character, no matter how far they traveled. I used the world position as a deterministic seed to generate parameters for each blade's shape, color, and local terrain elevation, which guaranteed consistency during each grid snap.

The GPU Data Pipeline
In WebGPU, I stored the parameters for each blade in a structured storage buffer, computing the data in a compute shader before passing it into the rendering pipeline. This was a significant upgrade from WebGL, where I previously had to use complex FBO hacks. To achieve a natural look, I adopted the Voronoi clustering method to group blades into clumps. Each blade's data package included:

Position and normal

Type variation (width and height)

Bending and facing angle

Wind strength and seeds for each blade/clump

Pushing force interaction

Vertex Deformation
The blades were rendered using simple plane geometries. The bending logic was based on a Bézier control point method. To add life to the field, I introduced a sine-wave sway effect that increased in intensity toward the tip. However, to maintain visual stability, I faded the wind intensity for the blades at a farther distance. To ensure the blades stuck to the terrain surface, I computed the tilting angle based on shared terrain parameters used across the grass, flowers, and character elevation. I also applied a view-dependent tilt to make the grass blades appear thicker when viewed from the side.

Interaction
For the push interaction, I passed the character's position into the shader and gave each blade an outward force based on its distance to the character. In False Earth, cosmic beams fell from the sky, sending energy waves across the ground. I built a wave system that tracked position, startTime, maxRadius, and lifeTime for each wave. This buffer was passed to the grass shader to trigger synchronized pushing and glow effects.

Rendering
After computing the vertices properly, I moved on to the rendering of the blades. Each blade was composed of a plane without any texture. To enhance the structure of its shape, I tweaked the normals to create a "fake" rim and midrib effect. For the colors, I added a small amount of randomness based on the clump and blade seeds, ensuring each clump had subtle differences. For performance, I only applied Ambient Occlusion (AO) based on the height of the blade. Finally, I added a desaturation effect for distant blades to create atmospheric depth.