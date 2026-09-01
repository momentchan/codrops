<!-- wp:paragraph -->
<p><a href="https://still.mingjyunhung.com/">Live Demo</a></p>
<!-- /wp:paragraph -->

<!-- wp:paragraph -->
<p><a href="https://github.com/momentchan/r3f-akira">Source Code</a></p>
<!-- /wp:paragraph -->

<!-- wp:paragraph -->
<p><em>Still</em> is chapter three of an interactive, real-time astronaut story I have been making on the web (<a href="https://tympanus.net/codrops/2026/04/21/false-earth-from-webgl-limits-to-a-webgpu-driven-world/">previous Codrops article</a>). Each chapter moves the story forward while giving me a new visual and technical question to explore.</p>
<!-- /wp:paragraph -->

<!-- wp:paragraph -->
<p>First he was lost in <em><a href="https://drift.mingjyunhung.com/">Drift</a></em>. Then he was running across <em><a href="https://false-earth.mingjyunhung.com/">False Earth</a></em>, day after day, always moving, never arriving. After moving for what felt like forever, exhaustion finally catches up with him. He lies down, suspended between waking and sleep.</p>
<!-- /wp:paragraph -->

<!-- wp:paragraph -->
<p>In that half-dreaming state, time loses its edges. The ground, the flowers, and the suit begin to merge into one continuous landscape, while his thoughts drift between memory and the present.</p>
<!-- /wp:paragraph -->

<!-- wp:video {"id":120160} -->
<figure class="wp-block-video"><video autoplay loop muted src="https://tympanus.net/codrops/wp-content/uploads/2026/08/demo-intro.mp4"></video></figure>
<!-- /wp:video -->

<!-- wp:heading -->
<h2 class="wp-block-heading">Building a Japanese Print Style</h2>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p>The visual exploration for this chapter started with <em>Akira</em>, but my connection to it was emotional before it was technical. Every part of the film stayed with me: the visual style, the atmosphere, the sound, and the music. Long after watching it, those impressions still haunted me in the best way. They left me with a deep desire to make something that could create a similarly lasting feeling.</p>
<!-- /wp:paragraph -->

<!-- wp:paragraph -->
<p>I then looked toward traditional Japanese paintings and folding screens. Their floral forms, clear edges, woven grounds, and irregular ink-like marks create depth and atmosphere through shape, surface, and spacing rather than realism. I wanted to understand what gave these images their quiet, tactile quality.</p>
<!-- /wp:paragraph -->

<!-- wp:paragraph -->
<p>I translated those observations into a real-time 3D scene. Toon shading keeps the planes broad, the ground shadow becomes an uneven ink wash, the silk weave supplies material grain, and procedural growth gives the flowers and tendrils an organic rhythm.</p>
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
<p>The lighting starts with N·L, how much the surface faces the light, where N is the normal and L is the light direction. I remap that value between <code>thresholdLow</code> and <code>thresholdHigh</code>, then <code>floor</code> it into <strong>color levels</strong>; on the character and flowers I keep that at 2, one shadow band and one lit band, since anything more stops reading like print. Shadow and highlight are tints on the base color, and when the bands still look too clean I wobble the threshold with a little world-space noise before the clamp — just enough to break the hard edge.</p>
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

<!-- wp:video {"id":120027} -->
<figure class="wp-block-video"><video autoplay loop muted src="https://tympanus.net/codrops/wp-content/uploads/2026/08/demo-toon-1.mp4" playsinline></video></figure>
<!-- /wp:video -->

<!-- wp:heading {"level":4} -->
<h4 class="wp-block-heading"><strong>Ink-Wash Ground Shadow</strong></h4>
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

<!-- wp:video {"id":120062} -->
<figure class="wp-block-video"><video autoplay loop muted src="https://tympanus.net/codrops/wp-content/uploads/2026/08/demo-shadow-1.mp4" playsinline></video></figure>
<!-- /wp:video -->

<!-- wp:paragraph -->
<p>I wanted the flowers to cast shadows on the character, but not on themselves. I use two shadow maps: one has the character and the flowers, for the ground wash; the other contains only the flowers, sampled by the character. That map comes from a directional light at the same place with no intensity: it only writes depth, and its shadow camera sees the flowers and not the character, so the character can sample it without being in it.</p>
<!-- /wp:paragraph -->

