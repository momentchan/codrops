<!-- wp:video {"id":113279} -->
<figure class="wp-block-video"><video autoplay loop muted src="https://tympanus.net/codrops/wp-content/uploads/2026/03/false-earth_reel-1080p.mp4" playsinline></video></figure>
<!-- /wp:video -->

<!-- wp:paragraph -->
<p><a href="https://false-earth.mingjyunhung.com/">Live Demo</a></p>
<!-- /wp:paragraph -->

<!-- wp:paragraph -->
<p><a href="https://github.com/momentchan/false-earth">Source Code</a></p>
<!-- /wp:paragraph -->

<!-- wp:heading -->
<h2 class="wp-block-heading">Intro</h2>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p><em>False Earth</em> is an interactive WebGPU project and the sequel to my first work, <em>Drift</em>.</p>
<!-- /wp:paragraph -->

<!-- wp:paragraph -->
<p>In <em><a href="https://drift-co0.pages.dev/">Drift</a></em>, I explored a storytelling experience about an astronaut lost in space, drifting while longing to return home. I implemented an AI-generated diary to reflect his mental state—the loneliness, the depression, and memories of the time he spent with his family.</p>
<!-- /wp:paragraph -->

<!-- wp:video {"id":113215} -->
<figure class="wp-block-video"><video autoplay loop muted src="https://tympanus.net/codrops/wp-content/uploads/2026/03/drift_reel-v2-1080p.mp4" playsinline></video></figure>
<!-- /wp:video -->

<!-- wp:paragraph -->
<p>Now, the story continues. The astronaut has landed on a new planet. It looks like Earth, but it feels strange and "false." The world is covered with a field of infinite grass that seems to never end. When he moves, cosmic beams fall from the sky, and flowers bloom and die instantly. Creating this endless, reactive world required me to push beyond the limits of my previous WebGL experiments.</p>
<!-- /wp:paragraph -->

<!-- wp:heading -->
<h2 class="wp-block-heading">The WebGL Prototypes</h2>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p>Before diving into <em>False Earth</em>, I ran several experiments to see if the web could handle my vision.</p>
<!-- /wp:paragraph -->

<!-- wp:heading {"level":4} -->
<h4 class="wp-block-heading"><strong><a href="https://vat-flowers.pages.dev/">Vertex Animation Texture (VAT) </a></strong></h4>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p>Rendering thousands of animated vertices was a heavy task for the CPU. To solve this, I moved the work to the GPU using instancing and VAT—a technique where animation data (positions and normals) was baked into a texture. By replaying this data in the shader, I could offload the computational stress from the CPU to the GPU. In this demo, I created a scene where hundreds of flowers bloomed, grew, and died as the user moved the mouse.</p>
<!-- /wp:paragraph -->

<!-- wp:video {"id":113217} -->
<figure class="wp-block-video"><video autoplay loop muted src="https://tympanus.net/codrops/wp-content/uploads/2026/03/vat_flowers.mp4" playsinline></video></figure>
<!-- /wp:video -->

<!-- wp:heading {"level":4} -->
<h4 class="wp-block-heading"><strong><a href="https://procedural-grass.pages.dev/" data-type="link" data-id="https://procedural-grass.pages.dev/">Procedural Grass </a></strong></h4>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p>Realistic grass was the soul of <em>False Earth</em>. While many web projects already feature beautiful grass, I wanted blades that could react realistically to lighting and interaction. Inspired by the <em>Ghost of Tsushima</em> team’s <a href="https://gdcvault.com/play/1027033/Advanced-Graphics-Summit-Procedural-Grass">technical breakdown</a>, I built a procedural system that gave me total control over every blade’s shape, color, and movement.</p>
<!-- /wp:paragraph -->

<!-- wp:video {"id":113219} -->
<figure class="wp-block-video"><video autoplay loop muted src="https://tympanus.net/codrops/wp-content/uploads/2026/03/procedural_grass_demo-1080p.mp4" playsinline></video></figure>
<!-- /wp:video -->

