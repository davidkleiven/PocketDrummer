import React from 'react';
import {View, Text, TouchableOpacity, StyleSheet} from 'react-native';
import { TEXT_COLOR } from '../constants';

const SwitchButton = props => {
    return (
        <TouchableOpacity onPress={props.onPress} style={{...styles.button, ...props.style}}>
                <Text style={{...styles.text}}>{props.title}</Text>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    button: {
        flex: 1,
        backgroundColor: '#474b4f',
        justifyContent: 'center',
        alignItems: 'center',
    },
    text: {
        color: TEXT_COLOR
    }
}
)

export default SwitchButton;