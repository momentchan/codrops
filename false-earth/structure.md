A. The Core Purpose
The goal is to write a high-quality technical article for Codrops (a web design/development publication). The article explains the implementation of "False Earth", an interactive WebGPU project. It focuses on how advanced graphics techniques—specifically TSL (Three.js Shading Language), VAT (Vertex Animation Textures), and Indirect Drawing—are used to create an infinite, reactive field of grass and flowers within a narrative framework.

B. Narrative & Tone Guidelines
Tone: Frank, direct, and conversational. Avoid "fancy" or overly academic English.

Persona: A creative technologist who is a non-native English speaker. The writing should be clear and accessible, focusing on the journey of a developer.

Story Arc: The project is a sequel to a previous work called Drift. The article must bridge the emotional storytelling (an astronaut's loneliness) with the technical breakthrough (using WebGPU to build a world that feels "false" and infinite).

C. Established Article Structure
We have finalized a 7-section structure to ensure the technical content is balanced with the story. The math/algorithm is the priority, even over the API itself.


1. Intro	Narrative Hook: Connecting Drift to False Earth. (Already Drafted)
2. Ancestry	The Prototypes: Brief mention of the WebGL VAT and Grass experiments as proof-of-concept.
3. Core I	Infinite Grass: The algorithm for procedural geometry, wind, and noise within WebGPU/TSL.
4. Core II	VAT Life Cycles: How the "Bloom/Die" logic is stored in textures and triggered in WebGPU.
5. Breakthrough	The "Why": Why TSL and WebGPU were the right tools for this specific scale.
6. Engine	Optimization: Deep dive into Indirect Draw, GPU Culling, and LOD.
7. Conclusion	Final Thoughts: The future of interactive storytelling on the web.

D. Technical Constraints & Context
Algorithm-First: The logic for the grass and VAT should not be split between the "Ancestry" and "Core" sections. Instead, the "Ancestry" section mentions the limitations of WebGL, while the "Core" sections provide the full technical explanation using WebGPU/TSL.

Key Technical Terms: TSL (Three.js Shading Language), VAT (Vertex Animation Texture), Indirect Draw, GPU Culling, Compute Shaders.

Language Rule: For technical discussions/logic planning, use Traditional Chinese. For the actual article content, use Simple, direct English.