<!-- wp:heading {"level":4} -->
<h4 class="wp-block-heading"><strong>The WebGL Limit </strong></h4>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p>However, I quickly hit a performance bottleneck. As I increased the number of flowers and grass blades, the frame rate dropped dramatically. Beyond raw draw calls, I struggled with the limitations of GPGPU in WebGL; handling framebuffer (FBO) read/write operations for complex GPU computations was incredibly clunky and counter-intuitive.<br>I realized that to achieve the scale I had in mind, I had to move to WebGPU. This was my first time using WebGPU and TSL, and I was amazed by how it simplified everything. Instead of FBO hacks, I could use storage buffers to manage data directly on the GPU. This shift allowed me to focus on the logic of the world rather than fighting the limitations of the API.</p>
<!-- /wp:paragraph -->

<!-- wp:heading -->
<h2 class="wp-block-heading">The Infinite Grass Field</h2>
<!-- /wp:heading -->

<!-- wp:heading {"level":4} -->
<h4 class="wp-block-heading"><strong>The Spatial Strategy</strong> </h4>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p>Practically, it is impossible to generate enough individual blades to cover an entire world. To create the illusion of vastness, I divided the field into a <strong>grid system</strong>. As the camera crosses a grid boundary, the entire vertex group snaps forward. This <strong>infinite scrolling</strong> trick keeps the grass surrounding the character no matter how far they travel. I used world position as a <strong>deterministic seed</strong> to generate parameters for each blade’s shape, color, and local elevation, which stays consistent across every grid snap.</p>
<!-- /wp:paragraph -->

<!-- wp:video {"id":113290} -->
<figure class="wp-block-video"><video autoplay loop muted src="https://tympanus.net/codrops/wp-content/uploads/2026/03/demo-snapping-1080p-1.mp4" playsinline></video></figure>
<!-- /wp:video -->

<!-- wp:heading {"level":4} -->
<h4 class="wp-block-heading"><strong>The GPU Data Pipeline</strong></h4>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p>In WebGPU, I stored the parameters for each blade in a structured <strong>storage buffer</strong>, computed the data in a compute shader, and passed it into the rendering pipeline. This was a significant upgrade from WebGL, where I previously had to use complex FBO hacks. To achieve a natural distribution, I adopted a <strong>Voronoi clustering</strong> approach to group blades into organic clumps. Each blade’s <strong>data package</strong> includes:</p>
<!-- /wp:paragraph -->

<!-- wp:list -->
<ul class="wp-block-list"><!-- wp:list-item -->
<li><strong>Position and Normal</strong>: For positioning and terrain alignment.</li>
<!-- /wp:list-item -->

<!-- wp:list-item -->
<li><strong>Type Variation</strong>: Randomized width, height, and blade type.</li>
<!-- /wp:list-item -->

<!-- wp:list-item -->
<li><strong>Bending and Facing</strong>: Pre-computed curvature and rotation.</li>
<!-- /wp:list-item -->

<!-- wp:list-item -->
<li><strong>Seeds and Strength</strong>: Individual hash values for wind and clump-based sway.</li>
<!-- /wp:list-item -->

<!-- wp:list-item -->
<li><strong>Interaction</strong>: A dedicated vector for character pushing forces.</li>
<!-- /wp:list-item --></ul>
<!-- /wp:list -->

<!-- wp:heading {"level":4} -->
<h4 class="wp-block-heading"><strong>Vertex Deformation</strong></h4>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p>To bring the infinite field to life, I focused on making simple plane geometries behave like organic matter. The deformation logic in the vertex shader is a multi-layered displacement stack:</p>
<!-- /wp:paragraph -->

<!-- wp:list -->
<ul class="wp-block-list"><!-- wp:list-item -->
<li><strong>Bending &amp; Sway</strong>: The bending logic is based on a <strong>third-order Bézier control-point</strong> method. To add life to the field, I introduced a <strong>dual-frequency sine-wave sway</strong> that increases in intensity toward the tip. To maintain visual stability and reduce flicker (aliasing), I faded the wind intensity for blades in the distance.</li>
<!-- /wp:list-item -->

