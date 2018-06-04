import * as firebase from 'firebase';

/**
 * @param  {string} mode "sleep" or "rest"
 */
export function newBreathRecord(catID, breathRate, mode, recordTime) {
  return () => {
    const catPath = `cats/${catID}`;

    const newRecord = {};
    newRecord[recordTime] = { mode, breathRate };

    console.log('new record', newRecord);
    firebase.database().ref(catPath).child('breathRecord').update(newRecord)
      .then(() => {
        console.log('set new breath ok');
      })
      .catch((error) => {
        console.log('add new record failed,', error);
      });
  };
}

export function updateInfo(catID, info) {
  return () => {
    const catPath = `cats/${catID}`;

    console.log('new info', info);
    firebase.database().ref(catPath).update(info)
      .then(() => {
        console.log('update cat info ok');
      })
      .catch((error) => {
        console.log('update cat info failed,', error);
      });
  };
}

export function deleteBreathRecord(catID, recordTime) {
  return () => {
    const recordPath = `cats/${catID}/breathRecord/${recordTime}`;

    console.log('delete record', recordPath);
    firebase.database().ref(recordPath).remove()
      .then(() => {
        console.log('delete breath ok');
      })
      .catch((error) => {
        console.log('delete record failed,', error);
      });
  };
}
