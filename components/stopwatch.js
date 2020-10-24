import React, {useState, useEffect} from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {TEXT_COLOR} from '../constants';

let padToTwo = (number) => (number <= 9 ? `0${number}`:number);

function getMinutes(totalSeconds) {
    return Math.floor(totalSeconds / 60)
}

function getRemainingSeconds(totalSeconds) {
    return totalSeconds - 60*getMinutes(totalSeconds)
}

const StopWatch = props => {
    return (
            <Text style={{...styles.text, ...props.style}}>{padToTwo(getMinutes(props.seconds)) + ':' + padToTwo(getRemainingSeconds(props.seconds))}</Text>
    )
}

let timer = null
export const useTimer = () => {
    const [seconds, setSeconds] = useState(0);
    const [timerOn, setTimerOn] = useState(false)
    useEffect(() => {
        if (timerOn) {
            timer = setInterval(() => {
                setSeconds(seconds => seconds + 1);
              }, 1000);

        }
        return () => clearInterval(timer);
      }, [timerOn]);
    return [seconds, setSeconds, setTimerOn]
}

const styles = StyleSheet.create({
    text: {
        color: TEXT_COLOR
    }
}
)

export default StopWatch
