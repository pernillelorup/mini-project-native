import React, { Component } from 'react';
import { FormLabel, FormInput, FormValidationMessage } from 'react-native-elements'
import { Text, Platform, TouchableOpacity, ScrollView } from 'react-native';
import {createStackNavigator} from 'react-navigation';

const Touchable = (props) => (
    <TouchableOpacity style={styles.button} onPress={props.onPress}>
        <Text style={styles.buttonText}>{props.title}</Text>
    </TouchableOpacity>)

class Login extends Component {
    static navigationOptions = { title: ' ' };
    render() {
        const { navigate } = this.props.navigation;
        return (
            <ScrollView>
                <Text></Text>
                <Text></Text>
                <FormLabel>Username</FormLabel>
                <FormInput onChangeText={someFunction} />
                <FormValidationMessage>{'This field is required'}</FormValidationMessage>
                <FormLabel>Distance</FormLabel>
                <FormInput onChangeText={someFunction} />
                <FormValidationMessage>{'This field is required'}</FormValidationMessage>
                <Button onPress={() => {
                    Alert.alert('You tapped the button!');
                }} title='Login' />
                <Text></Text>
                <Touchable onPress={() => navigate('login')} title="Login" />
            </ScrollView>
        )
    }
}

export default Login = () => <RouteStack style={{ fontFamily: 'Courier', marginTop: Platform.OS === 'ios' ? 0 : Constants.statusBarHeight / 2 }} />

const RouteStack = createStackNavigator({
    Home: { screen: Login },
});
