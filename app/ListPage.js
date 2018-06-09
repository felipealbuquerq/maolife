import React, { Component } from 'react';
import {
  Button,
  TouchableOpacity,
  FlatList,
} from 'react-native';

import {
  Container,
  Content, // ~ ScrollView of react-native
  Card,
  CardItem,
  Body,
  Text,
} from 'native-base';

import { createStackNavigator, NavigationActions } from 'react-navigation';

import { connect } from 'react-redux';

import PetDetail from './PetDetail';
import EditPet from './EditPet';
import EditRecord from './EditRecord';
import Measure from './Measure';

class ListMain extends Component {
  static navigationOptions = ({ navigation }) => ({
    title: 'Pet List',
    headerRight: (
      <Button
        title="Add"
        onPress={() => navigation.navigate('EditPet', {
          title: 'New Pet',
        })}
      />
    ),
  });

  constructor(props) {
    super(props);

    this.state = {
      dataSource: [],
    };

    this.onButtonPress = this.onButtonPress.bind(this);
  }

  componentWillReceiveProps(newProps) {
    console.log('listpage componentWillReceiveProps');

    const { pets } = newProps;

    const petsArray = [];

    // instead "for in", prevent prototype chain
    Object.keys(pets).forEach((key) => {
      petsArray.push({ key, ...pets[key] });
    });

    this.setState({
      dataSource: petsArray,
    });
  }

  onButtonPress(rowData) {
    const { name } = rowData;
    const petID = rowData.key;
    // three ways to navigate
    // 1. navigation.navigate
    // 2. react navigation redux integration
    // 3. NavigationActions.navigate
    // https://v1.reactnavigation.org/docs/navigating-without-navigation-prop.html
    const naviAction = NavigationActions.navigate({
      routeName: 'PetDetail',
      params: { petID, name },
    });

    this.props.navigation.dispatch(naviAction);
  }

  render() {
    return (
      <Container>
        <Content>
          {/* <View style={{ flex: 1, paddingTop: 22 }}> */}
          <FlatList
            data={this.state.dataSource}
            renderItem={({ item }) => (
              <TouchableOpacity key={item.key} onPress={() => this.onButtonPress(item)}>
                <Card>
                  <CardItem header >
                    <Text>
                      {item.name}
                    </Text>
                  </CardItem>
                  <CardItem >
                    <Body>
                      <Text>
                        {item.age ? `age:${item.age}` : null}
                      </Text>
                    </Body>
                  </CardItem>
                </Card>
              </TouchableOpacity>
            )
          }
          />
          {/* </View> */}
        </Content>

      </Container>
    );
  }
}

const mapStateToProps = state => ({
  pets: state.pets,
});

const ListMainReduxState = connect(mapStateToProps)(ListMain);

export const ListPage = createStackNavigator({
  List: {
    screen: ListMainReduxState,
  },
  EditPet: {
    screen: EditPet,
  },
  EditRecord: {
    screen: EditRecord,
  },
  PetDetail: {
    screen: PetDetail,
  },
  Measure: {
    screen: Measure,
  },
});

// the below api usage is v1 of react navigation. if we still want to use it in v2, need change
// https://v1.reactnavigation.org/docs/redux-integration.html
// const ListPageWithNavState = ({ dispatch, nav }) => (
//   <ListPage navigation={navigationPropConstructor({ dispatch, state: nav })} />
// );
//
// const mapStateToPropsListPage = state => ({
//   nav: state.listNav,
// });

export default ListPage;
