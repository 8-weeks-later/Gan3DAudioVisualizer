export default class AudioFileAnalyser {
    margin: number;
    chunkLength: number;
    sampleRate: number;
    audioSampleSize: number;

    input: HTMLInputElement;
    audioContext: AudioContext;

    constructor(margin: number, chunkSize: number, fftSize: number);
    analyser(): Promise<number[]>;
}