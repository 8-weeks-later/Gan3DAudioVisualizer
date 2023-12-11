import Meyda from "meyda";

export default class AudioFileAnalyser {
    margin: number;
    chunkLength: number;
    sampleRate: number;
    audioSampleSize: number;

    input: HTMLInputElement;
    audioContext: AudioContext;

    constructor(margin: number, chunkLength: number, sampleRate: number, audioSampleSize: number){
        this.input = document.querySelector("input");
        this.margin = margin;
        this.chunkLength = chunkLength;
        this.sampleRate = sampleRate; // 44100
        this.audioSampleSize = audioSampleSize; // 64 or 512

        this.audioContext = new AudioContext();
    }

    // https://meyda.js.org/audio-features#amplitudespectrum
    // TODO: 문서 정리
    // TODO: amplitudeSpectrum과 powerSpectrum의 비교
    async analyser(): Promise<number[]>{
        const array = [];
        fetch(URL.createObjectURL(this.input.files[0]))
            .then((response) => response.arrayBuffer())
            .then((arrayBuffer) => {
                var offlineAudioContext = new OfflineAudioContext({
                    length: 1,
                    sampleRate: this.sampleRate
                });
                return offlineAudioContext.decodeAudioData(arrayBuffer);
            })
            .then((audioBuffer) => {
                const audioSampleSize = this.audioSampleSize;
                const signal = new Float32Array(audioSampleSize);            
                const chunkSize = Math.ceil(audioSampleSize / this.chunkLength);

                for (let i = 0; i < audioBuffer.length; i += audioSampleSize) {
                    audioBuffer.copyFromChannel(signal, 0, i);
                    const extractedData = Meyda.extract('amplitudeSpectrum', signal)
                    const amplitudeSpectrum = extractedData as unknown as Float32Array;

                    if (amplitudeSpectrum == null || amplitudeSpectrum.length === 0) {
                        continue;
                    }

                    let j = 0;
                    const length = amplitudeSpectrum.length;
                    while (j < length) {
                        var value = amplitudeSpectrum.slice(j, j += chunkSize).reduce(function (total, value) {
                            return Math.max(total, Math.abs(value));
                        });
                        array.push(value);
                    }
                }
            });

        return array;
    }
}