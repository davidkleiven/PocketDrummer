import React, {useState, useEffect} from 'react';
import {View, Text, StyleSheet, TouchableOpacity} from 'react-native';
import {TEXT_COLOR, DEFAULT_BUTTON_COLOR} from '../constants';

let padToTwo = (number) => (number <= 9 ? `0${number}`:number);

function getMinutes(totalSeconds) {
    return Math.floor(totalSeconds / 60)
}

function getRemainingSeconds(totalSeconds) {
    return totalSeconds - 60*getMinutes(totalSeconds)
}

const StopWatch = props => {
    return (
        <TouchableOpacity onPress={props.onPress}>
            <Text style={{color: props.textColor()}}>{padToTwo(getMinutes(props.seconds)) + ':' + padToTwo(getRemainingSeconds(props.seconds))}</Text>
        </TouchableOpacity>
    )
}

let timer = null
export const useTimer = () => {
    const [seconds, setSeconds] = useState(0);
    const [timerOn, setTimerOn] = useState(false)
    const [active, setTimerActive] = useState(true)

    useEffect(() => {
        if (timerOn && active) {
            timer = setInterval(() => {
                setSeconds(seconds => seconds + 1);
                }, 1000);

        }
        return () => clearInterval(timer);
        }, [timerOn]);

    const stopWatchProps = {
        onPress: () => {
            setTimerActive(!active)
            setTimerOn(false)
        },
        textColor: () => {
            return active ? TEXT_COLOR : DEFAULT_BUTTON_COLOR
        },
        seconds: seconds
    }
    return [setSeconds, setTimerOn, stopWatchProps]
}

const styles = StyleSheet.create({
    text: {
        color: TEXT_COLOR
    }
}
)

export default StopWatch