<!-- wp:list-item -->
<li><strong>Terrain Alignment</strong>: To keep blades flush with the ground, I computed a <strong>tilting angle</strong> based on shared terrain parameters. By unpacking the terrain normal from the storage buffer, I kept the grass, flowers, and character aligned with the same elevation data.</li>
<!-- /wp:list-item -->

<!-- wp:list-item -->
<li><strong>The "Thick" Illusion</strong>: The blades are 2D planes, so I applied a <strong>view-dependent tilt</strong> to make them appear thicker when viewed from the side, preventing them from disappearing at grazing angles.</li>
<!-- /wp:list-item --></ul>
<!-- /wp:list -->

<!-- wp:heading {"level":4} -->
<h4 class="wp-block-heading"><strong>Interaction</strong></h4>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p>For push interaction, I passed the character’s position into the shader and gave each blade an <strong>outward force</strong> based on its distance to the character. This creates a realistic flattening effect (using a quadratic falloff, t<sup>2</sup>) that is strongest at the tip and zero at the root.</p>
<!-- /wp:paragraph -->

<!-- wp:paragraph -->
<p>In <em>False Earth</em>, cosmic beams fall from the sky and send energy waves across the ground. I built a <strong>wave system</strong> that tracks the following parameters for each wave:</p>
<!-- /wp:paragraph -->

<!-- wp:list -->
<ul class="wp-block-list"><!-- wp:list-item -->
<li><strong>Position</strong> and <strong>Start Time</strong></li>
<!-- /wp:list-item -->

<!-- wp:list-item -->
<li><strong>Maximum Radius</strong> and <strong>Lifetime</strong></li>
<!-- /wp:list-item --></ul>
<!-- /wp:list -->

<!-- wp:paragraph -->
<p>This data is stored in a buffer and passed to the grass shader to trigger <strong>synchronized pushing and glow effects</strong>, creating a tactile connection between the environment and the procedural flora.</p>
<!-- /wp:paragraph -->

<!-- wp:heading {"level":4} -->
<h4 class="wp-block-heading"><strong>Rendering</strong></h4>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p>Each blade is composed of a plane without any texture. To achieve a high-fidelity look while keeping the performance overhead low, I focused on several procedural shading techniques:</p>
<!-- /wp:paragraph -->

<!-- wp:list -->
<ul class="wp-block-list"><!-- wp:list-item -->
<li><strong>Structural Normals</strong>: I tweaked the normals to create a "fake" <strong>rim and midrib effect</strong>, giving the flat geometry a sense of physical structure.</li>
<!-- /wp:list-item -->

<!-- wp:list-item -->
<li><strong>Procedural Variation</strong>: For the colors, I added a small amount of <strong>randomness</strong> based on the clump and blade seeds, ensuring each blade had subtle differences.</li>
<!-- /wp:list-item -->

<!-- wp:list-item -->
<li><strong>Performance-First Shading</strong>: For performance, I applied <strong>ambient occlusion (AO)</strong> based solely on the height of the blade, darkening the roots to create depth.</li>
<!-- /wp:list-item -->

<!-- wp:list-item -->
<li><strong>Atmospheric Depth</strong>: Finally, I added a <strong>desaturation effect</strong> for distant blades to create atmospheric perspective and depth.</li>
<!-- /wp:list-item --></ul>
<!-- /wp:list -->

<!-- wp:heading -->
<h2 class="wp-block-heading">VAT Flowers</h2>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p>In <em>False Earth</em>, flowers bloom dynamically as energy waves expand across the terrain. To handle this efficiently, I moved the spawning logic entirely into a <strong>compute shader</strong>, assigning each instance a unique position, lifetime, and seed.</p>
<!-- /wp:paragraph -->

<!-- wp:heading {"level":4} -->
<h4 class="wp-block-heading"><strong>The Circular Spawning System</strong></h4>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p>To keep flowers spawning without costly CPU readbacks, I implemented a <strong>circular buffer</strong> backed by a storage index.</p>
<!-- /wp:paragraph -->

