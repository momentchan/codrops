<p><!--
Codrops title / subtitle (paste into the post header, not as H1 in the body):

Title: Still: A Japanese Print Look and a Generative Garden in WebGPU
Subtitle: Building chapter 3 of an interactive astronaut series — anime-flat shading, ink shadows, and plants that bloom around a resting figure, then climb it.

Tags: case study, Three.js, TSL, WebGPU, procedural, toon
--></p>

<!-- wp:video -->
<figure class="wp-block-video"><!-- [VIDEO: Still hero reel — lying astronaut, flower masses, tendrils, slow camera] --></figure>
<!-- /wp:video -->

<!-- wp:paragraph -->
<p><a href="DEMO_URL">Live Demo</a></p>
<!-- /wp:paragraph -->

<!-- wp:paragraph -->
<p><a href="https://github.com/momentchan/r3f-akira">Source Code</a></p>
<!-- /wp:paragraph -->

<!-- wp:heading -->
<h2 class="wp-block-heading">Intro</h2>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p><em>Still</em> is chapter 3 of an interactive astronaut story I have been making on the web (<a href="https://tympanus.net/codrops/2026/04/21/false-earth-from-webgl-limits-to-a-webgpu-driven-world/">previous Codrops article</a>). With each chapter I push the story forward and experiment visually and technically.</p>
<!-- /wp:paragraph -->

<!-- wp:paragraph -->
<p>First he was lost in <em><a href="https://drift-co0.pages.dev/">Drift</a></em>. Then he was running across <em><a href="https://tympanus.net/codrops/2026/04/21/false-earth-from-webgl-limits-to-a-webgpu-driven-world/">False Earth</a></em>, day after day, always moving, never arriving. After what felt like forever, he stopped and lay down — for the first time, with nowhere he needed to reach.</p>
<!-- /wp:paragraph -->

<!-- wp:image -->
<figure class="wp-block-image"><!-- [IMAGE: the chapter tableau — flower masses around him, tendrils across the suit] --></figure>
<!-- /wp:image -->

<!-- wp:heading -->
<h2 class="wp-block-heading">Japanese Print Style</h2>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p>The visual exploration for this chapter started with a Japanese anime — <em>Akira</em>, a biker in orange chasing his friend through Neo-Tokyo after the city has already fallen once. I was drawn to how graphic it felt: bold shapes, flat color, a black outline, light in a few clear steps — a world inked rather than photographed. Digging further, I found the same habits in traditional Japanese print: flat fields, dirty paper, an edge that is ink. I wanted to see if that language could hold up in a 3D scene, so I started building from there.</p>
<!-- /wp:paragraph -->

<!-- wp:gallery {"linkTo":"none"} -->
<figure class="wp-block-gallery has-nested-images columns-default is-cropped"><!-- wp:image {"id":119903,"sizeSlug":"large","linkDestination":"none"} -->
<figure class="wp-block-image size-large"><img src="https://tympanus.net/codrops/wp-content/uploads/2026/08/image-5-600x900.png" alt="" class="wp-image-119903"/></figure>
<!-- /wp:image -->

<!-- wp:image {"id":119907,"sizeSlug":"large","linkDestination":"none"} -->
<figure class="wp-block-image size-large"><img src="https://tympanus.net/codrops/wp-content/uploads/2026/08/image-9-678x900.png" alt="" class="wp-image-119907"/></figure>
<!-- /wp:image --></figure>
<!-- /wp:gallery -->

<!-- wp:paragraph -->
<p>The suit, the backpack, the flowers, and the stems share that language. Quantized light. A drawn edge. Ink on the ground. Paper over the frame.</p>
<!-- /wp:paragraph -->

<!-- wp:heading {"level":4} -->
<h4 class="wp-block-heading"><strong>Quantized Lighting</strong></h4>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p>The astronaut and the backpack share one woodblock toon. I remap N·L through a soft window (<code>thresholdLow</code> / <code>thresholdHigh</code>), then <code>floor</code> it into a few <strong>color levels</strong>. Shadow and highlight are tints mixed on the albedo — not a realistic light response.</p>
<!-- /wp:paragraph -->

<!-- wp:code -->
<pre class="wp-block-code"><code>const ndl = max(dot(N, L), 0.0);
const preShade = clamp(
  ndl.sub(thresholdLow).div(thresholdHigh.sub(thresholdLow)),
  0.0,
  1.0,
);
const quantized = floor(preShade.mul(colorLevels.sub(1.0)).add(0.5))
  .div(colorLevels.sub(1.0));

