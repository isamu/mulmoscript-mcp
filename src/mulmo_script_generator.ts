import path from "path";
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

  // from vision
  public callNamedFunction = async (functionName: string, args?: any) => {
    const { _index: index } = args;
    if (index === undefined || !this.data.beats[index]) {
      return { text: `not exist such beat ${index}` };
    }
    //
    const { imagePrompt, ...newBeat } = this.data.beats[index];
    this.data.beats[index] = {
      ...newBeat,
      image: {
        type: "vision",
        style: functionNameToTemplateName(functionName),
        data: args,
      },
    };
  };
}
export const functionNameToTemplateName = (functionName: string) => {
  const tmpName = functionName.replace(/^updateBeatStyleTo/i, "");
  const fileName = tmpName.charAt(0).toLowerCase() + tmpName.slice(1);
  return fileName + "Slide";
};
