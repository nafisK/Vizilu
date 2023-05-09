import { useEffect, useState } from 'react'
import { StatusBar } from 'expo-status-bar'
import { StyleSheet, Text, View, Button, Image } from 'react-native'
import frames from './components/frames'
import { Accelerometer } from 'expo-sensors'
import * as ScreenOrientation from 'expo-screen-orientation'

export default function App() {
  const [imageIndex, setImageIndex] = useState(0)
  const [{ x, y, z }, setGyroData] = useState({ x: 0, y: 0, z: 0 })
  const [tiltAngleCurrent, setTiltAngleCurrent] = useState(0)
  const [tiltAnglePrevious, setTiltAnglePrevious] = useState(0)

  // set screen orientation to landscape
  async function lockLandscapeOrientation() {
    await ScreenOrientation.lockAsync(
      ScreenOrientation.OrientationLock.LANDSCAPE_RIGHT
    )
  }

  // lock orientation and set accelerometer update interval, and subscribe to accelerometer data
  useEffect(() => {
    lockLandscapeOrientation()
    const subscription = Accelerometer.addListener(handleAccelerometerData)
    // change speed of accelerometer data updates
    Accelerometer.setUpdateInterval(500)
    return () => subscription && subscription.remove()
  }, [])

  // handle accelerometer math and set tilt angle
  const handleAccelerometerData = data => {
    // update the gyro data
    setGyroData(data)

    // round the accelerometer data
    const x = data.x.toFixed(4)
    const y = data.y.toFixed(4)
    const z = data.z.toFixed(4)

    // calculate the tilt angle
    const tiltAngle = Math.atan(y) * (180 / Math.PI)

    // set the tilt angle
    if (
      Math.abs(z) >= 0.9 &&
      Math.abs(z) <= 1.1 &&
      Math.abs(x) >= 0 &&
      Math.abs(x) <= 0.1
    ) {
      console.log(
        'Screen is horizontal with tilt angle:',
        tiltAngle.toFixed(1),
        'degrees'
      )
      setTiltAngleCurrent(tiltAngle)

      // Map the tilt angle to the image index and update it
      const newIndex = mapTiltAngleToImageIndex(tiltAngle)
      setImageIndex(newIndex)
    }
  }

  // reset tilt angle when button is pressed
  const resetTiltAngle = () => {
    setTiltAnglePrevious(tiltAngleCurrent)
    setTiltAngleCurrent()
    tiltAnglePrevious !== tiltAngleCurrent && setTiltAngleCurrent(0)
  }

  // map tilt angle to image index
  const mapTiltAngleToImageIndex = angle => {
    const minAngle = -25
    const maxAngle = 25
    const minIndex = 0
    const maxIndex = 71

    // Clamp the angle within the min and max range
    const clampedAngle = Math.min(Math.max(angle, minAngle), maxAngle)

    // Map the clamped angle to the image index range
    const mappedIndex = Math.round(
      ((clampedAngle - minAngle) / (maxAngle - minAngle)) *
        (maxIndex - minIndex) +
        minIndex
    )

    return mappedIndex
  }

  return (
    <View style={styles.container}>
      <Image source={frames[imageIndex]} style={styles.image} />
      <Text>
        x: {x.toFixed(2)}, y: {y.toFixed(2)}, z: {z.toFixed(2)}
      </Text>
      <Text>Adjusted tilt angle: {tiltAngleCurrent.toFixed(2)} degrees</Text>
      {/* <Button title='Reset Tilt Angle' onPress={resetTiltAngle} /> */}
      <StatusBar style='auto' />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  image: {
    margin: 0,
    padding: 0,
    // width: '70%',
    height: '80%',
    resizeMode: 'contain',
    marginBottom: 20,
  },
})
