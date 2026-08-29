<p><!--
Codrops title / subtitle (paste into the post header, not as H1 in the body):

Title: Still: A Japanese Print Look and a Generative Garden in WebGPU
Subtitle: Building chapter 3 of an interactive astronaut series: anime-flat shading, ink shadows, and plants that bloom around a resting figure, then climb it.

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
<p>The visual exploration for this chapter started with a Japanese anime, <em>Akira</em>, a cyberpunk sci-fi story about a teenage biker gang member who develops dangerous psychic powers in a dystopian Neo-Tokyo. I was drawn to how graphic it felt: color laid on in flats, a sharp outline, still frames that look drawn rather than photographed. Digging further, I found the same way of painting in traditional Japanese work like this — the flowers done the same way: flat color, a clear edge, like a painting. I wanted to see if that language could hold up as a print look in a 3D scene, so I started building from there.</p>
<!-- /wp:paragraph -->

<!-- wp:gallery {"linkTo":"none"} -->
<figure class="wp-block-gallery has-nested-images columns-default is-cropped"><!-- wp:image {"id":119903,"sizeSlug":"large","linkDestination":"none"} -->
<figure class="wp-block-image size-large"><img src="https://tympanus.net/codrops/wp-content/uploads/2026/08/image-5-600x900.png" alt="" class="wp-image-119903"/></figure>
<!-- /wp:image -->

<!-- wp:image {"id":119907,"sizeSlug":"large","linkDestination":"none"} -->
<figure class="wp-block-image size-large"><img src="https://tympanus.net/codrops/wp-content/uploads/2026/08/image-9-678x900.png" alt="" class="wp-image-119907"/></figure>
<!-- /wp:image --></figure>
<!-- /wp:gallery -->

<!-- wp:heading {"level":4} -->
<h4 class="wp-block-heading"><strong>Woodblock Toon</strong></h4>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p>The astronaut and the flowers share the same banded light, but they run through different shaders: the suit uses a toon material on textured albedo, while petals and stems use a vertex-color material built for VAT instancing. The quantized step below is what ties them together.</p>
<!-- /wp:paragraph -->

<!-- wp:paragraph -->
<p>The light part starts with N·L, how much the surface faces the light, where N is the normal and L is the light direction. I remap that value between <code>thresholdLow</code> and <code>thresholdHigh</code>, then <code>floor</code> it into <strong>color levels</strong>; on the character and flowers I keep that at 2, one shadow band and one lit band, since anything more stops reading like print. Shadow and highlight are tints on the base color, and when the bands still look too clean I wobble the threshold with a little world-space noise before the clamp — just enough to break the hard edge.</p>
<!-- /wp:paragraph -->

<!-- wp:code -->
<pre class="wp-block-code"><code>const ndl = max(dot(N, L), 0.0);
const thresholdNoise = fbm3(positionWorld.mul(thresholdNoiseScale))
  .sub(0.5)
  .mul(thresholdNoiseStrength);
