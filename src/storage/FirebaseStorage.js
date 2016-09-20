(function() {
  "use strict";

  function unwrapStorageSnapshot(storageSnapshot) {
    return {
      bytesTransferred: storageSnapshot.bytesTransferred,
      downloadURL: storageSnapshot.downloadURL,
      metadata: storageSnapshot.metadata,
      ref: storageSnapshot.ref,
      state: storageSnapshot.state,
      task: storageSnapshot.task,
      totalBytes: storageSnapshot.totalBytes
    };
  }

  function _$put(storageRef, file, $digestFn, $q) {
    var task = storageRef.put(file);

    return {
      $progress: function $progress(callback) {
        task.on('state_changed', function () {
          $digestFn(function () {
            callback.apply(null, [unwrapStorageSnapshot(task.snapshot)]);
          });
          return true;
        }, function () {}, function () {});
      },
      $error: function $error(callback) {
        task.on('state_changed', function () {}, function (err) {
          $digestFn(function () {
            callback.apply(null, [err]);
          });
          return true;
        }, function () {});
      },
      $complete: function $complete(callback) {
        task.on('state_changed', function () {}, function () {}, function () {
          $digestFn(function () {
            callback.apply(null, [unwrapStorageSnapshot(task.snapshot)]);
          });
          return true;
        });
      },
      $cancel: function $cancel() {
        return task.cancel();
      },
      $resume: function $resume() {
        return task.resume();
      },
      $pause: function $pause() {
        return task.pause();
      },
      then: function then() {
        return task.then();
      },
      catch: function _catch() {
        return task.catch();
      }
    };
  }

  function _$getDownloadURL(storageRef, $q) {
    return $q(function(resolve, reject) {
      storageRef.getDownloadURL()
        .then(function(url) {
          resolve(url);
        })
        .catch(function(err) {
          reject(err);
        });
    });
  }

  function isStorageRef(value) {
    value = value || {};
    return typeof value.put === 'function';
  }

  function _assertStorageRef(storageRef) {
    if (!isStorageRef(storageRef)) {
      throw new Error('$firebaseStorage expects a storage reference from firebase.storage().ref()');
    }
  }

  function _$delete(storageRef, $q) {
    return $q(function (resolve, reject) {
      storageRef.delete()
        .then(resolve)
        .catch(reject);
    });
  }

  function FirebaseStorage($firebaseUtils, $q) {

    var Storage = function Storage(storageRef) {
      _assertStorageRef(storageRef);
      return {
        $put: function $put(file) {
          return Storage.utils._$put(storageRef, file, $firebaseUtils.compile, $q);
        },
        $getDownloadURL: function $getDownloadURL() {
          return Storage.utils._$getDownloadURL(storageRef, $q);
        },
        $delete: function $delete() {
          return Storage.utils._$delete(storageRef, $q);
        }
      };
    };

    Storage.utils = {
      _unwrapStorageSnapshot: unwrapStorageSnapshot,
      _$put: _$put,
      _$getDownloadURL: _$getDownloadURL,
      _isStorageRef: isStorageRef,
      _assertStorageRef: _assertStorageRef,
      _$delete: _$delete
    };  
    
    return Storage;
  }  

  angular.module('firebase.storage')
    .factory('$firebaseStorage', ["$firebaseUtils", "$q", FirebaseStorage]);

})();
