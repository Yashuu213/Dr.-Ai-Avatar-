const fs = require('fs');

function readGLB(filePath) {
  const buffer = fs.readFileSync(filePath);
  
  // Magic 0x46546C67 ("glTF")
  const magic = buffer.readUInt32LE(0);
  if (magic !== 0x46546C67) {
    console.error("Not a valid GLB");
    return;
  }
  
  // JSON chunk length and type
  const chunkLength = buffer.readUInt32LE(12);
  const chunkType = buffer.readUInt32LE(16);
  if (chunkType !== 0x4E4F534A) { // "JSON"
    console.error("First chunk is not JSON");
    return;
  }
  
  const jsonStr = buffer.toString('utf8', 20, 20 + chunkLength);
  const json = JSON.parse(jsonStr);
  
  console.log("=== ANIMATIONS ===");
  if (json.animations) {
    json.animations.forEach(a => console.log(a.name));
  } else {
    console.log("No animations found");
  }
  
  console.log("\n=== MESHES ===");
  json.meshes.forEach(m => {
    if (m.extras && m.extras.targetNames) {
      console.log(`Mesh: ${m.name}`);
      console.log(`Targets: ${m.extras.targetNames.slice(0, 10).join(', ')} ...`);
    } else {
        // Avaturn might store target names in mesh primitives extras
        let targets = [];
        if (m.primitives && m.primitives[0].extras && m.primitives[0].extras.targetNames) {
            targets = m.primitives[0].extras.targetNames;
        }
        if (targets.length > 0) {
            console.log(`Mesh: ${m.name}`);
            console.log(`Targets: ${targets.slice(0, 15).join(', ')} ...`);
        }
    }
  });
}

readGLB('public/models/doctor.glb');