const preShade = clamp(
  ndl.sub(thresholdLow.add(thresholdNoise))
    .div(thresholdHigh.sub(thresholdLow)),
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
<p>The ink edge is where the pipelines split. On the character, it comes from an inverted hull: a second mesh, back-face, pushed out along the normal. Petals skip that approach because every VAT head is instanced hundreds of times, and wrapping each in a second mesh would blow the budget while still tracing the wrong silhouette, since the deforming mesh is not the petal cutout. The shape already lives in a mask texture, so I discard outside it and draw the rim in the shader with <code>fwidth</code> on that same mask — one texture for both shape and edge. Stems get a view-facing rim in the shader as well, with no extra geometry.</p>
<!-- /wp:paragraph -->

<!-- wp:image -->
<figure class="wp-block-image"><!-- [IMAGE: woodblock toon — character hull outline vs petal mask edge] --></figure>
<!-- /wp:image -->

<!-- wp:heading {"level":4} -->
<h4 class="wp-block-heading"><strong>Stylish Ground Shadow</strong></h4>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p>While I was looking at <em>Akira</em> for the look of this chapter, I found this poster. Kaneda and the bike on flat white — and the shadow underneath is the part I keep noticing: a wash, soft at the edge, uneven inside, barely following the silhouette, like paint thinned on paper. Everything else in this scene is built to look drawn, so the shadow could not be the one thing that still looks rendered.</p>
<!-- /wp:paragraph -->

<!-- wp:image {"id":119968,"width":"380px","height":"auto","sizeSlug":"large","linkDestination":"none"} -->
<figure class="wp-block-image size-large is-resized"><img src="https://tympanus.net/codrops/wp-content/uploads/2026/08/image-12-735x900.png" alt="Akira — Kaneda and the bike on flat white, grounded by a soft ink-wash shadow" class="wp-image-119968" style="width:380px;height:auto"/></figure>
<!-- /wp:image -->

<!-- wp:paragraph -->
<p>The directional light already writes a shadow map. TSL's <code>shadow(light)</code> reads it on the ground; I invert that to <code>shade</code>, high under him, fading out at the edges. I flatten it with <code>smoothstep</code> so it reads as that wash: the inside holds a level, and the leftover band is the soft edge. One <code>noise</code> field does the rest: <code>washBleed</code> added before <code>smoothstep</code> so the blob barely follows the silhouette, <code>washMottle</code> multiplied in after so the inside is uneven, like paint thinned on paper. Same noise, so the edge and the fill stay consistent.</p>
<!-- /wp:paragraph -->

<!-- wp:paragraph -->
<p>The darker <strong>contour</strong> is a drawn stroke from the same <code>shade</code>, wherever it is close to <code>contourShade</code>, sitting outside the wash instead of tracing it. A finer, separate noise lets the line break, so it does not run as one continuous edge. <code>fwidth</code> keeps whatever is left a steady width on screen. Wash and line combine with <code>max</code>, so the stronger of the two wins each pixel and neither darkens the other.</p>
<!-- /wp:paragraph -->

<!-- wp:code -->
<pre class="wp-block-code"><code>const shade = shadow(light).oneMinus();
const noise = fbm2(positionWorld.xz.mul(washScale));
const fill = smoothstep(washAt, washAt.add(washSoft), shade.add(noise.mul(washBleed)));
const wash = fill.mul(float(1.0).sub(noise.mul(washMottle).max(0.0)));

const wobble = mx_noise_float(positionWorld.xz.mul(contourWobbleScale)).mul(contourWobble);
const penWidth = fwidth(shade).mul(contourWidth).max(0.0001);
const line = float(1.0).sub(smoothstep(0.0, penWidth, shade.sub(contourShade.add(wobble)).abs()));
const shColor = mix(washColor, contourColor, line);
return mix(bg, shColor, max(wash.mul(washStr), line.mul(contourStr)));</code></pre>
<!-- /wp:code -->

<!-- wp:image -->
<figure class="wp-block-image"><!-- [IMAGE: stylish ground shadow — ink wash + contour, not a soft PCF blob] --></figure>
<!-- /wp:image -->

<!-- wp:paragraph -->
<p>I want flower shadows on the character, but not on themselves. So I use two shadow maps: one has the character and the flowers, for the ground wash; the other contains only the flowers, sampled by the character. That map comes from a directional light at the same place with no intensity: it only writes depth, and its shadow camera sees the flowers and not the character, so the character can sample it without being in it.</p>
<!-- /wp:paragraph -->

<!-- wp:image -->
<figure class="wp-block-image"><!-- [IMAGE: flowers casting on the character and backpack] --></figure>
<!-- /wp:image -->

<!-- wp:heading {"level":4} -->
<h4 class="wp-block-heading"><strong>Silk Weave</strong></h4>
<!-- /wp:heading -->

<!-- wp:gallery {"linkTo":"none"} -->
<figure class="wp-block-gallery has-nested-images columns-default is-cropped"><!-- wp:image {"id":119992,"sizeSlug":"large","linkDestination":"none"} -->
<figure class="wp-block-image size-large"><img src="https://tympanus.net/codrops/wp-content/uploads/2026/08/image-14-465x900.png" alt="" class="wp-image-119992"/></figure>
<!-- /wp:image -->

<!-- wp:image {"id":119991,"sizeSlug":"large","linkDestination":"none"} -->
<figure class="wp-block-image size-large"><img src="https://tympanus.net/codrops/wp-content/uploads/2026/08/image-13-484x900.png" alt="" class="wp-image-119991"/></figure>
<!-- /wp:image --></figure>
<!-- /wp:gallery -->

<!-- wp:paragraph -->
<p>I was looking at two Japanese folding screens of hollyhocks: Sakai Hōitsu's (1801) and Ogata Kenzan's. The ground is the part I keep noticing — a faint weave, a grid like threads, and marks that sit like stains, uneven enough that it feels painted by hand. That is the feeling I am chasing.</p>
<!-- /wp:paragraph -->

<!-- wp:paragraph -->
<p>I put that weave over the whole frame because on those screens the grid and the stains sit in the ground of the painting, not on a single object. <code>screenUV</code> is scaled into thread cells with <code>threadCount</code>, then hash-jittered by <code>irregularity</code> so the grid does not look machine-made. <code>warp</code> and <code>weft</code> are the thread cross-section, high on the fiber and low in the groove; a checker mixes which one sits on top. <code>threadVariation</code> shifts each fiber's tone. <code>blotch</code> is slower noise, multiplied in as stains. Fabric and stain multiply, so they darken the whole frame together.</p>
<!-- /wp:paragraph -->

<!-- wp:code -->
<pre class="wp-block-code"><code>const coord = screenUV.mul(vec2(aspect, 1.0)).mul(threadCount);
const x = coord.x.add(hash(floor(coord.y)).sub(0.5).mul(irregularity));
const y = coord.y.add(hash(floor(coord.x)).sub(0.5).mul(irregularity));
const warp = pow(abs(sin(x.mul(PI))), sharpness);
const weft = pow(abs(sin(y.mul(PI))), sharpness);
const checker = mod(floor(x).add(floor(y)), 2.0);
const weave = mix(warp, weft, checker);
const fabric = clamp(float(1.0).sub(strength.mul(float(1.0).sub(weave))).add(threadTone), 0.0, 1.0);
const blotch = float(1.0).sub(blotchStrength.mul(smoothstep(0.45, 0.95, stain)));
const overlaid = sceneColor.mul(tint).mul(fabric).mul(blotch);</code></pre>
<!-- /wp:code -->

<!-- wp:video -->
<figure class="wp-block-video"><!-- [VIDEO or IMAGE pair: silk weave off vs on] --></figure>
<!-- /wp:video -->

<!-- wp:heading -->
<h2 class="wp-block-heading">One Plant</h2>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p>The garden later grows from many copies of this plant. I start with one so you can see what it contains — a flower, a stem, leaves, and a life cycle — before they gather around him.</p>
<!-- /wp:paragraph -->

<!-- wp:heading {"level":4} -->
<h4 class="wp-block-heading"><strong>Flower</strong></h4>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p>For the flower animation I used the <a href="https://superhivemarket.com/products/blooming-flowers---geo-nodes-curve-asset-pack">Blooming Flowers</a> Blender pack. Its carefully designed Geometry Nodes produce motion that feels vivid and graceful, which matches the feeling I want to get across. I turn that motion into VAT, the same technique I used in <em><a href="https://tympanus.net/codrops/2026/04/21/false-earth-from-webgl-limits-to-a-webgpu-driven-world/">False Earth</a></em>, using an <a href="https://github.com/momentchan/BlenderAlembicToVAT">addon</a> I made that handles the whole workflow directly in Blender.</p>
<!-- /wp:paragraph -->

<!-- wp:image {"id":119999,"sizeSlug":"large","linkDestination":"none"} -->
<figure class="wp-block-image size-large"><img src="https://tympanus.net/codrops/wp-content/uploads/2026/08/image-15-1200x711.png" alt="" class="wp-image-119999"/></figure>
<!-- /wp:image -->

<!-- wp:paragraph -->
<p>On top of that baked VAT, petals leave a few at a time — each shrinking toward its own centre, then lifting and fanning out. The look comes from <a href="https://www.teamlab.art/w/flowersandpeople-hour/"><em>Flowers and People</em></a> by teamLab, while the feeling I want to get across is a flower at its fullest just before it falls. The mesh already comes as separate islands, so I group vertices by connectivity and pack a petal id and a pivot vertex into vertex colour; a hash of that id staggers the timing and the lift, so they don't all leave together. I combine VAT with a procedural pass so I get both: the baked motion, and the freedom to invent on top.</p>
<!-- /wp:paragraph -->

<!-- wp:code -->
<pre class="wp-block-code"><code>const petalId = color.g; // island id, 0..1
const pivot = sampleVAT(color.b, frame); // same vertex, current bloom frame
const startJitter = fract(sin(petalId * 127.1) * 43758.5453);
const t = clamp((shed - startJitter * stagger) / (1.0 - stagger), 0.0, 1.0);
const ease = t * t * (3.0 - 2.0 * t);
const shrunk = pivot.add(basePos.sub(pivot).mul(1.0 - ease));</code></pre>
<!-- /wp:code -->

<!-- wp:image -->
<figure class="wp-block-image"><!-- [IMAGE or VIDEO: Blender Geo Nodes bloom vs the VAT flower head] --></figure>
<!-- /wp:image -->

<!-- wp:heading {"level":4} -->
<h4 class="wp-block-heading"><strong>Stem</strong></h4>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p>That pack also builds the stem in Geometry Nodes, but those stems are already designed for specific flowers. I kept the idea — a curve, a tube — and did it procedurally in Three.js instead of baking the stem into VAT, so I could vary the shape. A seeded Catmull-Rom runs from the ground to a tip that leans and bends; I sweep a tube along it, then scale each ring so the base flares and the shaft tapers.</p>
<!-- /wp:paragraph -->

<!-- wp:code -->
<pre class="wp-block-code"><code>const from = new THREE.Vector3(0, -BASE_BURY, 0);
const to = /* lean azimuth × stemLength */;
const bend = /* seeded sideways offset */;
const curve = new THREE.CatmullRomCurve3(
  &#91;
    from,
    from.clone().lerp(to, 0.25).add(bend),
    from.clone().lerp(to, 0.75).add(bend),
    to,
  ],
  false,
  'centripetal',
);
const scale = (1 - (1 - radiusAttenuation) * t) + baseFlare * (1 - t) ** 3;</code></pre>
<!-- /wp:code -->