<!-- wp:video {"id":120075} -->
<figure class="wp-block-video"><video autoplay loop muted src="https://tympanus.net/codrops/wp-content/uploads/2026/08/demo-shadow-on-character.mp4" playsinline></video></figure>
<!-- /wp:video -->

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
<p>I was looking at two Japanese folding screens of hollyhocks: Sakai Hōitsu's (1801) and Ogata Kenzan's. The ground is the part I keep noticing — a faint weave, a grid like threads, and marks that sit like stains, uneven enough that it feels painted by hand, and that unevenness is what I wanted in the frame.</p>
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

<!-- wp:video {"id":120091} -->
<figure class="wp-block-video"><video autoplay loop muted src="https://tympanus.net/codrops/wp-content/uploads/2026/08/demo-silk-2.mp4" playsinline></video></figure>
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
<p>For the flower animation I used the <a href="https://superhivemarket.com/products/blooming-flowers---geo-nodes-curve-asset-pack">Blooming Flowers</a> Blender pack. Its carefully designed Geometry Nodes produce motion that feels vivid and graceful, which is why I kept it as the base animation. I turn that motion into VAT, the same technique I used in <em><a href="https://tympanus.net/codrops/2026/04/21/false-earth-from-webgl-limits-to-a-webgpu-driven-world/">False Earth</a></em>, using an <a href="https://github.com/momentchan/BlenderAlembicToVAT">addon</a> I made that handles the whole workflow directly in Blender.</p>
<!-- /wp:paragraph -->

<!-- wp:image {"id":119999,"sizeSlug":"large","linkDestination":"none"} -->
<figure class="wp-block-image size-large"><img src="https://tympanus.net/codrops/wp-content/uploads/2026/08/image-15-1200x711.png" alt="" class="wp-image-119999"/></figure>
<!-- /wp:image -->

<!-- wp:paragraph -->
<p>On top of that baked VAT, petals leave a few at a time — each shrinking toward its own center, then lifting and fanning out. The shedding is inspired by <a href="https://www.teamlab.art/w/flowersandpeople-hour/"><em>Flowers and People</em></a> by teamLab: a flower at its fullest just before it falls. The mesh already comes as separate islands, so I group vertices by connectivity and pack a petal id and a pivot vertex into vertex color; a hash of that id staggers the timing and the lift, so they don't all leave together. I combine VAT with a procedural pass so I get both: the baked motion, and the freedom to invent on top.</p>
<!-- /wp:paragraph -->

<!-- wp:code -->
<pre class="wp-block-code"><code>const petalId = color.g; // island id, 0..1
const pivot = sampleVAT(color.b, frame); // same vertex, current bloom frame
const startJitter = fract(sin(petalId * 127.1) * 43758.5453);
const t = clamp((shed - startJitter * stagger) / (1.0 - stagger), 0.0, 1.0);
const ease = t * t * (3.0 - 2.0 * t);
const shrunk = pivot.add(basePos.sub(pivot).mul(1.0 - ease));</code></pre>
<!-- /wp:code -->

<!-- wp:video {"id":120086} -->
<figure class="wp-block-video"><video autoplay loop muted src="https://tympanus.net/codrops/wp-content/uploads/2026/08/demo-flower-2.mp4" playsinline></video></figure>
<!-- /wp:video -->

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
grown = center.add(positionLocal.sub(center).mul(rScale));
</code></pre>
<!-- /wp:code -->

<!-- wp:video {"id":120087} -->
<figure class="wp-block-video"><video autoplay loop muted src="https://tympanus.net/codrops/wp-content/uploads/2026/08/demo-stem.mp4" playsinline></video></figure>
<!-- /wp:video -->

<!-- wp:heading {"level":4} -->
<h4 class="wp-block-heading"><strong>Leaf</strong></h4>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p>The leaf starts as a modeled mesh. I bend its vertices in the shader: a curl along the blade, tight at first, then easing open as it grows.</p>
<!-- /wp:paragraph -->

<!-- wp:paragraph -->
<p>Then I attach a few of them to the stem. Each <code>t</code> is a seeded sample along the middle of the curve, sorted so they climb in order, and they alternate around the shaft at the tube’s surface for that <code>t</code>. Each position is computed once and does not change after that, so unlike the flower head they do not ride the growing end. The same 0 to 1 that grows the stem reveals the leaf after the front passes that <code>t</code>.</p>
<!-- /wp:paragraph -->