<!-- wp:list -->
<ul class="wp-block-list"><!-- wp:list-item -->
<li><strong>Atomic Indexing</strong>: Each new flower increments a global index via <code>atomicAdd</code>.</li>
<!-- /wp:list-item -->

<!-- wp:list-item -->
<li><strong>Automatic Recycling</strong>: The index wraps with modulo against the maximum instance count, recycling slots so the lifecycle stays smooth even during heavy interaction.</li>
<!-- /wp:list-item --></ul>
<!-- /wp:list -->

<!-- wp:heading {"level":4} -->
<h4 class="wp-block-heading"><strong>The Lifecycle State Machine</strong></h4>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p>Every active flower moves through a state machine driven by normalized age. I mapped each stage to VAT playback progress:</p>
<!-- /wp:paragraph -->

<!-- wp:list -->
<ul class="wp-block-list"><!-- wp:list-item -->
<li><strong>Delay</strong>: The dormant period before growth begins.</li>
<!-- /wp:list-item -->

<!-- wp:list-item -->
<li><strong>Grow</strong>: The blooming sequence where VAT progress scales from 0 to 1.</li>
<!-- /wp:list-item -->

<!-- wp:list-item -->
<li><strong>Keep</strong>: The flower holds the final animated frame (1.0) for its peak duration.</li>
<!-- /wp:list-item -->

<!-- wp:list-item -->
<li><strong>Die</strong>: Progress reverses or scales down so the flower withers and shrinks back toward 0.</li>
<!-- /wp:list-item --></ul>
<!-- /wp:list -->

<!-- wp:paragraph -->
<p>When the sequence finishes, the instance is marked inactive and its slot is free for the next spawn.</p>
<!-- /wp:paragraph -->

<!-- wp:heading {"level":4} -->
<h4 class="wp-block-heading"><strong>Rendering</strong></h4>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p>In the vertex shader, VAT textures are sampled using the computed frame index to reconstruct animated positions. Per-instance size variation, derived from each instance’s seed, reduces visible repetition across the field.</p>
<!-- /wp:paragraph -->

<!-- wp:paragraph -->
<p>Similar to the grass, I aligned each flower to the terrain surface, applied wind effects, and calculated an interaction force based on proximity to the character. Although petals and stems shared the same mesh, I encoded a mask into vertex colors during preprocessing. This allowed me to color and animate both materials separately within a single draw call. For the final touch, I added a periodic glow and a Fresnel effect to give the flora a mystical, ethereal quality.</p>
<!-- /wp:paragraph -->

<!-- wp:heading -->
<h2 class="wp-block-heading">Optimization</h2>
<!-- /wp:heading -->

<!-- wp:heading {"level":4} -->
<h4 class="wp-block-heading"><strong>The Indirect Draw Architecture</strong></h4>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p>Even with much of the work on the GPU, drawing millions of blades remains costly. The standard approach is <strong>frustum culling</strong>: submit only geometry visible to the camera. Because blade positions are generated on the GPU, traditional CPU-side culling is not available. <strong>WebGPU indirect drawing</strong> addresses this limitation.</p>
<!-- /wp:paragraph -->

<!-- wp:paragraph -->
<p><strong>Indirect draw</strong> allows the GPU to set draw counts for the pipeline by reading an indirect buffer. In this project it is represented as a <code>Uint32Array</code> with five fields:</p>
<!-- /wp:paragraph -->

<!-- wp:list -->
<ul class="wp-block-list"><!-- wp:list-item -->
<li><code>vertexCount</code>: Number of vertices per instance.</li>
<!-- /wp:list-item -->

<!-- wp:list-item -->
<li><code>instanceCount</code>: Number of instances to draw (updated atomically).</li>
<!-- /wp:list-item -->

<!-- wp:list-item -->
<li><code>firstVertex</code>: Offset in the vertex buffer.</li>
<!-- /wp:list-item -->

<!-- wp:list-item -->
<li><code>firstInstance</code>: Offset in the instance buffer.</li>
<!-- /wp:list-item -->