<!-- wp:paragraph -->
<p>I build the tube from that curve once. A value from 0 to 1 then drives two GPU steps: the fragment discards rings past the front along <code>uv.x</code>, and the vertex shader thickens the shaft from the centerline — wait, push out, stand, pull back. The flower head is placed on the CPU from that same value, so the bloom stays on the growing end.</p>
<!-- /wp:paragraph -->

<!-- wp:code -->
<pre class="wp-block-code"><code>If(uv().x.greaterThan(growth), () =&gt; Discard());
const rScale = startScale + growth * (1.0 - startScale);
grown = center.add(positionLocal.sub(center).mul(rScale));</code></pre>
<!-- /wp:code -->

<!-- wp:image -->
<figure class="wp-block-image"><!-- [IMAGE: one stem, VAT head on the tip] --></figure>
<!-- /wp:image -->

<!-- wp:heading {"level":4} -->
<h4 class="wp-block-heading"><strong>Leaf</strong></h4>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p>The leaf starts as a modeled mesh. I bend its vertices in the shader: a curl along the blade, tight at first, then easing open as it grows.</p>
<!-- /wp:paragraph -->

<!-- wp:paragraph -->
<p>Then I sit a few of them on the stem. Each <code>t</code> is a seeded sample along the middle of the curve, sorted so they climb in order; they alternate around the shaft and sit on the tube’s surface at that <code>t</code>. Placement is baked — unlike the flower head, they do not ride the growing end. The same 0 to 1 that grows the stem reveals the leaf after the front passes that <code>t</code>.</p>
<!-- /wp:paragraph -->

