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
<p>Realistic grass was the soul of <em>False Earth</em>. While many web projects already feature beautiful grass, I wanted blades that could react realistically to lighting and interaction. Inspired by the <strong><em>Ghost of Tsushima</em> </strong>team's <a href="https://gdcvault.com/play/1027033/Advanced-Graphics-Summit-Procedural-Grass">technical breakdown</a>, I built a procedural system that gave me total control over every blade's shape, color, and movement.</p>
<!-- /wp:paragraph -->

<!-- wp:video {"id":113219} -->
<figure class="wp-block-video"><video autoplay loop muted src="https://tympanus.net/codrops/wp-content/uploads/2026/03/procedural_grass_demo-1080p.mp4" playsinline></video></figure>
<!-- /wp:video -->

<!-- wp:heading {"level":4} -->
<h4 class="wp-block-heading"><strong>The WebGL Limit </strong></h4>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p>However, I quickly hit a performance bottleneck. As I increased the number of flowers and grass blades, the frame rate dropped dramatically. Beyond raw draw calls, I struggled with the limitations of GPGPU in WebGL; handling FrameBuffer (FBO) read/write operations for complex GPU computations was incredibly clunky and counter-intuitive.<br>I realized that to achieve the scale I had in mind, I had to move to WebGPU. This was my first time using WebGPU and TSL, and I was amazed by how it simplified everything. Instead of FBO hacks, I could use Storage Buffers to manage data directly on the GPU. This shift allowed me to focus on the logic of the world rather than fighting the limitations of the API.</p>
<!-- /wp:paragraph -->

<!-- wp:heading -->
<h2 class="wp-block-heading">The Infinite Grass Field</h2>
<!-- /wp:heading -->

<!-- wp:heading {"level":4} -->
<h4 class="wp-block-heading"><strong>The Spatial Strategy</strong> </h4>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p>Practically, it is impossible to generate enough individual blades to cover an entire world. To create the illusion of vastness, I divided the field into a <strong>grid system</strong>. As the camera crosses a grid boundary, the entire vertex group "snaps" forward. This <strong>infinite scrolling</strong> ensures the grass always surrounds the character, no matter how far they travel. I used the world position as a <strong>deterministic seed</strong> to generate parameters for each blade’s shape, color, and local elevation, which guarantees visual consistency during each grid snap.</p>
<!-- /wp:paragraph -->

<!-- wp:video {"id":113290} -->
<figure class="wp-block-video"><video autoplay loop muted src="https://tympanus.net/codrops/wp-content/uploads/2026/03/demo-snapping-1080p-1.mp4" playsinline></video></figure>
<!-- /wp:video -->

<!-- wp:heading {"level":4} -->
<h4 class="wp-block-heading"><strong>The GPU Data Pipeline</strong></h4>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p>In WebGPU, I stored the parameters for each blade in a structured <strong>Storage Buffer</strong>, computed the data in a compute shader, and passed it into the rendering pipeline. This was a significant upgrade from WebGL, where I previously had to use complex FBO hacks. To achieve a natural distribution, I adopted a <strong>Voronoi clustering method</strong> to group blades into organic clumps. Each blade’s <strong>data package</strong> includes:</p>
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
<li><strong>Bending &amp; Sway</strong>: The bending logic is based on a <strong>3rd-order Bézier control point method</strong>. To add life to the field, I introduced a <strong>dual-frequency sine-wave sway</strong> that increases in intensity toward the tip. To maintain visual stability and prevent flickering (aliasing), I faded the wind intensity for blades in the distance.</li>
<!-- /wp:list-item -->

<!-- wp:list-item -->
<li><strong>Terrain Alignment</strong>: To ensure the blades stay perfectly on the ground, I computed a <strong>tilting angle</strong> based on shared terrain parameters. By unpacking the terrain normal from the storage buffer, I ensured the grass, flowers, and the character all react to the same elevation data.</li>
<!-- /wp:list-item -->

<!-- wp:list-item -->
<li><strong>The "Thick" Illusion</strong>: Since the blades are 2D planes, I applied a <strong>view-dependent tilt</strong> to make the grass blades appear thicker when viewed from the side, preventing them from "disappearing" at grazing camera angles.</li>
<!-- /wp:list-item --></ul>
<!-- /wp:list -->

