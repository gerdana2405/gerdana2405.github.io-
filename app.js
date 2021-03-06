var app = angular.module("testing", []);

app.service('ItemService', function ($window) {

  const generateId = function (prefix) {
    return prefix + Math.floor(Math.random() * 100000);
  };

  const generateItemId = function () {
    return generateId('item_');
  };

  const generateCommentId = function () {
    return generateId('comment_');
  }

  let items= JSON.parse($window.localStorage.getItem('testingApp')) || [];

  const listeners = {
    change: []
  };

  const triggerEvent = function (event) {
    event = event || 'change';

    if (!listeners[event]) {
      return;
    }

    listeners[event].forEach(function (listener, event) {
      listener(event);
    })
  };

  const addListener = function (event, listener) {
    if (typeof event === 'function') {
      listener = event;
      event = 'change';
    }

    if (!listeners[event]) {
      listeners[event] = [];
    }

    listeners[event].push(listener);
  };

  const dataSave= function(){
    $window.localStorage.setItem("testingApp", JSON.stringify(items));
  };

  addListener('change', dataSave);

  return {
    getItems() {
      return items;
    },

    addNewItem(name) {
      if (!name) {
        return
      }

      items.push({
        name: name,
        id: generateItemId(),
        comments: []
      });

      triggerEvent('add:item');
      triggerEvent('change');
    },

    addNewComment(item, comment) {
      if (!item || !comment) {
        return;
      }

      item.comments.push({
        id: generateCommentId(),
        content: comment
      });

      triggerEvent('add:comment');
      triggerEvent('change');
    },

    removeItem(item) {
      if (!item) {
        return;
      }

      items = items.filter(function (itemToFilterOut) {
        return itemToFilterOut.id != item.id;
      });

      triggerEvent('remove:item');
      triggerEvent('change');
    },

    on(event, listener) {
      addListener(event, listener);
    },

    searchItemByName(name) {
       return items.find(function(element) {
        if (element.name == name) {
          return element.id;
        }
      })
    },
  }
});

app.controller("testingCtrl", function ($scope, ItemService) {

  $scope.commentsCount = {};

  var render = function () {
    $scope.items = ItemService.getItems();

    if (!$scope.currentItem) {
      $scope.currentItem = $scope.items[0] || [];
    }

    if ($scope.currentItem) {
      $scope.currentItemIndex = $scope.items.indexOf($scope.currentItem) || 0;
    }
  };

  ItemService.on('change', render)
  render();

  $scope.addItem = function (event) {

    const searchItemByName = ItemService.searchItemByName($scope.itemName);

    if (searchItemByName) {
      $scope.currentItem = searchItemByName;
    } else {
      ItemService.addNewItem($scope.itemName);
    }

    $scope.itemName = '';
  };

  $scope.addComment = function (event) {
    ItemService.addNewComment($scope.currentItem, $scope.newComment);
    $scope.newComment = '';
  };

  $scope.selectItem = function (item) {
    $scope.currentItem = item;
    $scope.currentItemIndex = $scope.items.indexOf($scope.currentItem);
  };

  $scope.removeItem = function (item) {
    if ($scope.currentItem.id == item.id) {
      $scope.currentItem = undefined;
    }

    ItemService.removeItem(item);
  };
});