<!-- wp:code -->
<pre class="wp-block-code"><code>curve.getPointAt(t, P);
pos.copy(P).addScaledVector(outward, stemRadius * radiusScale);
const growFrac = smoothstep(attachT, attachT + GROW_WINDOW, stemGrow);
placed = attach.add(leafPos.mul(growFrac));</code></pre>
<!-- /wp:code -->

<!-- wp:image -->
<figure class="wp-block-image"><!-- [IMAGE: leaves instanced on the stem] --></figure>
<!-- /wp:image -->

<!-- wp:heading {"level":4} -->
<h4 class="wp-block-heading"><strong>Lifecycle</strong></h4>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p>The clock is the same four stages as <em>False Earth</em>: <strong>Delay, Grow, Keep, Die</strong> — and Die itself is shed, then retract. One age drives the plant. In Delay the stem rests; flower and leaf are not in yet. Grow is the stem’s 0–1: the flower rides that tip as the VAT opens, while each leaf waits on the shaft, then uncurls after the front has passed. Keep holds — stem stands, flower full, leaves open. Then <strong>petal shed</strong> runs while the stem still stands and the leaves stay; after that the stem goes 1→0, and the leaves go with it.</p>
<!-- /wp:paragraph -->

<!-- wp:image -->
<figure class="wp-block-image"><!-- [IMAGE: still/images/plant/lifecycle-timeline.png] --></figure>
<!-- /wp:image -->

<!-- wp:video -->
<figure class="wp-block-video"><!-- [VIDEO: one plant — bloom → petal shed → stem retract] --></figure>
<!-- /wp:video -->

