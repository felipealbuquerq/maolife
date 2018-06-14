import React, { Component } from 'react';

import {
  View,
  FlatList,
  Text as SystemText,
  Button as SystemButton,
} from 'react-native';

import {
  Container, Content, Icon, Fab,
  List, ListItem, Left, Right, Text, Separator,
} from 'native-base';

import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

import actions from './actions/userAction';
import Constant from './Constant';
import RecordChart from './RecordChart';
import ShareDialog from './ShareDialog';
import I18n from './i18n/i18n';

const moment = require('moment');

const baselineNum = 15;

function extractPetInfo(petID, pets) {
  if (petID && pets && pets.hasOwnProperty(petID)) {
    return { petID, ...pets[petID] };
  }

  return {};
}

const MyTitle = ({ navigation, pets }) => {
  const { petID } = navigation.state.params;
  let pet = null;
  if (pets[petID]) {
    pet = pets[petID];
  }
  return (
    <SystemText>
      {(pet && pet.name) ? pet.name : null}
    </SystemText>
  );
};
const MyConnectedTitle = connect(state => ({ pets: state.pets }))(MyTitle);

class PetDetail extends Component {
  static navigationOptions = ({ navigation }) => ({
    headerTitle: (
      <MyConnectedTitle
        navigation={navigation}
      />
    ),
    // headerBackTitle: '',
    headerRight: (
      <SystemButton
        onPress={() => navigation.navigate('Measure', {
          petID: navigation.state.params.petID,
        })}
        title={I18n.t('Measure')}
      />
    ),
  });

  constructor(props) {
    super(props);

    this.state = {
      active: false,
      showShareDialog: false,
    };
  }

  onSave = (authID) => {
    this.props.actions.addNewOwner(this.props.navigation.state.params.petID, authID);

    this.setState({ showShareDialog: false });
  }

  onCancel = () => {
    this.setState({ showShareDialog: false });
  }

  eachRowItem = (pet, time) => {
    let prefixToday = '';
    if (moment(time * 1000).isSame(moment(), 'day')) {
      prefixToday = ', Today';
    }
    let mode = 'rest';
    if (pet.breathRecord[time].mode === Constant.MODE_SLEEP) {
      mode = 'sleep';
    }
    const timeText = `${moment(time * 1000).format('YYYY-MM-DD HH:mm') + prefixToday}`;
    // console.log(`time:${timeText}`);
    const modeText = `${I18n.t(mode)}`;
    const countText = `${pet.breathRecord[time].breathRate}`;

    return (
      <ListItem
        onPress={() => {
        this.props.navigation.navigate('EditRecord', {
          petID: pet.petID,
          recordTime: time,
        });
      }}
      >
        <View style={{ alignItems: 'flex-start' }}>
          <View>
            <Text>
              {timeText}
            </Text>
          </View>
          <View style={{ flexDirection: 'row' }}>
            <Text style={{ width: 210 }}>
              {modeText}
            </Text>
            <Text>
              {countText}
            </Text>
          </View>
        </View>

      </ListItem>
    );
  }

  calRegion(modeList, numOfBaseline) {
    const count = modeList.length;
    let headAvg = 0;
    let tailAvg = 0;
    if (count > numOfBaseline) {
      let total = 0;
      for (let i = 0; i < numOfBaseline; i += 1) {
        total += modeList[i].y;
      }
      headAvg = (total / numOfBaseline).toFixed(1);

      total = 0;
      for (let i = 0; i < numOfBaseline; i += 1) {
        total += modeList[count - 1 - i].y;
      }
      tailAvg = (total / numOfBaseline).toFixed(1);
    }

    return { headAvg, tailAvg };
  }

