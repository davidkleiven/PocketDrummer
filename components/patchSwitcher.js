import TrackPlayer from 'react-native-track-player';
import { MIN_REQUEST_TIME, FILL_IDLE } from '../constants';
import ExtractTracks from './trackManager';
import { copyFile, DocumentDirectoryPath, unlink, exists, downloadFile } from 'react-native-fs';

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
        this.currentURI = ''
    }

    mainTrack() {
        const f = this.tracks.folder
        return this.uiprops.variation === 0 ? f + this.tracks.var1.main : f + this.tracks.var2.main
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

    hasIntroTrack() {
        return this.tracks.intro !== ''
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

    hasFill1() {
        const v = this.uiprops.variation
        return v == 0 ? this.tracks.var1.fill1 !== '' : this.tracks.var2.fill1 !== ''
    }

    hasFill2() {
        const v = this.uiprops.variation
        return v == 0 ? this.tracks.var1.fill2 !== '' : this.tracks.var2.fill2 !== ''
    }

    hasFill(fillNo) {
        return fillNo === 0 ? this.hasFill() : this.hasFill2()
    }

    hasEnd() {
        return this.tracks.end !== ''
    }

    async loadRythm() {
        const uri = this.uiprops.rythm.value.uri
        const destination = DocumentDirectoryPath + '/activeRythm.zip'
        try {
            try{await unlink(destination)} catch (err) {console.log("unlink: ", err)}

            if (String(uri).startsWith("http")) {
                console.log("Downloading file...")
                this.status("Downloading rhythm...")
                downloadRes = await downloadFile({
                    fromUrl: uri,
                    toFile: destination
                }).promise
                this.status("Download finished. Playing...")
                console.log(downloadRes)
            } else {
                await copyFile(uri, destination)
            }
            this.tracks = await ExtractTracks(destination)
        } catch (err) {
            console.log("Error in loadRhythm")
            console.log(err)
            this.status("Could not load file")
            throw (err)
        }
    }

    async add(tr, insertBeforeId) {
        if (!this.endRequested) {
            return TrackPlayer.add(tr, insertBeforeId)
        }
        return Promise.resolve()
    }

    status(msg) {
        this.uiprops.status.setter(msg)
    }

    checkRhythm() {
        let status = this.uiprops.status.setter
        const confirm = "Confirm that the file is given correctly in info.json"
        if (this.tracks.intro.value !== '' && !exists(this.introTrack())) {
            status("Invalid intro track. " + confirm)
            return false
        }

        if (this.tracks.end.value !== '' && !exists(this.endTrack())) {
            status("Invalid end track. " + confirm)
            return false
        }

        if (!exists(this.mainTrack())) {
            status("Cannot open main track. " + confirm)
            return false
        }

        const f = this.tracks.folder
        if (!exists(f + this.tracks.var1.main)) {
            status("Cannot find main track for variation 1, which must be given.")
            return false
        }

        if (!exists(f + this.tracks.var2.main)) {
            status("Cannot find main track for variation 2. It must be given.")
            return false
        }

        if (this.tracks.var1.fill1 !== '' && !exists(f + this.tracks.var1.fill1)) {
            status("Invalid variation 1 fill 1 track. " + confirm)
            return false
        }

        if (this.tracks.var1.fill2 !== '' && !exists(f + this.tracks.var1.fill2)) {
            status("Invalid variation 1 fill 2 track. " + confirm)
            return false
        }

        if (this.tracks.var2.fill1 !== '' && !exists(f + this.tracks.var2.fill1)) {
            status("Invalid variation 2 fill 1 track. " + confirm)
            return falses
        }

        if (this.tracks.var2.fill2 !== '' && !exists(f + this.tracks.var2.fill2)) {
            status("Invalid variation 2 fill 2 track. " + confirm)
            return false
        }
        return true
    }


    async start() {
        try {
            if (this.currentURI !== this.uiprops.rythm.value.uri) {
                await this.loadRythm()
            }
        } catch (err) {
            this.status("Could not load rythm. Either the zip file is not valid or info.json could not be parsed.")
            this.stop()
            return
        }

        if (!this.checkRhythm()) {
            this.stop()
            return
        }

        TrackPlayer.setupPlayer().then(async () => {

            if (this.uiprops.intro.value && this.hasIntroTrack()) {
                try {
                    await this.add({
                        id: INTRO,
                        url: this.introTrack()
                    })
                } catch (err) {
                    console.log(err)
                    this.status("Could not add intro track")
                    return
                }
            }

            try {
                // Adds a track to the queue
                await this.add({
                    id: PATCH1,
                    url: this.mainTrack(),
                })

                await this.add({
                    id: PATCH2,
                    url: this.mainTrack()
                });
            } catch (err) {
                console.log(err)
                this.status("Could not add main track")
                return
            }
            

            this.playbackChangedSubsciption = TrackPlayer.addEventListener("playback-track-changed", (data) => {
                TrackPlayer.getTrack(data.track).then(async (tr) => {
                    if (tr !== null) {
                        switch (tr.id) {
                            case PATCH1:
                            case PATCH2:
                                console.log("Requeing")
                                TrackPlayer.remove(tr.id).then(
                                    this.add({
                                        id: tr.id,
                                        url: this.mainTrack()
                                    })
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
                    }
                }).catch((err) => {
                    console.log(err)
                    this.status("Error when handling playback changed")
                })
            })

            try {
                await TrackPlayer.play();
            } catch (err) {
                console.log(err)
                this.status("Could not start track")
            }
        });
    }

    async stop() {
        try {
            await TrackPlayer.stop()
        } catch (err) {
            console.log(err)
            this.status("Could not stop TrackPlayer")
        }
        if (this.playbackChangedSubsciption !== null) {
            this.playbackChangedSubsciption.remove()
        }

        this.playbackChangedSubsciption = null
        this.endRequested = false

        this.uiprops.end.setter(0)
        this.uiprops.startStop.setter(0)
        this.uiprops.setTimerOn(false)
    }

    async fill(fillNo) {
        if (this.fillInProgress) {
            return
        }

        if (this.tracks === null) {
            return
        }

        if (!this.hasFill(fillNo)) {
            setter = this.fillSetter(fillNo)
            setter(FILL_IDLE)
            return
        }

        try {
            await this.add({
                id: fillNo === 0 ? FILL1 : FILL2,
                url: this.fillTrack(fillNo),
            })
        } catch (err) {
            console.log(err)
            this.status("Could not add fill")
        }
       
        this.fillInProgress = true
    }

    async end() {
        if (this.tracks === null) {
            return
        }

        if (!this.hasEnd()) {
            this.uiprops.end.setter(0)
            return
        }

        const endTrack = {
            id: END,
            url: this.endTrack()
        }

        this.add(endTrack)
        this.endRequested = true
    }
}

export default PatchSwitch;