<!-- wp:heading {"level":4} -->
<h4 class="wp-block-heading"><strong>Interaction</strong></h4>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p>For the push interaction, I passed the character's position into the shader and gave each blade an <strong>outward force</strong> based on its distance to the character. This creates a realistic "flattening" effect (using a quadratic power t<sup>2</sup>) that is strongest at the tip and zero at the root.</p>
<!-- /wp:paragraph -->

<!-- wp:paragraph -->
<p>In <em>False Earth</em>, cosmic beams fall from the sky, sending energy waves across the ground. I built a <strong>Wave System</strong> that tracks the following parameters for each wave:</p>
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
<li><strong>Performance-First Shading</strong>:  For performance, I applied <strong>Ambient Occlusion (AO)</strong> based solely on the height of the blade, darkening the roots to create depth.</li>
<!-- /wp:list-item -->

<!-- wp:list-item -->
<li><strong>Atmospheric Depth</strong>: Finally, I added a <strong>desaturation effect</strong> for distant blades to create  atmospheric perspective and depth.</li>
<!-- /wp:list-item --></ul>
<!-- /wp:list -->

<!-- wp:heading -->
<h2 class="wp-block-heading">VAT Flowers</h2>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p>In <em>False Earth</em>, flowers bloom dynamically as energy waves expand across the terrain. To handle this efficiently, I moved the spawning logic entirely into a <strong>Compute Shader</strong>, assigning each instance a unique position, lifetime, and seed.</p>
<!-- /wp:paragraph -->

<!-- wp:heading {"level":4} -->
<h4 class="wp-block-heading"><strong>The Circular Spawning System</strong></h4>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p>To keep flowers spawning continuously without expensive CPU readbacks, I implemented a <strong>Circular Buffer</strong> with a storage index.</p>
<!-- /wp:paragraph -->

<!-- wp:list -->
<ul class="wp-block-list"><!-- wp:list-item -->
<li><strong>Atomic Indexing</strong>: Each new flower increments a global index via <code>atomicAdd</code>.</li>
<!-- /wp:list-item -->

<!-- wp:list-item -->
<li><strong>Automatic Recycling</strong>: The index wraps using a modulo of the maximum instance count. This automatically recycles the oldest flowers, ensuring a smooth lifecycle even during heavy interaction.</li>
<!-- /wp:list-item --></ul>
<!-- /wp:list -->

<!-- wp:heading {"level":4} -->
<h4 class="wp-block-heading"><strong>The Lifecycle State Machine</strong></h4>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p>Every active flower progresses through a state machine driven by its normalized age. I mapped these stages directly to the VAT playback progress:</p>
<!-- /wp:paragraph -->

<!-- wp:list -->
<ul class="wp-block-list"><!-- wp:list-item -->
<li><strong>Delay</strong>: The dormant period before growth begins.</li>
<!-- /wp:list-item -->

<!-- wp:list-item -->
<li><strong>Grow</strong>: The blooming sequence where VAT progress scales from 0 to 1.</li>
<!-- /wp:list-item -->

<!-- wp:list-item -->
<li><strong>Keep</strong>: The flower remains at its final animated frame 1 for its peak duration.</li>
<!-- /wp:list-item -->

<!-- wp:list-item -->
<li><strong>Die</strong>: The progress reverses or scales down, causing the flower to wither and shrink back to 0.</li>
<!-- /wp:list-item --></ul>
<!-- /wp:list -->

<!-- wp:paragraph -->
<p>Once the sequence is complete, the instance is marked as inactive, making its slot available for the next spawning cycle.</p>
<!-- /wp:paragraph -->

<!-- wp:heading {"level":4} -->
<h4 class="wp-block-heading"><strong>Rendering</strong></h4>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p>In the vertex shader, I retrieved animated positions by sampling the VAT textures with the computed frame index. To make the field feel organic, I applied randomized size variations using each instance's unique seed.</p>
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
<p>Even with computation moved to compute shaders, rendering millions of blades is still a heavy task. The most straightforward improvement is <strong>Frustum Culling</strong>—only drawing what camera sees. However, since the blade position are generated on the GPU, traditional CPU-based culling is impossible. This is where <strong>WebGPU</strong> <strong>Indirect Draw</strong> becomes essential. </p>
<!-- /wp:paragraph -->