  // TODO: use info = {sleep:{}, rest:{}} to avoid similar naming
  calculateStats(breathRecord, recordTimeList) {
    const stats = {
      rest: {
        data: [],
        total: 0,
        avg: 0,
        headAvg: 0,
        tailAvg: 0,
      },
      sleep: {
        data: [],
        total: 0,
        avg: 0,
        headAvg: 0,
        tailAvg: 0,
      },
      mixAvg: 0,
    };

    if (breathRecord) {
      for (const key of recordTimeList) {
        const record = breathRecord[key];
        let target = null;
        if (record.mode === Constant.MODE_REST) {
          target = stats.rest;
        } else if (record.mode === Constant.MODE_SLEEP) {
          target = stats.sleep;
        }

        target.data.push({
          x: new Date(key * 1000),
          y: record.breathRate,
        });
        target.total += record.breathRate;
      }
    }


    const countAll = stats.rest.data.length + stats.sleep.data.length;
    stats.rest.avg = stats.rest.data.length ? (stats.rest.total / stats.rest.data.length) : 0;
    stats.sleep.avg = stats.sleep.data.length ? (stats.sleep.total / stats.sleep.data.length) : 0;
    stats.mixAvg = countAll ? (stats.rest.total + stats.sleep.total) / countAll : 0;

    stats.rest = { ...stats.rest, ...this.calRegion(stats.rest.data, baselineNum) };
    stats.sleep = { ...stats.sleep, ...this.calRegion(stats.sleep.data, baselineNum) };
    return stats;
  }

  naviToEditPet(pet) {
    // Fetch each owner's displayName
    if (pet.owners) {
      this.props.actions.fetchOwnerData(pet.owners);
    }

    this.props.navigation.navigate('EditPet', {
      title: '',
      pet,
    });
  }

  keyExtractor = item => item;

  render() {
    const { pets, navigation } = this.props;
    const { petID } = navigation.state.params;
    const pet = extractPetInfo(petID, pets);

    if (this.state.showShareDialog) {
      return <ShareDialog onSave={this.onSave} onCancel={this.onCancel} />;
    }

    let recordTimeList = [];
    let stats = null;
    if (pet.hasOwnProperty('breathRecord')) {
      const keys = Object.keys(pet.breathRecord);

      keys.sort((a, b) => b - a);

      recordTimeList = keys;

      stats = this.calculateStats(pet.breathRecord, recordTimeList);
    }

    // fab:
    // https://github.com/GeekyAnts/NativeBase-KitchenSink/blob/master/js/components/fab/basic.js
    // https://github.com/GeekyAnts/NativeBase/issues/372
    // fab should be outside content
    const firstText = I18n.t('first');
    const lastText = I18n.t('last');
    const avgText = I18n.t('AVG');
    return (
      <Container>
        <Content>
          <List enableemptysections style={{ backgroundColor: 'white' }}>
            <ListItem
              onPress={() => this.naviToEditPet(pet)}
            >
              <Left>
                <Text>{I18n.t('Edit')}</Text>
              </Left>
              <Right>
                <Icon name="arrow-forward" />
              </Right>
            </ListItem>
          </List>
          <Separator bordered>
            <Text>{I18n.t('Stats & Chart')}</Text>
          </Separator>
          <View>
            <ListItem>
              <Text style={{ color: '#FF6347' }}>{stats ? `${I18n.t('Rest CNT')}:${stats.rest.data.length}, ${firstText}${baselineNum}${avgText}:${stats.rest.headAvg}, ${lastText}${baselineNum}${avgText}:${stats.rest.tailAvg}` : ''}</Text>
            </ListItem>
            <ListItem>
              <Text style={{ color: 'blue' }}>{stats ? `${I18n.t('Sleep CNT')}:${stats.sleep.data.length}, ${firstText}${baselineNum}${avgText}:${stats.sleep.headAvg}, ${lastText}${baselineNum}${avgText}:${stats.sleep.tailAvg}` : ''}</Text>
            </ListItem>
            {stats ? <RecordChart stats={stats} /> : null}
          </View>
          <Separator bordered>
            <Text>{I18n.t('Records (1: mode 2: # breaths per minute)')}</Text>
          </Separator>
          <View>
            <FlatList
              keyExtractor={this.keyExtractor}
              data={recordTimeList}
              renderItem={({ item }) => (
                this.eachRowItem(pet, item)
              )}
            />
          </View>
        </Content>
        <Fab
          active={this.state.active}
          direction="up"
          containerStyle={{}}
          style={{ backgroundColor: '#5067FF' }}
          position="bottomRight"
          onPress={() => {
            this.setState({ active: !this.state.active });
            this.setState({ showShareDialog: true });
          }}
        >
          <Icon name="share" />
        </Fab>
      </Container>
    );
  }
}

const mapStateToProps = state => ({
  pets: state.pets,
});

function mapDispatchToProps(dispatch) {
  return { actions: bindActionCreators(actions, dispatch) };
}

export default connect(mapStateToProps, mapDispatchToProps)(PetDetail);
