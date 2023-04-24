const EXCHANGE_RATE_URL = "https://api.exchangerate.host/latest";
export class State {
  accountBalance: number;
  baseCurrency: string;
  lotSize: number;
  pair: string;
  riskPercentage: number;
  stopLoss: number;

  // TODO: add properties for current ask prices for all the pairs and store them
  // on the state object with some sort of TTL?
  constructor({
    accountBalance = 0,
    baseCurrency = "",
    lotSize = 0,
    pair = "",
    riskPercentage = 0,
    stopLoss = 0,
  } = {}) {
    this.accountBalance = accountBalance;
    this.baseCurrency = baseCurrency;
    this.lotSize = lotSize;
    this.pair = pair;
    this.riskPercentage = riskPercentage;
    this.stopLoss = stopLoss;
  }
}

/*
 * dollar_amount_to_risk = balance * (risk_percentage/100)
 * value_per_pip = dollar_amount_to_risk / stop_loss
 * units = value_per_pip * pip_value_ratio
 *
 */
export const calculate = (state: State): State => {
  fetchExchangeRates({ baseCurrency: state.baseCurrency, pair: state.pair });
  if (isAnythingUnset(state)) {
    state.lotSize = 0;
    return state;
  }
  const { accountBalance, baseCurrency, pair, riskPercentage, stopLoss } =
    state;
  const dollarAmountToRisk = (accountBalance * riskPercentage) / 100;
  const valuePerPip = dollarAmountToRisk / stopLoss;
  const units = valuePerPip * pipValueRatio({ baseCurrency, pair });

  state.lotSize = units;
  return state;
};

const isAnythingUnset = (state: State): boolean => {
  return (
    state.accountBalance === 0 ||
    state.baseCurrency === "" ||
    state.pair === "" ||
    state.riskPercentage === 0 ||
    state.stopLoss === 0
  );
};

type pipValueRatioInput = {
  baseCurrency: string;
  pair: string;
};
const pipValueRatio = (_input: pipValueRatioInput): number => {
  // TODO: calculate the pip value ratio based on the current ask price of the pair and the
  // base currency
  return 1;
};

const fetchExchangeRates = (input: pipValueRatioInput) => {
  const { bottom } = splitPair(input.pair);
  const requestURL = `${EXCHANGE_RATE_URL}?base=${input.baseCurrency}&symbols=${bottom}`;
  const request = new XMLHttpRequest();
  request.open("GET", requestURL);
  request.responseType = "json";
  request.send();

  request.onload = function () {
    const response = request.response;
    console.log(response);
  };
};

/*
 * Turns GBPJPY into { top: 'GBP', bottom: 'JPY' }
 */
const splitPair = (pair: string) => {
  return {
    top: pair.substring(0, 3),
    bottom: pair.substring(3),
  };
};
