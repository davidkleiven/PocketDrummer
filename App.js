import React, { useState } from 'react';
import { Text, View, Button, StyleSheet } from 'react-native';
import SwitchButton from './components/switchButton';
import {HIGHLIGHT_COLOR, DEFAULT_BUTTON_COLOR} from './constants';

function switchBtnColor(indicator) {
  return indicator ? HIGHLIGHT_COLOR : DEFAULT_BUTTON_COLOR
}

const PocketDrummerApp = () => {
  const [beatIsRunning, isRunning] = useState(0);
  const [useIntro, setUseIntro] = useState(1);
  const [toEnd, setToEnd] = useState(0);
  const [fill1, setFill1] = useState(0);
  const [fill2, setFill2] = useState(0);
  const [var1, setVar1] = useState(1);
  const [_, setRythmFile] = useState("");

  return (
    <View style={{...styles.container}}>

<View style={{...styles.rowContainer}}>
        <View style={{...styles.buttonContainer}}>
          <SwitchButton title={beatIsRunning ? "Stop" : "Start"} onPress={() => isRunning(!beatIsRunning)}/>
        </View>
      </View>

      <View style={{...styles.rowContainer}}>
        <View style={{...styles.buttonContainer}}>
          <SwitchButton title="Intro" style={{backgroundColor: switchBtnColor(useIntro)}} 
            onPress={() => setUseIntro(!useIntro)}/>
        </View>
        <View style={{...styles.buttonContainer}}>
          <SwitchButton title="End" style={{backgroundColor: switchBtnColor(toEnd)}}
            onPress={() => setToEnd(!toEnd)}/>
        </View>
      </View>

      <View style={{...styles.rowContainer}}>
        <View style={{...styles.buttonContainer}}>
          <SwitchButton title="Fill 1" style={{backgroundColor: switchBtnColor(fill1)}} 
            onPress={() => setFill1(!fill1)}/>
        </View>
        <View style={{...styles.buttonContainer}}>
        <SwitchButton title="Fill 2" style={{backgroundColor: switchBtnColor(fill2)}} 
            onPress={() => setFill2(!fill2)}/>
        </View>
      </View>

      <View style={{...styles.rowContainer}}>
        <View style={{...styles.buttonContainer}}>
          <SwitchButton title="Var 1" style={{backgroundColor: switchBtnColor(var1)}}
            onPress={() => setVar1(!var1)}/>
        </View>
        <View style={{...styles.buttonContainer}}>
          <SwitchButton title="Var 2" style={{backgroundColor: switchBtnColor(!var1)}}
            onPress={() => setVar1(!var1)}/>
        </View>
      </View>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor:'#222629',
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