const litColor = mix(
  albedo.mul(shadowTint),
  albedo.mul(highlightTint),
  quantized,
);</code></pre>
<!-- /wp:code -->

<!-- wp:paragraph -->
<p>Cast shadow is merged into that same quantized step, not multiplied on top. An area already at the shadow floor stays there. Only lit bands get pulled down. That keeps the print from going muddy.</p>
<!-- /wp:paragraph -->

<!-- wp:heading {"level":4} -->
<h4 class="wp-block-heading"><strong>Inverted-Hull Outline</strong></h4>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p>The white halo is a second mesh, back-face, pushed out along the normal. Same trick as a lot of toon games. On this suit it reads as a sketch line, not a glow.</p>
<!-- /wp:paragraph -->

<!-- wp:code -->
<pre class="wp-block-code"><code>material.side = THREE.BackSide;
material.positionNode = positionLocal.add(
  normalLocal.normalize().mul(outlineWidth),
);</code></pre>
<!-- /wp:code -->

<!-- wp:image -->
<figure class="wp-block-image"><!-- [IMAGE: suit close-up — quantized bands + inverted-hull outline] --></figure>
<!-- /wp:image -->

<!-- wp:heading {"level":4} -->
<h4 class="wp-block-heading"><strong>Stylish Ground Shadow</strong></h4>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p>A photoreal contact shadow would fight the print. The ground is the same beige as the sky, so the plane has no edge. On that paper I still need a stain under him.</p>
<!-- /wp:paragraph -->

<!-- wp:paragraph -->
<p>I sample the directional <code>shadow()</code>, then treat the mask like ink: a noisy <strong>wash</strong> (spread, warp, fractal noise) and a darker <strong>contour</strong> along the silhouette (<code>fwidth</code> plus a little edge noise). The blob is drawn, not rendered as CG.</p>
<!-- /wp:paragraph -->

<!-- wp:code -->
<pre class="wp-block-code"><code>const amt = shadow(light).oneMinus();
const ink = fbm2(positionWorld.xz.mul(washScale));
const fill = smoothstep(spread, spread.add(edgeSoft), amt.add(ink.mul(edgeWarp)));
const wash = fill.mul(float(1.0).sub(ink.mul(washNoise).max(0.0)));

const w = fwidth(amt).mul(contourWidth).max(0.0001);
const edge = float(1.0).sub(smoothstep(0.0, w, amt.sub(edgeAt).abs()));
const shColor = mix(washColor, contourColor, edge);
return mix(bg, shColor, max(wash.mul(washStr), edge.mul(contourStr)));</code></pre>
<!-- /wp:code -->

<!-- wp:image -->
<figure class="wp-block-image"><!-- [IMAGE: stylish ground shadow — ink wash + contour, not a soft PCF blob] --></figure>
<!-- /wp:image -->

<!-- wp:heading {"level":4} -->
<h4 class="wp-block-heading"><strong>Plant Shadows on the Suit</strong></h4>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p>Flowers should fall on the orange fabric. If I use the same shadow map as the character, he shadows himself and the print dies. A second, plant-only light writes a map that contains plants and not the body. The toon shader reads that map. One extra pass. The picture stays graphic.</p>
<!-- /wp:paragraph -->

<!-- wp:image -->
<figure class="wp-block-image"><!-- [IMAGE: flowers casting on the suit] --></figure>
<!-- /wp:image -->

<!-- wp:heading {"level":4} -->
<h4 class="wp-block-heading"><strong>Contact Dirt</strong></h4>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p>The boots and backpack need to look like they have been on the ground, without a hard CG stripe. I bake a vertex mask from height above the shared ground plane, with a little deterministic noise on the boundary. The dirt texture is quantized like the lighting, and mixed only in shadow and near contact. It does not depend on the plants.</p>
<!-- /wp:paragraph -->

<!-- wp:image -->
<figure class="wp-block-image"><!-- [IMAGE: ground contact dirt on boots / backpack] --></figure>
<!-- /wp:image -->

<!-- wp:heading {"level":4} -->
<h4 class="wp-block-heading"><strong>Silk Canvas</strong></h4>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p>Last, the whole frame is paper. A fullscreen pass lays a warp/weft weave, a warm tint, and blotch stains over the scene. Turn it off and you are looking at a 3D viewport again. Turn it on and the beige world holds together as a print.</p>
<!-- /wp:paragraph -->

<!-- wp:code -->
<pre class="wp-block-code"><code>const warp = pow(abs(sin(x.mul(PI))), sharpness);
const weft = pow(abs(sin(y.mul(PI))), sharpness);
const weave = mix(warp, weft, mod(floor(x).add(floor(y)), 2.0));
const fabric = float(1.0).sub(strength.mul(float(1.0).sub(weave)));
const overlaid = sceneColor.mul(tint).mul(fabric).mul(blotch);</code></pre>
<!-- /wp:code -->

