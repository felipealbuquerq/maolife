import { ActionTypes } from '../actions/userAction';
import { combineReducers } from 'redux';
import _ from 'lodash';

// function updateCats(oldState, action){
//   let newState = _.cloneDeep(oldState);
//   let match = false;
//   for (let cat of newState) {
//     if (cat.catID == action.payload.catID) {
//       cat.catInfo = action.payload.catInfo;
//       match = true;
//       break;
//     }
//   }
//
//   if (!match) {
//     newState.push({catID:action.payload.catID, ...action.payload.catInfo});
//   }
//
//   return newState;
// }

export function cats(state = {}, action) {
  // const catID = action.payload.catID;
  console.log("in cats reducers");
  switch (action.type) {
    case ActionTypes.UPDATE_CAT_INFO:
      //insertOrUpdate action.payload.cat
      if (action.payload.catID) {
        // return Object.assign({}, state, {
        //   visibilityFilter: action.filter
        // })
        // assgin:one level shallow copy, so ... should be too?

        let newState = _.cloneDeep(state);

        // let newState = {...state};
        newState[action.payload.catID] = action.payload.catInfo;

        return newState;//updateCats(state, action);
      } else {
        return state;
      }
    default:
      return state;
  }
}

export function selectedCat(state = null, action) {
  switch (action.type) {
    case ActionTypes.NAVI_TO_CAT:
      return {id: action.payload.catID};
    case ActionTypes.LEAVE_CAT_DETAIL:
      return null; 
    default:
      return state;
  }
}

export const catsRoot = {
  cats, selectedCat,
}
