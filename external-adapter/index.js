const defiScoreData = require('./defi-score')
const utils = require('./utils')

exports.defiScore = (req, res) => {
  const protocol = req.body && req.body.data && req.body.data.protocol || 'compound'
  const asset = req.body && req.body.data && req.body.data.asset || 'dai'

  const score = getDefiScoreData().find(score => score.protocol === protocol && score.asset === asset)

  if (score) {
    // [openSourc, audited, verifyed, safe]
    let booleanValues = [0,0,0,0]
    switch (protocol) {
      case 'compound':
        // booleanValues = '1:1:0:0'
        booleanValues = [1,1,0,0]
        break;
      case 'dydx':
        // booleanValues = '1:1:0:0'
        booleanValues = [1,1,0,0]
        break;
      case 'fulcrum':
        // booleanValues = '1:1:1:0'
        booleanValues = [1,1,1,0]
        break;
      case 'nuo':
        // booleanValues = '1:0:0:0'
        booleanValues = [1,0,0,0]
        break;
      case 'ddex':
        // booleanValues = '1:1:0:0'
        booleanValues = [1,1,0,0]
        break;
      default:
        break;
    }

    const data = {
      jobRunID: req.body.id,
      data: utils.lpad(utils.pack(16, [...booleanValues, getRoundedMetric(score.metrics.score),getRoundedMetric(score.metrics.liquidityIndex),getRoundedMetric(score.metrics.collateralIndex)]), "0", 64),
      // data: `${booleanValues}:${getMetrics(score)}`,
      statusCode: 200
    }

    res.status(200).send(data)
  } else {
    const data = {
      jobRunID: req.body.id,
      data: {},
      statusCode: 500,
      error: "No data available"
    }

    res.status(500).send(data)
  }
}

function getMetrics(score) {
  return `${getRoundedMetric(score.metrics.score)}:${getRoundedMetric(score.metrics.liquidityIndex)}:${getRoundedMetric(score.metrics.liquidityIndex)}`
}

function getRoundedMetric(metric) {
  return Math.round(parseFloat(metric)*100)
}

function getDefiScoreData() {
  return JSON.parse(defiScoreData.data)
}