<!-- wp:video -->
<figure class="wp-block-video"><!-- [VIDEO or IMAGE pair: silk-weave post off vs on] --></figure>
<!-- /wp:video -->

<!-- wp:paragraph -->
<p>Flowers and stems use the same quantized levels and tints. Petals get veins as ink strokes and a mask edge. Stems get a view-facing edge, not a hull outline. One art direction.</p>
<!-- /wp:paragraph -->

<!-- wp:heading -->
<h2 class="wp-block-heading">The Field</h2>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p>VAT flowers already existed in <em>False Earth</em> — bloom and die baked into a texture, replayed on the GPU. Here they are not an infinite plane. They gather as masses next to a lying body, without a wreath around the silhouette.</p>
<!-- /wp:paragraph -->

<!-- wp:paragraph -->
<p>The layout rule is simple: the system should feel intentional without becoming visible. If you can count the clusters and get four, the layout failed.</p>
<!-- /wp:paragraph -->

<!-- wp:heading {"level":4} -->
<h4 class="wp-block-heading"><strong>Four Anchors</strong></h4>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p>I derive four anchors from the posed body and the backpack: <strong>hip</strong>, <strong>left hand</strong>, <strong>left boot</strong>, <strong>backpack</strong>. An anchor does not mean a flower grows there. It raises the probability of vegetation in the neighbourhood. The probability field stays put. Neighbouring fields merge. Bare ground survives between them.</p>
<!-- /wp:paragraph -->

<!-- wp:heading {"level":4} -->
<h4 class="wp-block-heading"><strong>The Density Field</strong></h4>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p>Each anchor is an elongated falloff, not a circle. I sum them, warp the sample point so the blobs are irregular, punch <strong>bare patches</strong>, then run a hard MeshBVH keep-out so stems never sit inside the suit. The body is a star shape. A circular hole cannot carve that. Closest-point distance can.</p>
<!-- /wp:paragraph -->

<!-- wp:heading {"level":4} -->
<h4 class="wp-block-heading"><strong>Hearts and Hops</strong></h4>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p>Placement is not a golden-angle spiral. About one in seven flowers sit on a <strong>heart</strong> — a rejection sample against the density field. The rest <strong>hop</strong> a short fixed range off a heart. Head size and how far a flower can bloom both follow local density, not hop depth or a “primary” role. Dense core, fringe buds — like a real thicket, not a decorator ring.</p>
<!-- /wp:paragraph -->

<!-- wp:image -->
<figure class="wp-block-image"><!-- [IMAGE: wide — masses at hip / hand / boot / backpack, not a ring] --></figure>
<!-- /wp:image -->

<!-- wp:image -->
<figure class="wp-block-image"><!-- [IMAGE optional: debug density field vs the same frame with flowers] --></figure>
<!-- /wp:image -->

<!-- wp:heading {"level":4} -->
<h4 class="wp-block-heading"><strong>Packed Stems</strong></h4>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p>Each plant is a procedural tube — taper, flare, lean — plus instanced leaves. The VAT head sits on the tip. Stems are packed into one draw, same instinct as instancing the grass in <em>False Earth</em>. I do not submit a hundred separate meshes.</p>
<!-- /wp:paragraph -->

<!-- wp:paragraph -->
<p>Each plant’s <strong>data package</strong> includes:</p>
<!-- /wp:paragraph -->

<!-- wp:list -->
<ul class="wp-block-list"><!-- wp:list-item -->
<li><strong>Seed and type</strong>: Dahlia or rose, plus color variation.</li>
<!-- /wp:list-item -->

<!-- wp:list-item -->
<li><strong>Anchor and clump</strong>: Which pin and heart mass it belongs to.</li>
<!-- /wp:list-item -->

<!-- wp:list-item -->
<li><strong>Field value</strong>: Density at the slot — drives head size and bloom ceiling, not to shrink a living flower.</li>
<!-- /wp:list-item -->

<!-- wp:list-item -->
<li><strong>Stem shape</strong>: Length, radius, taper, flare, lean.</li>
<!-- /wp:list-item --></ul>
<!-- /wp:list -->

