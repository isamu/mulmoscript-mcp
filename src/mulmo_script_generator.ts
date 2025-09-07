

export class MulmoScriotGenerator {
  protected outputDir: string | undefined;
  protected data: any;
  
  constructor({ outputDir }: { outputDir?: string; }) {
    this.outputDir = outputDir;
    this.data = {
      "$mulmocast": {
        "version": "1.1"
      },
      "lang": "ja",
      "title": "",
      "beats": []
    }
  }
  
  public dumpScript = () => {
    return {
      text: JSON.stringify(this.data, null, 2)
    };
  };

  public resetScript = () => {
    this.data = {
      "$mulmocast": {
        "version": "1.1"
      },
      "lang": "ja",
      "title": "",
      "beats": []
    }
    return {
      text: "",
    };
  }
    
  public addBeat = ({beat}: {beat: any}) => {
    this.data.beats.push(beat);
    return {
      text: JSON.stringify(this.data, null, 2)
    };
  };

  public updateBeat = ({index, beat}: {index: number, beat: any}) => {
    if (this.data.beats[index]) {
      this.data.beats[index] = beat;
    }
    return {
      text: JSON.stringify(this.data, null, 2)
    };
  };

  public saveBeat = () => {
    // TODO
    return {
      text: "",
    };
  };

  public loadBeat = () => {
    // TODO
    return {
      text: "",
    };
  };
  
}
