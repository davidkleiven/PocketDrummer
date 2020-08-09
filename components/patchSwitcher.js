import TrackPlayer from 'react-native-track-player';
import { MIN_REQUEST_TIME, FILL_IDLE } from '../constants';
import ExtractTracks from './trackManager';
import {copyFile, DocumentDirectoryPath, unlink} from 'react-native-fs';

// Declare some constants used for naming patches
const PATCH1 = 'patch1'
const PATCH2 = 'patch2'
const END = 'end'
const INTRO = 'intro'
const FILL1 = 'fill1'
const FILL2 = 'fill2'

class PatchSwitch {
    constructor(uiprops) {
        this.uiprops = uiprops
        this.activeVariation = this.uiprops.variation
        this.playbackChangedSubsciption = null
        this.endRequested = false
        this.tracks = null
        this.fillInProgress = false
    }

    mainTrack() {
        const f = this.tracks.folder
        // TODO: Multiple variations are not yet supported
        return f + this.tracks.var1.main
        //return this.uiprops.variation === 0 ? f + this.tracks.var1.main : f + this.tracks.var2.main
    }

    fill1Track() {
        const f = this.tracks.folder
        return this.uiprops.variation === 0 ? f + this.tracks.var1.fill1 : f + this.tracks.var2.fill1
    }

    fill2Track() {
        const f = this.tracks.folder
        return this.uiprops.variation === 0 ? f + this.tracks.var1.fill2 : f + this.tracks.var2.fill2
    }

    introTrack() {
        return this.tracks.folder + this.tracks.intro
    }

    endTrack() {
        return this.tracks.folder + this.tracks.end
    }

    fillTrack(fillNo) {
        return fillNo === 0 ? this.fill1Track() : this.fill2Track()
    }

    fillSetter(fillNo) {
        return fillNo === 0 ? this.uiprops.fill1.setter : this.uiprops.fill2.setter
    }

    async loadRythm() {
        const uri = this.uiprops.rythm.value.uri
        const destination = DocumentDirectoryPath + '/activeRythm.zip'
        try {
            await unlink(destination)
        } catch(err) {
            console.log(err)
        }

        await copyFile(uri, destination)
        this.tracks = await ExtractTracks(destination)
    }

    async add(tr, insertBeforeId) {
        if (!this.endRequested) {
            return TrackPlayer.add(tr, insertBeforeId)
        }
        return Promise.resolve()
    }


    async start() {
        try {
            await this.loadRythm()
        } catch (err) {
            this.uiprops.status.setter("Could not load rythm")
            this.stop()
            return
        }

        TrackPlayer.setupPlayer().then(async () => {

            if (this.uiprops.intro.value && this.introTrack() !== '') {
                await this.add({
                    id: INTRO,
                    url: this.introTrack()
                })
            }

            // Adds a track to the queue
            await this.add({
                id: PATCH1,
                url: this.mainTrack(),
            })

            await this.add({
                id: PATCH2,
                url: this.mainTrack()
            });

            this.playbackChangedSubsciption = TrackPlayer.addEventListener("playback-track-changed", (data) => {
                TrackPlayer.getTrack(data.track).then(async (tr) => {

                    if (tr !== null) {
                        console.log(tr.id)

                        switch (tr.id) {
                            case PATCH1:
                            case PATCH2:
                                console.log("Requeing")
                                TrackPlayer.remove(tr.id).then(
                                    this.add(tr)
                                )
                                break;
                            case FILL1:
                                TrackPlayer.remove(tr.id)
                                this.uiprops.fill1.setter(FILL_IDLE)
                                this.fillInProgress = false
                                break;
                            case FILL2:
                                TrackPlayer.remove(tr.id)
                                this.uiprops.fill2.setter(FILL_IDLE)
                                this.fillInProgress = false
                                break;
                            case END:
                                this.stop()
                                break;
                            case INTRO:
                                TrackPlayer.remove(tr.id)
                                break;
                            default:
                                console.log("NOTHING")
                        }

                        TrackPlayer.getQueue().then((q) => {
                            console.log(q.length)
                        })
                    }
                })
            })

            await TrackPlayer.play();
        });
    }

    async stop() {
        await TrackPlayer.stop()
        if (this.playbackChangedSubsciption !== null) {
            this.playbackChangedSubsciption.remove()
        }
        
        this.playbackChangedSubsciption = null
        this.endRequested = false

        this.uiprops.end.setter(0)
        this.uiprops.startStop.setter(0)
    }

    async fill(fillNo) {
        if (this.fillInProgress || this.fillTrack(fillNo) === ''){
            return
        }

        const trackId = fillNo === 0 ? FILL1 : FILL2
        const queue = await TrackPlayer.getQueue()
        const beforeId = queue[1].id
        const d = await TrackPlayer.getDuration()
        const p = await TrackPlayer.getPosition()
        if ((d - p) > MIN_REQUEST_TIME) {
            await this.add({
                id: trackId,
                url: this.fillTrack(fillNo),
            }, beforeId)
            this.fillInProgress = true
        } else {
            this.fillSetter(fillNo)(FILL_IDLE)
            console.log("Fill rejected because query was too late")
        }
    }

    async end() {
        const queue = await TrackPlayer.getQueue()
        const beforeId = queue[1].id
        const d = await TrackPlayer.getDuration()
        const p = await TrackPlayer.getPosition()
        const endTrack = {
            id: END,
            url: this.endTrack()
        }
        
        if (d - p > MIN_REQUEST_TIME) {
            this.add(endTrack, beforeId).then(() => {
                TrackPlayer.remove(beforeId)
            })
        } else {
            this.add(endTrack)
        }
        this.endRequested = true
    }
}

export default PatchSwitch;