<!-- wp:heading {"level":4} -->
<h4 class="wp-block-heading"><strong>VAT Blooms, Again</strong></h4>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p>The petal motion is not mine. It comes from the <a href="https://superhivemarket.com/products/blooming-flowers---geo-nodes-curve-asset-pack">Blooming Flowers – Geo Nodes Curve Asset Pack</a> in Blender. Dahlia and rose (what you see in the field) are baked from that bloom cycle into position and normal textures. A Geo Nodes flower is too expensive to instance hundreds of times in the browser. VAT lets me replay it on the GPU. My work is the bake, the surround of the body, and the print look — not claiming I authored the animation.</p>
<!-- /wp:paragraph -->

<!-- wp:image -->
<figure class="wp-block-image"><!-- [IMAGE or VIDEO: Blender Geo Nodes bloom vs the same flower in the scene] --></figure>
<!-- /wp:image -->

<!-- wp:paragraph -->
<p>The clock is the same four stages as <em>False Earth</em>: <strong>Delay, Grow, Keep, Die</strong>. Readers of <a href="https://tympanus.net/codrops/2026/04/21/false-earth-from-webgl-limits-to-a-webgpu-driven-world/">that article</a> already know this machine. The new part of death is <strong>petal shed</strong>. Each petal shrinks toward its own centre and lifts, so the head comes apart instead of the whole flower scaling down. Then the stem retracts.</p>
<!-- /wp:paragraph -->

<!-- wp:paragraph -->
<p>When a plant finishes, it is not rebuilt. A clump <strong>heart</strong> has been wandering slowly inside its own pin — a hip flower never rehoms onto the backpack. The dead plant picks a heart on that pin and hops. Live flowers are never yanked. Occupancy follows the hearts; the density field stays put; geometry stays. The garden keeps changing while he stays still.</p>
<!-- /wp:paragraph -->

<!-- wp:video -->
<figure class="wp-block-video"><!-- [VIDEO: bloom → petal shed → hop elsewhere] --></figure>
<!-- /wp:video -->

<!-- wp:heading {"level":4} -->
<h4 class="wp-block-heading"><strong>LOD on Mobile</strong></h4>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p>Nearby heads use the high VAT. Far heads use a low-poly bake. On desktop Blink, a compute pass plus <strong>indirect draw</strong> picks the band — same idea as the grass LOD in <em>False Earth</em>. On iPhone, that path double-filled both meshes and the flowers flickered. WebKit still does not like that atomic compact. I compact the visible list on the CPU and set <code>mesh.count</code>. It is not elegant. It is stable. Low-poly heads also feed the plant shadow map, so the stain on the suit does not need the full petal mesh.</p>
<!-- /wp:paragraph -->

<!-- wp:paragraph -->
<p>The field stays off the body on purpose. What <em>does</em> climb him is a different system.</p>
<!-- /wp:paragraph -->

<!-- wp:heading -->
<h2 class="wp-block-heading">Generative Tendrils</h2>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p>The vines cannot be placed by hand. They have to feel grown, stay on the orange suit, and share the same print look.</p>
<!-- /wp:paragraph -->

<!-- wp:paragraph -->
<p>I looked at <a href="https://github.com/mattatz/THREE.Tree">mattatz/THREE.Tree</a> for how a procedural plant <em>grows</em> — segment hierarchy, taper, a mesh that can reveal itself. I did not drop that generator into the scene. There is no recursive branching tree here. What I kept is a growth front along distance, packed tubes that taper, and thickness from how much load a route carries, not from generation count. The hard problem is wrapping that growth on a posed body.</p>
<!-- /wp:paragraph -->

<!-- wp:heading {"level":4} -->
<h4 class="wp-block-heading"><strong>Hosts and Capsules</strong></h4>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p>Two hosts: the body and the backpack. Most of the budget goes to the body (about 90 / 10). This is a fine contact layer, not coverage — a few hundred awake tendrils, not a coat.</p>
<!-- /wp:paragraph -->

<!-- wp:paragraph -->
<p>Limb <strong>capsules</strong> give me regions (calf, forearm, torso, helmet) without unique code per mesh. I sample the posed surface for stations — area-weighted, not a UV grid. Helmet density is turned down. The visor should not vanish under vines.</p>
<!-- /wp:paragraph -->

<!-- wp:heading {"level":4} -->
<h4 class="wp-block-heading"><strong>Rings and Feeders</strong></h4>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p>Each tendril is a partial ring around a limb, then a <strong>feeder</strong> that walks the surface from the ground (or from a trunk already on the mesh) and attaches that ring into a <strong>tree</strong>. Trees share one growth front: ground → branches → rings → hold → reverse back to the ground.</p>
<!-- /wp:paragraph -->

