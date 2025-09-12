import path from "path";
import fs from "fs";
import os from "os";
import { writeFileSync, mkdirSync } from "fs";

type BeatWithPosition = { index: number; beat: Beat };
type BeatPosition = { index: number };
type Beat = {
  id?: string;
  speaker?: string;
  test: string;
  imagePrompt?: string;
};

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

  public addBeatToMulmoScript = ({ beat }: { beat: Beat }) => {
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

  public insertAtBeatToMulmoScript = ({ index, beat }: BeatWithPosition) => {
    const newBeat = typeof beat === "string" ? JSON.parse(beat) : beat;
    newBeat.id = crypto.randomUUID();
    this.data.beats.splice(index, 0, newBeat);
    return {
      text: JSON.stringify(this.data, null, 2),
    };
  };

  public updateBeatOnMulmoScript = ({ index, beat }: BeatWithPosition) => {
    if (!this.data.beats[index]) {
      return { text: `not exist such beat ${index}` };
    }
    const newBeat = typeof beat === "string" ? JSON.parse(beat) : beat;
    this.data.beats[index] = { ...this.data.beats[index], ...newBeat };
    return {
      text: JSON.stringify(this.data, null, 2),
    };
  };

  public deleteBeatOnMulmoScript = ({ index }: BeatPosition) => {
    if (!this.data.beats[index]) {
      return { text: `not exist such beat ${index}` };
    }
    this.data.beats.splice(index, 1);
    return {
      text: JSON.stringify(this.data, null, 2),
    };
  };

  public setImagePromptOnBeat = ({ index, imagePrompt }: { index: number; imagePrompt: string }) => {
    if (!this.data.beats[index]) {
      return { text: `not exist such beat ${index}` };
    }
    this.data.beats[index]["imagePrompt"] = imagePrompt;
    return {
      text: JSON.stringify(this.data, null, 2),
      index,
      imagePrompt,
    };
  };

  // TODO:
  // speaker
  //   getSpeakers
  //   setSpeaker
  // style
  //   getStyles
  //   setStyle

  private writeMulmoScript = (isTmp: boolean = false) => {
    const outputDir = path.resolve(this.outputDir, this.sessionDir);
    const outFile = path.resolve(outputDir, isTmp ? Date.now() + ".json" : "script.json");

    writeFileSync(outFile, JSON.stringify(this.data, null, 2));
    return outFile;
  };
  public saveMulmoScript = () => {
    const outFile = this.writeMulmoScript();

    return {
      text: `saved script: ${outFile}`,
    };
  };

  public loadMulmoScript = async ({ directoryName, baseDirectoryName }: { directoryName: string; baseDirectoryName?: string }) => {
    if (baseDirectoryName) {
      const outputDir = path.join(os.homedir(), "Documents", "mulmocast-script", baseDirectoryName);
      const scriptPath = path.join(outputDir, directoryName, "script.json");
      if (fs.existsSync(scriptPath)) {
        this.outputDir = outputDir;
        this.sessionDir = directoryName;
        const data = JSON.parse(fs.readFileSync(scriptPath, "utf-8"));
        this.data = data;
        return {
          text: `load success`,
        };
      }
    }
    return {
      text: `load success`,
    };
  };

  // for mcp
  public setDirectory = async ({ directoryName, baseDirectoryName }: { directoryName: string; baseDirectoryName?: string }) => {
    if (baseDirectoryName) {
      const outputDir = path.join(os.homedir(), "Documents", "mulmocast-script", baseDirectoryName);
      this.outputDir = outputDir;
    }
    this.sessionDir = directoryName as string;
    const outputDir = path.resolve(this.outputDir, this.sessionDir);
    mkdirSync(outputDir, { recursive: true });

    return {
      text: `set directory: ${this.sessionDir}: baseDirectoryName is ${path.basename(this.outputDir)}`,
      baseDirectoryName: path.basename(this.outputDir),
    };
  };

  // from vision
  public callNamedFunction = async (functionName: string, args?: any) => {
    const { _index: index } = args;
    if (index === undefined || !this.data.beats[index]) {
      return { text: `not exist such beat ${index}` };
    }
    //
    const { imagePrompt: __, ...newBeat } = this.data.beats[index];
    this.data.beats[index] = {
      ...newBeat,
      image: {
        type: "vision",
        style: functionNameToTemplateName(functionName),
        data: args,
      },
    };
    this.writeMulmoScript(true);
  };
}
export const functionNameToTemplateName = (functionName: string) => {
  const tmpName = functionName.replace(/^updateBeatStyleTo/i, "");
  const fileName = tmpName.charAt(0).toLowerCase() + tmpName.slice(1);
  return fileName + "Slide";
};
