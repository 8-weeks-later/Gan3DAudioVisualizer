export default class AudioFileAnalyser {
    chunkLength: number;
    sampleRate: number;
    audioSampleSize: number;

    input: HTMLInputElement;
    audioContext: AudioContext;

    constructor(chunkSize: number, fftSize: number);
    analyse(): Promise<number[]>;
}