<!-- wp:paragraph -->
<p><strong>Indirect Draw</strong> allows the GPU to determine the draw count for the rendering pipeline by reading from an <strong>Indirect Storage Buffer</strong>. This buffer is a <strong>Uint32Array</strong> containing five specific values:</p>
<!-- /wp:paragraph -->

<!-- wp:list -->
<ul class="wp-block-list"><!-- wp:list-item -->
<li><strong>vertexCount</strong> : Number of vertices per instance.</li>
<!-- /wp:list-item -->

<!-- wp:list-item -->
<li><strong>instanceCount</strong> : The number of instances to draw (Atomic).</li>
<!-- /wp:list-item -->

<!-- wp:list-item -->
<li><strong>firstVertex</strong> : Offset in the vertex buffer.</li>
<!-- /wp:list-item -->

<!-- wp:list-item -->
<li><strong>firstInstance</strong> : Offset in the instance buffer.</li>
<!-- /wp:list-item -->

<!-- wp:list-item -->
<li><strong>offset</strong> : Base instance offset.</li>
<!-- /wp:list-item --></ul>
<!-- /wp:list -->

<!-- wp:paragraph -->
<p>In Three.js TSL, we simply target the geometry with this buffer</p>
<!-- /wp:paragraph -->

<!-- wp:code -->
<pre class="wp-block-code"><code>geometry.setIndirect(drawBuffer)</code></pre>
<!-- /wp:code -->

<!-- wp:heading {"level":4} -->
<h4 class="wp-block-heading"><strong>GPU-Driven Culling &amp; Filtering</strong></h4>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p>For example, when you have 1M instances but only 50K are visible, you can tell the GPU: "Only draw 50K instances from the list." To achieve this, I created a <strong>visibleIndicesBuffer</strong> to store the mapping to the original data. In compute shader, if an instance passes the culling test, its index is added to this buffer and the <strong>instanceCount</strong> is incremented.</p>
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
<p>Then, in vertex shader, I retrieve the actual data by looking up the real index from the v<strong>isibleIndicesBuffer</strong>:</p>
<!-- /wp:paragraph -->

<!-- wp:code -->
<pre class="wp-block-code"><code>const trueIndex = visibleIndicesBuffer.element(instanceIndex);
const data = grassData.element(trueIndex);</code></pre>
<!-- /wp:code -->

<!-- wp:paragraph -->
<p>By filtering instances before they hit the rendering pipeline, the vertex shader only processes what is actually on screen, drastically improving performance.</p>
<!-- /wp:paragraph -->

<!-- wp:heading {"level":4} -->
<h4 class="wp-block-heading"><strong>GPU-Driven LOD</strong></h4>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p>Taking this further, I used the same indirect logic to implement <strong>Level of Details (LOD)</strong>. Instead of one global draw buffer, I created multiple buffers for different mesh densities. I defined an array of<strong> LODBufferConfig</strong>, which specifies the segment count for the mesh and this distance range they belong to.</p>
<!-- /wp:paragraph -->

<!-- wp:paragraph -->
<p>The compute shader calculates the distance from each blade to the camera. Based on this distance, it "routes" the instance index into the appropriate LOD bucket. Forground blades go into a high-detail buffer (more segments), while distant blades go into low-detail buffer (less planes). This allows False Earth to maintain a dense horizon without wasting triangles on pixels the user can barely see. </p>
<!-- /wp:paragraph -->

<!-- wp:paragraph -->
<p>To make the boundary between each LOD less visible, I added the jittered offset to the distance calculation. This jitters the transition points for each instance, preventing hard, artificial circle lines on the ground. </p>
<!-- /wp:paragraph -->

<!-- wp:paragraph -->
<p><strong>Non-blocking Startup: Aync Compilation</strong></p>
<!-- /wp:paragraph -->

