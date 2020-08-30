import {ZIP_TARGET_PATH} from '../constants';
import {unzip} from 'react-native-zip-archive';
import {readFile, DocumentDirectoryPath, readDir, unlink} from 'react-native-fs';

async function folderNames(folder) {
    const content = await readDir(folder)
    let names = new Array()
    content.forEach((item, idx) => {
        if (item.isDirectory()) {
            names.push(item.path)
        }
    })
    return names
}

ExtractTracks = async (zipfile) => {

    // Store everything in the folder
    const sourceDir = DocumentDirectoryPath + '/'
    const folder = DocumentDirectoryPath + '/tracks/'
    try {
        await unlink(folder)
    } catch(err) {
        console.log(err)
    }

    res = await unzip(zipfile, sourceDir)
    console.log("File unzipped to", res)
    
    infoPath = folder + '/info.json'
    content = await readFile(infoPath)
    const data = JSON.parse(content).tracks
    data.folder = folder
    return data
}

export default ExtractTracks