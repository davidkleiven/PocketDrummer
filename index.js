/**
 * @format
 */

import {AppRegistry} from 'react-native';
import App from './App';
import {name as appName} from './app.json';
import TrackPlayer from 'react-native-track-player';

AppRegistry.registerComponent(appName, () => App);
// TODO: Look into this. Think event listeners should be added here
// But this line silences the "no tasks registered warning"
TrackPlayer.registerPlaybackService(() => async (data) =>{})