<!-- wp:paragraph -->
<p>"In WebGL, shader compilation is a wall. You hit it, and the screen freezes until the GPU finishes. In <em>False Earth</em>, I wanted the intro to be seamless. I wrapped the core components in an <code class="">AsyncCompile</code> provider that uses WebGPU’s <strong><code>compileAsync</code></strong>. This moves the heavy lifting to a background thread, keeping the loading animation smooth as the world wakes up.</p>
<!-- /wp:paragraph -->

<!-- wp:paragraph -->
<p>It’s not just about compiling, though; it’s about <strong>Bandwidth Throttling</strong>. If you dump 2,000 roses and 100,000 blades of grass onto the GPU at the exact same millisecond, the driver might panic. My <code class="">AsyncCompile</code> system uses a global queue—it compiles, joins a line, and waits for its turn to upload. This <strong>'idle → compiled → uploading → done'</strong> flow ensures the GPU pipeline stays healthy and responsive.</p>
<!-- /wp:paragraph -->

<!-- wp:heading -->
<h2 class="wp-block-heading">The Final Polish</h2>
<!-- /wp:heading -->

<!-- wp:heading {"level":4} -->
<h4 class="wp-block-heading"><strong>The Post-Processing</strong></h4>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p>In <em>False Earth</em>, I implemented a First-Person View (FPV) mode to let users step into the feet of the astronaut and experience the world with maximum immersion. To simulate the view through a helmet visor, I added custom <strong>Chromatic Aberration</strong> and <strong>Vignette</strong> effect. </p>
<!-- /wp:paragraph -->

<!-- wp:paragraph -->
<p>In the TSL framework, accessing node-based color and depth textures is remarkably straightforward. You can modify them and route them to the final output with far more flexibility than traditional post-processing passes.</p>
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
<p>I also added Depth of Field (DOF) to create a cinematic blur for distant objects. However, a common issue arose: thin, glowing components like the cosmic beam would alse get blurred, losing their sharp, energetic look. </p>
<!-- /wp:paragraph -->

<!-- wp:paragraph -->
<p>To solve this, I separated the beams into a dedicated <code>beamScene</code>. In the post-processing stage, I performed a <strong>Depth Comparison</strong> between the beam texture and the main scene texture. By calculating the difference , I could precisely control the occlusion—ensuring the beams stay sharp while naturally dipping behind the terrain.</p>
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
<p>In a digital world, sound is the anchor that makes the character's presense feel visceral. The sound of a step is played when character moves on the grass.  I bound the triggering of sound with animation to make sure they are always synchronized no matter if the charater is walking or running.   </p>
<!-- /wp:paragraph -->

<!-- wp:paragraph -->
<p>I prepared different sound clips and also applied subtle deturns to every sound to make them sounds more natural.  The distance rollover effect is also considered; the volume varies based on the distance to the camera. I built my own audio system based on native Web Audio API, so it doesnt increase the computing stress even when many sounds are triggered at the same time. </p>
<!-- /wp:paragraph -->

<!-- wp:heading -->
<h2 class="wp-block-heading">Conclusion</h2>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p>I started my career as an interactive developer for physical digital art installations. Years ago, when I first encountered Three.js, I was blown away by how easily web graphics allowed people to interact across different platforms. </p>
<!-- /wp:paragraph -->

<!-- wp:paragraph -->
<p>The transition from WebGL to WebGPU is a massive leap in that same direction. It has narrowed the gap between the browser and AAA game engines, giving us the raw power and lower-level control needed to achieve visuals and interactions that were previously impossible on the web.</p>
<!-- /wp:paragraph -->

<!-- wp:paragraph -->
<p><em>False Earth</em> is just one exploration of what's possible when you move away from traditaional constraints. As web graphics continue to advance, I am looking forward to exploring even more immersive storytelling and creating digital experiences that feel as tactile as the physical installations I once built.</p>
<!-- /wp:paragraph -->

<!-- wp:image {"id":113213,"width":"838px","height":"auto","aspectRatio":"1.6064699715441066","sizeSlug":"large","linkDestination":"none"} -->
<figure class="wp-block-image size-large is-resized"><img src="https://tympanus.net/codrops/wp-content/uploads/2026/03/image-27-800x498.png" alt="" class="wp-image-113213" style="aspect-ratio:1.6064699715441066;width:838px;height:auto"/></figure>
<!-- /wp:image -->