<!-- wp:list-item -->
<li><code>offset</code>: Base instance offset.</li>
<!-- /wp:list-item --></ul>
<!-- /wp:list -->

<!-- wp:paragraph -->
<p>In Three.js TSL, I wired the geometry to that buffer as follows:</p>
<!-- /wp:paragraph -->

<!-- wp:code -->
<pre class="wp-block-code"><code>geometry.setIndirect(drawBuffer)</code></pre>
<!-- /wp:code -->

<!-- wp:heading {"level":4} -->
<h4 class="wp-block-heading"><strong>GPU-Driven Culling &amp; Filtering</strong></h4>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p>Consider one million instances where only fifty thousand are visible: the draw path should include only those visible instances. I use a <code>visibleIndicesBuffer</code> that maps compact draw indices back to the original instance IDs. During the compute pass, each visible instance writes its index into this buffer, and <code>instanceCount</code> is incremented atomically.</p>
<!-- /wp:paragraph -->

<!-- wp:code -->
<pre class="wp-block-code"><code>// Perform frustum culling and atomic counting
If( isVisible, () => {
    // Increment the global instance count safely
    const index = atomicAdd( drawStorage.element( "instanceCount" ), 1 );
    
    // Route the visible instance ID into the filtered buffer
    visibleIndicesBuffer.element( index ).assign( instanceIndex );
} );</code></pre>
<!-- /wp:code -->

<!-- wp:paragraph -->
<p>Then, in the vertex shader, the real instance index is resolved from <code>visibleIndicesBuffer</code>:</p>
<!-- /wp:paragraph -->

<!-- wp:code -->
<pre class="wp-block-code"><code>const trueIndex = visibleIndicesBuffer.element(instanceIndex);
const data = grassData.element(trueIndex);</code></pre>
<!-- /wp:code -->

<!-- wp:paragraph -->
<p>Filtering before the draw pass limits vertex shading to on-screen instances, which reduces rendering cost substantially.</p>
<!-- /wp:paragraph -->

<!-- wp:heading {"level":4} -->
<h4 class="wp-block-heading"><strong>GPU-Driven LOD</strong></h4>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p>I reused the same indirect pattern for <strong>level of detail (LOD)</strong>. Instead of one global draw buffer, I used several buffers for different mesh densities. An array of <code>LODBufferConfig</code> entries defines segment counts and the distance band each LOD covers.</p>
<!-- /wp:paragraph -->

<!-- wp:paragraph -->
<p>The compute pass measures each blade’s distance to the camera and assigns the instance index to the appropriate LOD bucket. Foreground blades use a high-detail buffer (more segments); distant blades use a lighter buffer (fewer segments). The result is a dense horizon without spending triangles on pixels that contribute little detail.</p>
<!-- /wp:paragraph -->

<!-- wp:paragraph -->
<p>To soften LOD boundaries, I apply a per-instance jitter to the distance test, which reduces visible circular banding at transitions.</p>
<!-- /wp:paragraph -->

<!-- wp:paragraph -->
<p><strong>Non-blocking Startup: Async Compilation</strong></p>
<!-- /wp:paragraph -->

<!-- wp:paragraph -->
<p>In WebGL, shader compilation often blocks the main thread until the driver finishes. For <em>False Earth</em>, I wanted the introduction to stay responsive during load. I wrapped the core components in an <code>AsyncCompile</code> provider that uses WebGPU’s <code>compileAsync</code>, moving compilation off the critical path so the loading animation remains smooth while shaders finish building.</p>
<!-- /wp:paragraph -->

<!-- wp:paragraph -->
<p>Compilation scheduling alone is not enough; <strong>bandwidth throttling</strong> matters as well. Uploading very large batches—for example, thousands of flower instances and a six-figure grass count—in a single frame can overwhelm the driver. I route compilation and upload through a global queue so work proceeds in sequence instead of hitting the GPU all at once. The <em>idle → compiled → uploading → done</em> sequence keeps the pipeline stable and responsive.</p>
<!-- /wp:paragraph -->

<!-- wp:heading -->
<h2 class="wp-block-heading">The Final Polish</h2>
<!-- /wp:heading -->

