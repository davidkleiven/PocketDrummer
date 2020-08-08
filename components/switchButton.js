import React from 'react';
import {View, Text, TouchableOpacity, StyleSheet} from 'react-native';

const SwitchButton = props => {
    return (
        <View style={{...styles.button, ...props.style}}>
        <TouchableOpacity onPress={props.onPress}>
                <Text style={{...styles.text}}>{props.title}</Text>
        </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    button: {
        flex: 1,
        backgroundColor: '#474b4f',
        paddingLeft: 10,
        paddingRight: 10,
        paddingTop: 2,
        paddingBottom: 2,
        justifyContent: 'center',
        alignItems: 'center',
    },
    text: {
        color: '#86c232'
    }
}
)

export default SwitchButton;