<!-- wp:code -->
<pre class="wp-block-code"><code>curve.getPointAt(t, P);
pos.copy(P).addScaledVector(outward, stemRadius * radiusScale);
const growFrac = smoothstep(attachT, attachT + GROW_WINDOW, stemGrow);
placed = attach.add(leafPos.mul(growFrac));</code></pre>
<!-- /wp:code -->

<!-- wp:video {"id":120088} -->
<figure class="wp-block-video"><video autoplay loop muted src="https://tympanus.net/codrops/wp-content/uploads/2026/08/demo-leaf.mp4" playsinline></video></figure>
<!-- /wp:video -->

<!-- wp:heading {"level":4} -->
<h4 class="wp-block-heading"><strong>Lifecycle</strong></h4>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p>The clock is the same four stages as <em>False Earth</em>: <strong>Delay, Grow, Keep, Die</strong> — and Die itself is shed, then retract. One age drives the plant. In Delay the stem rests; flower and leaf are not in yet. Grow is the stem’s 0–1: the flower rides that tip as the VAT opens, while each leaf waits on the shaft, then uncurls after the front has passed. Keep holds — stem stands, flower full, leaves open. Then <strong>petal shed</strong> runs while the stem still stands and the leaves stay; after that the stem goes 1→0, and the leaves go with it.</p>
<!-- /wp:paragraph -->

<!-- wp:image {"id":120005,"sizeSlug":"large","linkDestination":"none"} -->
<figure class="wp-block-image size-large"><img src="https://tympanus.net/codrops/wp-content/uploads/2026/08/lifecycle-timeline-1200x800.png" alt="" class="wp-image-120005"/></figure>
<!-- /wp:image -->

<!-- wp:heading -->
<h2 class="wp-block-heading">The Field</h2>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p>Scattering copies at random around the astronaut reads as noise. I wanted a layout that feels grown: masses that thicken and thin, with bare ground between them, like a thicket that grew there. Drawings like these are what I built toward — dense hubs, a soft fall-off.</p>
<!-- /wp:paragraph -->

<!-- wp:gallery {"linkTo":"none"} -->
<figure class="wp-block-gallery has-nested-images columns-default is-cropped"><!-- wp:image {"id":120010,"sizeSlug":"large","linkDestination":"none"} -->
<figure class="wp-block-image size-large"><img src="https://tympanus.net/codrops/wp-content/uploads/2026/08/image-19-505x900.png" alt="" class="wp-image-120010"/></figure>
<!-- /wp:image -->

<!-- wp:image {"id":120007,"sizeSlug":"large","linkDestination":"none"} -->
<figure class="wp-block-image size-large"><img src="https://tympanus.net/codrops/wp-content/uploads/2026/08/image-16-602x900.png" alt="" class="wp-image-120007"/></figure>
<!-- /wp:image --></figure>
<!-- /wp:gallery -->

<!-- wp:paragraph -->
<p>The field is a probability map first, placement second. Anchors raise the chance of plants around the body, and a warped field turns that into irregular masses. Hearts are placed inside those masses and wander slowly, while the density field itself does not change. Flowers <strong>hop</strong> off a heart, and when a plant dies the flower hops again the same way.</p>
<!-- /wp:paragraph -->

<!-- wp:heading {"level":4} -->
<h4 class="wp-block-heading"><strong>The Density Field</strong></h4>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p>The anchors are <strong>hip</strong>, <strong>left hand</strong>, <strong>left boot</strong>, and <strong>backpack</strong>. Each one only raises the chance of plants nearby; they stay where the pose put them, neighboring fields can merge, and each falloff is an ellipse along the limb. I warp the sample first so the shape is uneven, then add the anchors and clamp so overlaps become one mass. Points under the body or the pack I drop with the posed MeshBVH, which I use again later for the tendrils. After that I leave <strong>bare patches</strong> so it does not fill in like a carpet.</p>
<!-- /wp:paragraph -->

<!-- wp:heading {"level":4} -->
<h4 class="wp-block-heading"><strong>Hearts and Hops</strong></h4>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p>The density field is the static layout, and this part is how flowers grow on it. I place <strong>hearts</strong> first — clump centers, about one for every seven plants. I split the count across the anchors by weight, then sample each heart against that density field until one is accepted. The hearts wander slowly on their own, while the density field they are sampled against does not change.</p>
<!-- /wp:paragraph -->

