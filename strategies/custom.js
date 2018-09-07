// This is a basic example strategy for Gekko.
// For more information on everything please refer
// to this document:
//
// https://gekko.wizb.it/docs/strategies/creating_a_strategy.html
//
// The example below is pretty bad investment advice: on every new candle there is
// a 10% chance it will recommend to change your position (to either
// long or short).

var log = require('../core/log');

// Let's create our own strat
var strat = {};

var RSI = require('./indicators/RSI.js');

var lastprice;

// Prepare everything our method needs
strat.init = function() {
  this.input = 'candle';
  this.currentTrend = 'init';
  this.requiredHistory = 20;

  var mymaxfastsettings = {
    optInTimePeriod:10
  }
  var myminfastsettings = {
    optInTimePeriod:10
  }

  this.addTalibIndicator('mymaxfast','max',mymaxfastsettings);
  this.addTalibIndicator('myminfast','min',myminfastsettings);

  var myrsisettings = {
    optInTimePeriod:14
  }

  this.addTalibIndicator('myrsi', 'rsi', myrsisettings);
}

// What happens on every new candle?
strat.update = function(candle) {
}

// For debugging purposes.
strat.log = function() {
}

// Based on the newly calculated
// information, check if we should
// update or not.
strat.check = function(candle) {

  var price = candle.close;
  var maxifast = this.talibIndicators.mymaxfast.result.outReal;
  var minifast = this.talibIndicators.myminfast.result.outReal;

  var rsiVal = this.talibIndicators.myrsi.result.outReal;

  if(this.currentTrend === 'init' ) {

    if(price >= maxifast && price != lastprice && rsiVal <= 40){
      this.currentTrend = 'longfast';
      this.advice('long');
      log.debug('FastBought@', price);
      log.debug(rsiVal)
      lastprice = price;

    }
  }
  if(this.currentTrend === 'longfast'){

    if(price <= minifast){
      this.currentTrend = 'init';
      this.advice('short');
      log.debug('Sold@', price);
    } else {
      if(price > 1.05*lastprice){
        lastprice = 1.05*lastprice;
      }
      if(price < lastprice*0.95){
        this.currentTrend = 'init';
        this.advice('short');
        log.debug('StopSold@', price);
      }
    }
  }
}


module.exports = strat;
