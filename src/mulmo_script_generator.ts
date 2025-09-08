import path from "path";
import { writeFileSync, mkdirSync } from "fs";

export class MulmoScriotGenerator {
  protected outputDir: string;
  protected sessionDir: string;
  protected data: any;

  constructor({ outputDir }: { outputDir?: string }) {
    this.outputDir = outputDir ?? "";
    this.sessionDir = "";
    this.data = {
      $mulmocast: {
        version: "1.1",
      },
      lang: "ja",
      title: "",
      beats: [],
    };
  }

  public dumpScript = () => {
    return {
      text: JSON.stringify(this.data, null, 2),
    };
  };

  public resetScript = () => {
    this.data = {
      $mulmocast: {
        version: "1.1",
      },
      lang: "ja",
      title: "",
      beats: [],
    };
    return {
      text: "",
    };
  };

  public setSpeaker = () => {
    // TODO
    return { text: "" };
  };

  public addBeatToMulmoScript = ({ beat }: { beat: any }) => {
    if (typeof beat === "string") {
      this.data.beats.push(JSON.parse(beat));
    } else {
      this.data.beats.push(beat);
    }
    this.data.beats[this.data.beats.length - 1].id = crypto.randomUUID();
    return {
      text: JSON.stringify(this.data, null, 2),
    };
  };

  public updateBeatOnMulmoScript = ({ index, beat }: { index: number; beat: any }) => {
    if (!this.data.beats[index]) {
      return { text: `not exist such beat ${index}` };
    }
    const newBeat = typeof beat === "string" ? JSON.parse(beat) : beat;
    this.data.beats[index] = { ...this.data.beats[index], newBeat };
    return {
      text: JSON.stringify(this.data, null, 2),
    };
  };

  public setImagePromptOnBeat = ({ index, text }: { index: number; text: string }) => {
    if (!this.data.beats[index]) {
      return { text: `not exist such beat ${index}` };
    }
    this.data.beats[index]["imagePrompt"] = text;
    return {
      text: JSON.stringify(this.data, null, 2),
    };
  };

  public saveMulmoScript = () => {
    const outputDir = path.resolve(this.outputDir, this.sessionDir);
    const outFile = path.resolve(outputDir, "script.json");

    writeFileSync(outFile, JSON.stringify(this.data, null, 2));

    return {
      text: `saved script: ${outFile}`,
    };
  };

  // for mcp
  public setDirectory = async ({ directoryName }: { directoryName: string }) => {
    this.sessionDir = directoryName as string;
    const outputDir = path.resolve(this.outputDir, this.sessionDir);
    mkdirSync(outputDir, { recursive: true });

    return {
      text: `set directory: ${this.sessionDir}`,
    };
  };
}