<!-- wp:paragraph -->
<p>A flower <strong>hops</strong> by taking a short random step off a heart, then I keep that point only if the density field accepts it, the same check as the heart. When a plant dies the flower hops again the same way, so the clumps stay around the hearts as those hearts wander. Once a flower has a spot, head size and how far it can open follow local density. Rose is the quieter shape, so it is common and can fill the mass, while dahlia is brighter and busier, so I keep that one rare.</p>
<!-- /wp:paragraph -->

<!-- wp:video {"id":120094} -->
<figure class="wp-block-video"><video autoplay loop muted src="https://tympanus.net/codrops/wp-content/uploads/2026/08/demo-field-1.mp4" playsinline></video></figure>
<!-- /wp:video -->

<!-- wp:heading {"level":4} -->
<h4 class="wp-block-heading"><strong>Packed Stems</strong></h4>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p>Stems are packed into one draw, the same instinct as instancing the grass in <em>False Earth</em>. Each plant keeps its static metadata on the CPU as a JavaScript object: its seed, flower type, anchor, heart, and opening range, written once when the field is laid out from the density at that spot. Each tube is built once. Every frame, I pack only the changing values — how far the stem has come, a little sway, and a world offset and yaw — into a DataTexture for the GPU to read, so a respawn can move without remeshing.</p>
<!-- /wp:paragraph -->

<!-- wp:image {"id":120112,"width":"689px","height":"auto","aspectRatio":"2.259920968555574","sizeSlug":"full","linkDestination":"none","align":"center"} -->
<figure class="wp-block-image aligncenter size-full is-resized"><img src="https://tympanus.net/codrops/wp-content/uploads/2026/08/Group-46-1-1.png" alt="" class="wp-image-120112" style="aspect-ratio:2.259920968555574;width:689px;height:auto"/></figure>
<!-- /wp:image -->

<!-- wp:heading -->
<h2 class="wp-block-heading">Generative Tendrils</h2>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p>I added tendrils to connect the garden to the astronaut: the field grows around him, and a second system grows across the suit. The paths need to feel grown rather than drawn, belong to the same print language, and emerge from the posed meshes.</p>
<!-- /wp:paragraph -->

<!-- wp:paragraph -->
<p>None of these curves are hand-authored; each one comes out of the geometry, by choosing a place for it to touch the suit, building its local wrap, routing that contact across the mesh down to the ground, and handing the resulting tree to the growth system. Below is how a branch is represented, and then the surface routing that creates one.</p>
<!-- /wp:paragraph -->

<!-- wp:heading {"level":4} -->
<h4 class="wp-block-heading"><strong>Tendril Trees</strong></h4>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p>A field stem is one curve from ground to tip. A tendril tree joins packed tube segments under one <strong>tree</strong> and one growth clock, so a ground path can fork into several wraps while the whole structure grows as one path. I use the root-to-tip reveal idea from <a href="https://github.com/mattatz/THREE.Tree">mattatz/THREE.Tree</a>, while the branching here comes from surface routes and wrap targets. Routes taper toward the tips as their downstream load gets smaller. The wrap curves use one shared world-space spatial noise field, so nearby paths wobble together. Each wrap is a partial arc around its local guide for radial guides, while broad planar guides use a surface stroke, and both are offset slightly from the suit.</p>
<!-- /wp:paragraph -->

<!-- wp:heading {"level":4} -->
<h4 class="wp-block-heading"><strong>How They Grow</strong></h4>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p>The routing is easier to understand as two linked jobs. The <strong>MeshBVH</strong> handles geometric queries: it finds the suit surface for the wrap and checks each candidate. The <strong>surface graph</strong> handles connectivity: it provides the walk from the ground to the wrap's hitch. Together, the ground route and wrap curve form one tendril. The hitch is their handoff point: the ground route reaches it, and the wrap curve continues from it across the host surface. The steps below keep those jobs separate.</p>
<!-- /wp:paragraph -->

<!-- wp:list {"ordered":true} -->
<ol class="wp-block-list"><!-- wp:list-item -->
<li><strong>Prepare the hosts</strong><p>I bake the posed body and backpack into host-space geometries, build one BVH for each, and turn their meshes into surface graphs.</p></li>
<!-- /wp:list-item --></ol>
<!-- /wp:list -->

<!-- wp:heading {"level":5} -->
<h5 class="wp-block-heading"><strong>Wrap Construction</strong></h5>
<!-- /wp:heading -->