<!-- wp:paragraph -->
<p>A closest-point snap was not enough. On a calf it jumped to the other side. I start outside the limb and cast a ray inward, so the first hit is the surface on this radial side. If that fails, a local closest point is allowed only if it still faces the same way. Keeping a gap is better than a vine that tunnels through the suit.</p>
<!-- /wp:paragraph -->

<!-- wp:code -->
<pre class="wp-block-code"><code>// Start outside the calf and cast inward.
// First hit = this radial side, not the far side of the limb.
const rayOffset = Math.max(capsuleRadius * 4, 0.28);
rayOrigin.copy(center).addScaledVector(outward, rayOffset);
const hit = bvh.raycastFirst(ray, THREE.DoubleSide, 0, rayOffset * 1.6);</code></pre>
<!-- /wp:code -->

<!-- wp:image -->
<figure class="wp-block-image"><!-- [IMAGE: debug — capsules + wrap paths (rings vs feeders) on the posed body] --></figure>
<!-- /wp:image -->

<!-- wp:image -->
<figure class="wp-block-image"><!-- [IMAGE: same angle, final tendril tubes] --></figure>
<!-- /wp:image -->

<!-- wp:heading {"level":4} -->
<h4 class="wp-block-heading"><strong>A Pool of Routes</strong></h4>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p>I build more paths than I show. Only about one in three is awake. When a tree dies and comes back, it can wake on a dormant route instead of retracing the same line forever. Nearby curves share a spatial noise field, so they look like one organism, not a pile of independent splines.</p>
<!-- /wp:paragraph -->

<!-- wp:heading {"level":4} -->
<h4 class="wp-block-heading"><strong>One Draw, Tree Time</strong></h4>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p>All tendril tubes are packed. Each segment stores a start and end distance along its tree. The same Delay / Grow / Keep / Die clock drives a growth front. A segment reveals with a smoothstep between its two distances — growth along the plant, not a VAT frame on a field instance.</p>
<!-- /wp:paragraph -->

<!-- wp:code -->
<pre class="wp-block-code"><code>function treeSegmentGrowth(growthFront, startDistance, endDistance) {
  const span = Math.max(endDistance - startDistance, 1e-6);
  const t = clamp((growthFront - startDistance) / span, 0, 1);
  return t * t * (3 - 2 * t);
}</code></pre>
<!-- /wp:code -->

<!-- wp:paragraph -->
<p>Leaves inherit that packed age. A few <strong>plumera</strong> heads — also from the Geo Nodes pack, also VAT — bind onto awake rings and rebind when a route swaps. The field stays dahlia and rose. The suit gets a different flower.</p>
<!-- /wp:paragraph -->

<!-- wp:paragraph -->
<p>Each tendril’s <strong>data package</strong> includes:</p>
<!-- /wp:paragraph -->

<!-- wp:list -->
<ul class="wp-block-list"><!-- wp:list-item -->
<li><strong>Host and role</strong>: Body or backpack; ring or feeder.</li>
<!-- /wp:list-item -->

<!-- wp:list-item -->
<li><strong>Tree id</strong>: Shared growth front for the whole vine.</li>
<!-- /wp:list-item -->

<!-- wp:list-item -->
<li><strong>Path window</strong>: Start and end distance along that tree.</li>
<!-- /wp:list-item -->

<!-- wp:list-item -->
<li><strong>Wrap</strong>: Angle range, surface offset, load-based radius scale.</li>
<!-- /wp:list-item --></ul>
<!-- /wp:list -->

<!-- wp:video -->
<figure class="wp-block-video"><!-- [VIDEO: tree grow from ground → rings → hold → retract] --></figure>
<!-- /wp:video -->

<!-- wp:heading -->
<h2 class="wp-block-heading">Conclusion</h2>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p>I started as an interactive developer for physical installations. Three.js still feels like the same leap: a link, a browser, no special hardware. <em><a href="https://tympanus.net/codrops/2026/04/21/false-earth-from-webgl-limits-to-a-webgpu-driven-world/">False Earth</a></em> was the step into WebGPU — storage buffers, compute, an endless field.</p>
<!-- /wp:paragraph -->

<!-- wp:paragraph -->
<p><em>Still</em> is another step, not “more grass.” Each chapter in this series is a new expression. Here the astronaut finally stops. The picture language becomes Japanese print. A generative garden can colonize a body that is no longer trying to reach the horizon.</p>
<!-- /wp:paragraph -->

<!-- wp:paragraph -->
<p>He is still. The plants are not.</p>
<!-- /wp:paragraph -->

<!-- wp:image -->
<figure class="wp-block-image"><!-- [IMAGE: final wide still of the resting figure in the garden] --></figure>
<!-- /wp:image -->