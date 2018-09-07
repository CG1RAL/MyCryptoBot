var log = require('../core/log');

// Let's create our own strat
var strat = {};

var RSI = require('./indicators/RSI.js');

var lastprice;

var lastrsi = 100;
var laststochD = 0;
var laststochK = 0;

// Prepare everything our method needs
strat.init = function() {
  this.input = 'candle';
  this.currentTrend = 'init';
  this.requiredHistory = 20;

  var mystochsettings = {
    optInTimePeriod:14,
    optInFastK_Period:5,
    optInFastD_Period:3,
    optInFastD_MAType:0
  }

  this.addTalibIndicator('mystoch', 'stochrsi', mystochsettings);

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

  var stoch = this.talibIndicators.mystoch.result;
  var stochK = stoch.outFastK;
  var stochD = stoch.outFastD;

  var rsiVal = this.talibIndicators.myrsi.result.outReal;

  if(this.currentTrend === 'init' ) {

    if(lastrsi < 30 && stochK > stochD && laststochK < laststochD && laststochD < 20){
      this.currentTrend = 'long';
      this.advice('long');
      log.debug('Bought@', price);
      lastprice = price;
    }
  }

  lastrsi = rsiVal;
  laststochD = stochD;
  laststochK = stochK;

  if(this.currentTrend === 'long'){

    if((stochK <= stochD && stochK > 80) || rsiVal> 50){
      this.currentTrend = 'init';
      this.advice('short');
      log.debug('Sold@', price);
    } else {
      if(price > 1.01*lastprice){
        lastprice = 1.01*lastprice;
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
