import React, { useState } from 'react';
import { Text, View, Button, StyleSheet } from 'react-native';
import SwitchButton from './components/switchButton';
import { HIGHLIGHT_COLOR, DEFAULT_BUTTON_COLOR } from './constants';
import DocumentPicker from 'react-native-document-picker';

import PatchSwitch from './components/patchSwitcher';

function switchBtnColor(indicator) {
  return indicator ? HIGHLIGHT_COLOR : DEFAULT_BUTTON_COLOR
}

async function selectRythmFile(stateSetter, statusSetter) {
  try {
    const res = await DocumentPicker.pick({
      type: [DocumentPicker.types.zip],
    });
    stateSetter(res)
    statusSetter("Rythm: " + res.name)
    console.log(
      res.uri,
      res.type, // mime type
      res.name,
      res.size
    );
  } catch (err) {
    if (DocumentPicker.isCancel(err)) {
      // User cancelled the picker, exit any dialogs or menus and move on
    } else {
      throw err;
    }
  }
}

const PocketDrummerApp = () => {
  const [beatIsRunning, isRunning] = useState(0);
  const [useIntro, setUseIntro] = useState(true);
  const [toEnd, setToEnd] = useState(0);
  const [fill1, setFill1] = useState(0);
  const [fill2, setFill2] = useState(0);
  const [variation, setVariation] = useState(0);
  const [rythmFile, setRythmFile] = useState();
  const [status, setStatus] = useState("No file selected")
  let [player, setPlayer] = useState(new PatchSwitch({
    fill1: { setter: setFill1, value: fill1 },
    fill2: { setter: setFill2, value: fill2 },
    end: { setter: setToEnd, value: toEnd },
    startStop: { setter: isRunning, value: beatIsRunning },
    intro: { setter: setUseIntro, value: useIntro },
    rythm: {setter: null, value: rythmFile},
    status: {setter: setStatus, value: status},
    variation: variation
  }))

  player.uiprops.intro.value = useIntro
  player.uiprops.rythm.value = rythmFile
  player.uiprops.variation = variation
  console.log("RYTHMFILE", rythmFile)

  return (
    <View style={{ ...styles.container }}>
      <View style={{ ...styles.rowContainer }}>
        <View style={{ ...styles.buttonContainer }}>
          <SwitchButton title="Select beat" onPress={() => selectRythmFile(setRythmFile, setStatus)} />
        </View>
      </View>
      <View style={{ ...styles.rowContainer }}>
        <Text style={{color: '#86c232'}}>{status}</Text>
      </View>

      <View style={{ ...styles.rowContainer }}>
        <View style={{ ...styles.buttonContainer }}>
          <SwitchButton title={beatIsRunning ? "Stop" : "Start"} onPress={() => {
            isRunning(!beatIsRunning)
            if (!beatIsRunning) {
              console.log("Playing song!")
              player.start()

            } else {
              player.stop()
            }
          }} />
        </View>
      </View>

      <View style={{ ...styles.rowContainer }}>
        <View style={{ ...styles.buttonContainer }}>
          <SwitchButton title="Intro" style={{ backgroundColor: switchBtnColor(useIntro) }}
            onPress={() => {
              setUseIntro(!useIntro)
            }
            } />
        </View>
        <View style={{ ...styles.buttonContainer }}>
          <SwitchButton title="End" style={{ backgroundColor: switchBtnColor(toEnd) }}
            onPress={() => {
              setToEnd(!toEnd)
              player.end()
            }} />
        </View>
      </View>

      <View style={{ ...styles.rowContainer }}>
        <View style={{ ...styles.buttonContainer }}>
          <SwitchButton title="Fill 1" style={{ backgroundColor: switchBtnColor(fill1) }}
            onPress={() => {
              setFill1(!fill1)
              player.fill(0)
            }} />
        </View>
        <View style={{ ...styles.buttonContainer }}>
          <SwitchButton title="Fill 2" style={{ backgroundColor: switchBtnColor(fill2) }}
            onPress={() => {
              setFill2(!fill2)
              player.fill(1)
            }} />
        </View>
      </View>
 
      <View style={{ ...styles.rowContainer }}>
        <View style={{ ...styles.buttonContainer }}>
          <SwitchButton title="Var 1" style={{ backgroundColor: switchBtnColor(variation === 0) }}
            onPress={() => setVariation(0)} />
        </View>
        <View style={{ ...styles.buttonContainer }}>
          <SwitchButton title="Var 2" style={{ backgroundColor: switchBtnColor(variation === 1) }}
            onPress={() => setVariation(1)} />
        </View>
      </View>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#222629',
  },
  rowContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonContainer: {
    flex: 1,
    padding: 10,
  }
})

export default PocketDrummerApp;
