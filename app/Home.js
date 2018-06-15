import React, { Component } from 'react';
import {
  Text,
  View,
} from 'react-native';
import { connect } from 'react-redux';

import CommonStyles from './styles/common';
import { connectDBtoCheckUser } from './actions/userAction';
import Login from './Login';
import MainScreen from './MainScreen';

class Home extends Component {
  constructor(props) {
    super(props);

    // Three ways to dispatch action
    // 1. bind action
    // 2. map dispatch
    // 3.  directly use dispatch
    this.props.dispatch(connectDBtoCheckUser());

    // initial actions in constructor vs in componentDidMount
    // https://discuss.reactjs.org/t/constructor-vs-componentwillmount-vs-componentdidmount/4287
    // Actually, the rule is: If your initialization depends upon the DOM, use componentDidMount, otherwise use constructor.
  }

  render() {
    const { userChecking, user } = this.props;
    if (userChecking) {
      return (
        <View style={CommonStyles.container}>
          <Text style={CommonStyles.welcome}>
            Loading...
          </Text>
        </View>
      );
    }
    // user should not be null due to the current default value
    if (user && user.KID) {
      return <MainScreen />;
    }
    return <Login />;
  }
}

function debugState(state) {
  return state.currentUser;
}

const mapStateToProps = state => ({
  user: debugState(state),
  userChecking: state.userChecking,
});

export default connect(mapStateToProps)(Home);
