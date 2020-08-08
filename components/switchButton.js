import React from 'react';
import {View, Text, TouchableOpacity, StyleSheet} from 'react-native';

const SwitchButton = props => {
    return (
        <TouchableOpacity onPress={props.onPress}>
            <View style={{...styles.button, ...props.style}}>
                <Text style={{...styles.text}}>{props.title}</Text>
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    button: {
        backgroundColor: '#474b4f',
        padding: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    text: {
        color: '#86c232'
    }
}
)

export default SwitchButton;