<!-- wp:list {"ordered":true,"start":2} -->
<ol start="2" class="wp-block-list"><!-- wp:list-item -->
<li><strong>Choose a wrap station</strong><p>I sample the posed surface, assign each accepted point to an eligible guide, and store its normalized position <code>u</code> along that guide, which is where the wrap begins.</p></li>
<!-- /wp:list-item -->

<!-- wp:list-item -->
<li><strong>Generate wrap candidates</strong><p>The guide turns that station into temporary candidate positions, which are the points where I test the host surface.</p></li>
<!-- /wp:list-item -->

<!-- wp:list-item -->
<li><strong>Project the candidates onto the host</strong><p>I project each candidate onto the host surface using the guide and host BVH. The accepted hits are ordered into the <strong>wrap curve</strong>, whose first point is the <strong>hitch</strong>.</p></li>
<!-- /wp:list-item --></ol>
<!-- /wp:list -->

<!-- wp:heading {"level":5} -->
<h5 class="wp-block-heading"><strong>Ground Route</strong></h5>
<!-- /wp:heading -->

<!-- wp:list {"ordered":true,"start":5} -->
<ol start="5" class="wp-block-list"><!-- wp:list-item -->
<li><strong>Choose the graph hitch</strong><p>The surface hitch may lie inside a triangle rather than on a graph vertex, so I select a nearby graph node as the <strong>graph hitch</strong>, which gives the ground route a discrete endpoint to walk to.</p></li>
<!-- /wp:list-item -->

<!-- wp:list-item -->
<li><strong>Route from the ground</strong><p>I use ground-near vertices as Dijkstra sources and trace the shortest path to the graph hitch. That path becomes the <strong>ground route</strong>.</p></li>
<!-- /wp:list-item --></ol>
<!-- /wp:list -->

<!-- wp:paragraph -->
<p>Finally, the wrap curve meets the ground route at the graph hitch. Both parts share one tendril tree and one growth distance, so a single growth front reveals the tendril from the ground, through the hitch, and around the wrap.</p>
<!-- /wp:paragraph -->

<!-- wp:video {"id":120095} -->
<figure class="wp-block-video"><video autoplay loop muted src="https://tympanus.net/codrops/wp-content/uploads/2026/08/demo-tendril.mp4" playsinline></video></figure>
<!-- /wp:video -->

<!-- wp:heading {"level":4} -->
<h4 class="wp-block-heading"><strong>Suit Integration</strong></h4>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p>The body and backpack use the same host and routing pipeline. The backpack contributes a lighter contact layer, while the body carries most of the routes. Plumera heads bind to active wraps, giving the suit a different flower from the field.</p>
<!-- /wp:paragraph -->

<!-- wp:heading -->
<h2 class="wp-block-heading">Flower LOD Across Backends</h2>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p>I reuse the culling and LOD pattern from <em>False Earth</em> for animated VAT flowers. The high- and low-poly meshes share one per-head data store, while each LOD keeps its own visible-index list. On Apple touch devices and the WebGL2 fallback, I select one distance band per flower on the CPU, compact the indices, disable indirect drawing, and set each mesh's <code>mesh.count</code>.</p>
<!-- /wp:paragraph -->

<!-- wp:paragraph -->
<p>The low-poly VAT geometry also serves as a shadow-only proxy on a separate render layer. It stays out of the view camera and is used by the shadow maps, so those passes do not need the full flower geometry.</p>
<!-- /wp:paragraph -->

<!-- wp:heading -->
<h2 class="wp-block-heading">Conclusion</h2>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p>This chapter started with looking rather than coding: how <em>Akira</em> and the folding screens get their atmosphere out of flat color, clear edges, tactile surfaces, and careful spacing. Those qualities became toon-shaded forms, ink-wash shadows, woven surfaces, procedural flowers, and tendrils that grow across the posed body.</p>
<!-- /wp:paragraph -->

<!-- wp:paragraph -->
<p>Copying a reference was never the point, so each time I had to work out what actually created the feeling and find a way to get that in real-time 3D. The field rules, flower lifecycles, packed data, tendril routes, culling, level of detail, and lightweight shadow proxies all had to earn their place visually or narratively. The hardest part was the trade against performance: I wanted the scene to feel dense, tactile, and alive, and every extra vertex, instance, shadow, and layer of detail had a cost.</p>
<!-- /wp:paragraph -->

<!-- wp:paragraph -->
<p>For future chapters, I want to keep that curiosity and attention to observation. A new story may lead me toward a different visual direction, while a visual experiment may reveal a story I had not considered before.</p>
<!-- /wp:paragraph -->