<!-- wp:heading {"level":4} -->
<h4 class="wp-block-heading"><strong>The Post-Processing</strong></h4>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p>In <em>False Earth</em>, I implemented a first-person (FPV) mode so visitors can experience the world from the astronaut’s perspective. To suggest a helmet visor, I added custom <strong>chromatic aberration</strong> and <strong>vignette</strong> effects.</p>
<!-- /wp:paragraph -->

<!-- wp:paragraph -->
<p>In TSL, color and depth are exposed as nodes, so they can be modified and routed into the final composite with more flexibility than a fixed chain of fullscreen passes.</p>
<!-- /wp:paragraph -->

<!-- wp:code -->
<pre class="wp-block-code"><code>const scenePass = pass(scene, camera);
const colorTex = scenePass.getTextureNode('output');
const depthTex = scenePass.getViewZNode();

// ... Apply custom modifications ...

const pp = new THREE.PostProcessing(renderer);
pp.outputNode = finalNode;</code></pre>
<!-- /wp:code -->

<!-- wp:paragraph -->
<p>I also added depth of field (DOF) to blur distant geometry in a cinematic way. A side effect is that thin, emissive elements such as the cosmic beam were blurred as well, which softened their sharp, high-energy appearance.</p>
<!-- /wp:paragraph -->

<!-- wp:paragraph -->
<p>To correct this, I render beams in a separate <code>beamScene</code>. In post-processing, I compare depth from the beam pass with the main scene depth and use the difference to composite occlusion: beams remain sharp where they should read as foreground, while still occluding correctly behind terrain.</p>
<!-- /wp:paragraph -->

<!-- wp:code -->
<pre class="wp-block-code"><code>const depthDiff = beamDepth.sub(sceneDepth);
const beamOcclusion = smoothstep(float(0), float(10), depthDiff);
finalNode = finalNode.add(beamColor.mul(beamOcclusion));</code></pre>
<!-- /wp:code -->

<!-- wp:heading {"level":4} -->
<h4 class="wp-block-heading">Syncing Sound to Motion</h4>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p>Sound grounds the character’s presence in the scene. Footsteps are triggered when the character moves on the grass. Trigger timing is tied to the locomotion animation so playback stays aligned at walk and run speeds.</p>
<!-- /wp:paragraph -->

<!-- wp:paragraph -->
<p>I use several footstep variants with slight pitch variation per trigger to avoid obvious repetition. Volume attenuates with distance to the camera. The implementation is built directly on the Web Audio API, which keeps CPU overhead modest even with many concurrent one-shots.</p>
<!-- /wp:paragraph -->

<!-- wp:heading -->
<h2 class="wp-block-heading">Conclusion</h2>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p>I started my career as an interactive developer for physical digital art installations. Years ago, when I first encountered Three.js, I was blown away by how easily web graphics allowed people to interact across different platforms.</p>
<!-- /wp:paragraph -->

<!-- wp:paragraph -->
<p>The transition from WebGL to WebGPU is a massive leap in that same direction. It has narrowed the gap between the browser and AAA game engines, giving us the raw power and lower-level control needed to achieve visuals and interactions that were previously impossible on the web.</p>
<!-- /wp:paragraph -->

<!-- wp:paragraph -->
<p>For me, <em>False Earth</em> is only one step in learning what I can build when I move away from the traditional constraints I used to treat as fixed. As web graphics continue to advance, I am looking forward to exploring even more immersive storytelling and creating digital experiences that feel as tactile as the physical installations.</p>
<!-- /wp:paragraph -->

<!-- wp:image {"id":113213,"width":"838px","height":"auto","aspectRatio":"1.6064699715441066","sizeSlug":"large","linkDestination":"none"} -->
<figure class="wp-block-image size-large is-resized"><img src="https://tympanus.net/codrops/wp-content/uploads/2026/03/image-27-800x498.png" alt="" class="wp-image-113213" style="aspect-ratio:1.6064699715441066;width:838px;height:auto"/></figure>
<!-- /wp:image -->