<!-- wp:heading -->
<h2 class="wp-block-heading">The Field</h2>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p>The garden is not an infinite plane. Plants gather as masses next to a lying body, without a wreath around the silhouette.</p>
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
<p>Placement is not a golden-angle spiral. About one in seven flowers sit on a <strong>heart</strong>, a rejection sample against the density field. The rest <strong>hop</strong> a short fixed range off a heart. Head size and how far a flower can bloom both follow local density, not hop depth or a “primary” role. Dense core, fringe buds, like a real thicket, not a decorator ring.</p>
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
<p>The plant is the same one. Stems are packed into one draw, same instinct as instancing the grass in <em>False Earth</em>. I do not submit a hundred separate meshes.</p>
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
<li><strong>Field value</strong>: Density at the slot. It drives head size and bloom ceiling, not to shrink a living flower.</li>
<!-- /wp:list-item --></ul>
<!-- /wp:list -->

<!-- wp:paragraph -->
<p>When a plant finishes, it is not rebuilt. A clump <strong>heart</strong> has been wandering slowly inside its own pin — a hip flower never rehoms onto the backpack. The dead plant picks a heart on that pin and hops. Live flowers are never yanked. Occupancy follows the hearts; the density field stays put; geometry stays. The garden keeps changing while he stays still.</p>
<!-- /wp:paragraph -->

<!-- wp:video -->
<figure class="wp-block-video"><!-- [VIDEO: a clump heart wandering — bloom → hop elsewhere] --></figure>
<!-- /wp:video -->

<!-- wp:heading {"level":4} -->
<h4 class="wp-block-heading"><strong>LOD on Mobile</strong></h4>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p>Nearby heads use the high VAT. Far heads use a low-poly bake. On desktop Blink, a compute pass plus <strong>indirect draw</strong> picks the band, the same idea as the grass LOD in <em>False Earth</em>. On iPhone, that path double-filled both meshes and the flowers flickered. WebKit still does not like that atomic compact. I compact the visible list on the CPU and set <code>mesh.count</code>. It is not elegant. It is stable. Low-poly heads also feed the plant shadow map, so the stain on the suit does not need the full petal mesh.</p>
<!-- /wp:paragraph -->

<!-- wp:paragraph -->
<p>The field stays off the body on purpose. What <em>does</em> climb him is a different system.</p>
<!-- /wp:paragraph -->

<!-- wp:heading -->
<h2 class="wp-block-heading">Generative Tendrils</h2>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p>The vines cannot be placed by hand. They have to feel grown, stay on the orange suit, and share the same print look. Packed tubes, a growth front, and <strong>Delay, Grow, Keep, Die</strong> are the same instincts as the plant. The hard problem is wrapping that growth on a posed body.</p>
<!-- /wp:paragraph -->

<!-- wp:paragraph -->
<p>I looked at <a href="https://github.com/mattatz/THREE.Tree">mattatz/THREE.Tree</a> for how a procedural plant reveals itself: a mesh that can grow along its own length. I did not drop that generator into the scene. There is no recursive branching tree here. Thickness comes from how much load a route carries, not from generation count.</p>
<!-- /wp:paragraph -->

<!-- wp:heading {"level":4} -->
<h4 class="wp-block-heading"><strong>Hosts and Capsules</strong></h4>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p>Two hosts: the body and the backpack. Most of the budget goes to the body (about 90 / 10). This is a fine contact layer, not coverage — a few hundred awake tendrils, not a coat.</p>
<!-- /wp:paragraph -->

<!-- wp:paragraph -->
<p>Limb <strong>capsules</strong> give me regions (calf, forearm, torso, helmet) without unique code per mesh. I sample the posed surface for stations, area-weighted, not a UV grid. Helmet density is turned down. The visor should not vanish under vines.</p>
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
<p>All tendril tubes are packed. Each segment stores a start and end distance along its tree. The same Delay / Grow / Keep / Die clock drives a growth front; the window is tree distance, not VAT age on a field instance. A segment reveals with a smoothstep between its two distances.</p>
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
<p>I started as an interactive developer for physical installations. Three.js still feels like the same leap: a link, a browser, no special hardware. <em><a href="https://tympanus.net/codrops/2026/04/21/false-earth-from-webgl-limits-to-a-webgpu-driven-world/">False Earth</a></em> was the step into WebGPU: storage buffers, compute, an endless field.</p>
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