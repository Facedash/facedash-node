var _ = require('underscore');
module.exports = {
  BuildInfoArray : function(FBdata, field){
    var result = [];
    var type = null;
    _.each(FBdata, function(obj){ 
      if(obj[field]){
        type = obj[field];
        return;
      }; 
    });

    if(typeof(type) === 'string'){
      return _.chain(FBdata).pluck(field).compact().value();
    }
    else if(Array.isArray(type)){
      _.each(FBdata, function(obj){
        _.each(obj[field], function(item){
          // console.log(item);
          result.push(item['name']);
        });
      });
      return result;
    }
    else{
      return _.chain(FBdata).map(function(obj){if(obj[field]) return obj[field]['name']}).compact().value()
    }
  },

  compareInfo : function(FBdata, field, user){
    var infoArray = this.BuildInfoArray(FBdata, field);
    var obj = {};

    obj.totalCount = _.size(infoArray);
    obj.count = _.filter(infoArray, function(item){ return item === user[field]; }).length;
    obj.accuracy = (_.size(infoArray) / user.friendsCount) * 100;
    obj.percentage = (obj.count / obj.totalCount) * 100;

    // obj {totalCount: array.length, sameCount: XXX}
    return obj;
  },

  breakDownInfo : function(FBdata, field, user){
    var infoArray = this.BuildInfoArray(FBdata, field);
    var count = 0;

    var obj = {
      breakdown: {}
    };

    _.each(infoArray, function(item){
      (!obj.breakdown[item]) ? obj.breakdown[item] = [1] : obj.breakdown[item][0]++;
      count++;
    });

    // Percentage per relationship status
    _.each(obj.breakdown, function(value, key){
      obj.breakdown[key].push((value / count) * 100);
    });
    obj.count = count;
    obj.accuracy = (count / user.friendsCount) *100;
    // console.log(obj);
    return obj;
  },

  AverageAge : function(FBdata, user){
    var infoArray = this.BuildInfoArray(FBdata, 'birthday');
    
    var obj = {};
    var year = new Date().getFullYear();

    obj.count = _.chain(infoArray)
                  .reject(function(item){return item.length <= 5})
                  .map(function(item){return parseInt(item.substr(-4))})
                  .value()
                  .length;

    obj.avgYear = Math.round((_.chain(infoArray)
                  .reject(function(item){return item.length <= 5})
                  .map(function(item){return parseInt(item.substr(-4))})
                  .reduce(function(memo, num){ return memo + num }, 0)
                  .value()) / obj.count);

    obj.avgAge = year - obj.avgYear;
    obj.accuracy = Math.floor((obj.count / user.friendsCount)* 100);
    // console.log(obj);
    return obj;
  }
};