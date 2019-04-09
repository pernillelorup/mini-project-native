import React, { Component } from 'react';
import { Text, ScrollView, View, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import { Constants, Location, MapView, Permissions } from 'expo';
import { Header } from 'react-native-elements';
import Login from './Login.js';
import {createStackNavigator} from 'react-navigation';

// ngrok http 4000 for at få url til nedenunder.
//const SERVER_URL = "http://28aa4019.ngrok.io";
const SERVER_URL = "http://fd90bff5.ngrok.io";

const Touchable = (props) => (
  <TouchableOpacity style={styles.button} onPressButton={props.onPressButton}>
    <Text style={styles.buttonText}>{props.title}</Text>
  </TouchableOpacity>)

export default class App extends Component {
  static navigationOptions = { title: ' ' };
  constructor(props) {
    super(props);
    console.ignoredYellowBox = ['Warning: View.propTypes'];
    this.state = {
      latitude: null,
      longitude: null,
      errorMessage: null,
      allowedArea: [],
      users: [],
      serverIsUp: false,
      statusBarHeight: Constants.statusBarHeight - 1
    };
  }

  async componentDidMount() {
    try {
      const res = await fetch(`${SERVER_URL}/geoapi/allowedarea`).then(res => res.json());
      const blogs = await fetch(`${SERVER_URL}/api/blogs`).then(res => res.json());
      this.setState({ allowedArea: res.coordinates, blogpos: blogs[0], serverIsUp: true });
    } catch (err) {
      this.setState({ serverIsUp: false });
    }
    //Hack to ensure the showsMyLocationButton is shown initially. Idea is to force a repaint
    setTimeout(() => this.setState({ statusBarHeight: Constants.statusBarHeight }), 500);
    this._getLocationAsync();
  }

  _getLocationAsync = async () => {
    let { status } = await Permissions.askAsync(Permissions.LOCATION);
    if (status !== 'granted') {
      this.setState({
        errorMessage: 'Permission to access location was denied',
      });
    }
    let location = await Location.getCurrentPositionAsync({ enableHighAccuracy: true });
    this.setState(
      {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        region: {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        }
      });
  };

  onPress = (event) => {
    const coordinate = event.nativeEvent.coordinate;
    const pos = { coordinates: [coordinate.longitude, coordinate.latitude] };

    console.log("Location for press: " + JSON.stringify(pos));
    fetch(`${SERVER_URL}/api`, {
      method: "post",
      body: JSON.stringify(pos),
      headers: new Headers({
        'Content-Type': 'application/json'
      })
    })
      .then(res => res.json())
      .then(res => {
        this.setState({ status: res.msg });
        setTimeout(() => this.setState({ status: "- - - - - - - - - - - - - - - - - - - -" }), 2000);
      }).catch(err => {
        Alert.alert("Error", "Server could not be reached")
        this.setState({ serverIsUp: false });
      })
  }

  onCenterGameArea = () => {
    //Hardcoded, should be calculated as center of polygon received from server
    const latitude = 55.777055745928664;
    const longitude = 12.55897432565689;
    this.refs.map.animateToRegion({
      latitude,
      longitude,
      latitudeDelta: 0.002,
      longitudeDelta: 0.04,
    }, 1000);
  }

  onPressButton = async (realData) => {
    let pos;
    await this._getLocationAsync();
    if (realData) {
      pos = { coordinates: [this.state.longitude, this.state.latitude] };
    }
    try {
      const res = await fetch(`${SERVER_URL}/api/users`, {
        method: "post", body: JSON.stringify(pos), headers: new Headers({ 'Content-Type': 'application/json' })
      }).then(res => res.json());
      this.setState({ status: res.msg });
      setTimeout(() => this.setState({ status: "- - - - - - - - - - - - - - - - - - - -" }), 3000);
    } catch (err) {
      Alert.alert("Error", "Server could not be reached")
      this.setState({ serverIsUp: false });
    }
  }

  render() {
    if (!this.state.region) {
      return <View style={{
        flex: 1, flexDirection: "row", justifyContent: 'center',
        alignItems: "center", paddingTop: this.state.statusBarHeight
      }}>
        <Text style={{ fontSize: 35 }}>... Fetching data</Text></View>
    }
    const info = this.state.serverIsUp ? this.state.status : " Server is not up";
    //const {navigate} = this.props.navigation;
    return (
      <View style={{ flex: 1, paddingTop: this.state.statusBarHeight }}>
        <Header
          rightComponent={{
            icon: 'home',
            placement: 'center',
            color: 'white',
            //onPress: () => navigate('login'),
            //onPress: () => this.props.navigation.navigate("login"),
            title: "Login"
          }}
          containerStyle={{
            backgroundColor: 'black',
            justifyContent: 'space-evenly',
          }}
        />
        <MapView
          ref="map"
          provider={"google"}
          style={{ flex: 14 }}
          onPress={this.onPress}
          mapType="standard"
          showsScale={true}
          showsMyLocationButton={true}
          region={this.state.region}
        >
          {this.state.serverIsUp &&
            <MapView.Polygon coordinates={this.state.allowedArea}
              strokeWidth={1}
              onPress={this.onPress}
              fillColor="rgba(128, 153, 177, 0.5)" />
          }
          <MapView.Marker
            coordinate={{ longitude: this.state.longitude, latitude: this.state.latitude }}
          />

        </MapView>
        <Touchable onPressButton={() => navigate('login')} title="Go to login page" />
        <Text style={{ flex: 1, textAlign: "center", fontWeight: "bold" }}>
          Your position (lat,long): {this.state.latitude}, {this.state.longitude}
        </Text>
        <Text style={{ flex: 1, textAlign: "center" }}>{info}</Text>

      </View>
    );
  }
}

//export default App = () => <RouteStack style={{ fontFamily: 'Courier', marginTop: Platform.OS === 'ios' ? 0 : Constants.statusBarHeight / 2 }} />

const RouteStack = createStackNavigator({
    Home: { screen: App },
    login: { screen: Login },
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: Constants.statusBarHeight,
    backgroundColor: '#ecf0f1',
  },
  paragraph: {
    margin: 24,
    fontSize: 18,
    textAlign: 'center',
  },
});