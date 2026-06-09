import { NodeIO } from '@gltf-transform/core';

async function analyze() {
  const io = new NodeIO();
  const doc = await io.read('public/models/doctor.glb');
  
  const root = doc.getRoot();
  console.log("=== ANIMATIONS ===");
  root.listAnimations().forEach(anim => console.log(anim.getName()));
  
  console.log("\n=== MESHES WITH MORPH TARGETS ===");
  root.listMeshes().forEach(mesh => {
    mesh.listPrimitives().forEach(prim => {
      const targets = prim.listTargets();
      if (targets.length > 0) {
        console.log(`Mesh: ${mesh.getName()}`);
        // We only need the names of the targets. glTF-transform doesn't store names on targets directly, 
        // they are usually in the mesh extras or target names extension. 
        // We will just read the extras from the primitive if possible.
        const targetNames = mesh.getExtras()?.targetNames || prim.getExtras()?.targetNames || [];
        console.log(`Target Count: ${targets.length}`);
      }
    });
  });
}

analyze().catch(console.error);
