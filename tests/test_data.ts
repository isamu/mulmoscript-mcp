import { MulmoScriotGenerator } from "../src/mulmo_script_generator";

import test from "node:test";

test("test", async () => {
  const generator = new MulmoScriotGenerator({ outputDir: "123" });

  console.log(generator.dumpScript());

  generator.addBeatToMulmoScript({ beat: { text: "hello 1" } });
  console.log(generator.dumpScript());

  generator.addBeatToMulmoScript({ beat: { text: "hello 2" } });
  console.log(generator.dumpScript());

  generator.updateBeatOnMulmoScript({ index: 1, beat: { text: "update 2" } });
  console.log(generator.dumpScript());

  generator.insertAtBeatToMulmoScript({ index: 0, beat: { text: "insert" } });
  console.log(generator.dumpScript());

  generator.deleteBeatOnMulmoScript({ index: 1 });
  console.log(generator.dumpScript());
});
