import React, {Component} from 'react'
import TextInput from './TextInput'
import BarChart from './BarChart'
import PieChart from './PieChart'
import TitleTextColor from './TitleTextColor'
import {frequency} from '../models/API'
import {generateColorPalette} from '../models/helpers'

export default class App extends Component {
  constructor(props) {
    super(props)
    this.state = {
      charFrequency : null,
      isBarChart: true,
      colors: null,
      titleText: null
    }
    // bind event handlers in the constructor so they are only bound once for every instance
    this._charFrequency = this._charFrequency.bind(this)
    this._getTitleText = this._getTitleText.bind(this)
    this._handleClick = this._handleClick.bind(this)
  }

  componentDidMount() {
     // Sync with Mongo DB on load
     frequency().then(obj => this._charFrequency(obj.data))

     // Sync with Mongo DB every 30secs
     const self = this
     setInterval(function() {
        frequency().then(obj => self._charFrequency(obj.data))
     }, 30000)

     this.setState({colors: generateColorPalette()})
  }

  _charFrequency(chars) {
     // return array of mapped objects
     let mapped = []
     for (let key in chars) {
        mapped.push({
           y: chars[key],
           label: `${key} (${chars[key]})`
        })
     }

     // sort by value and if values are equal sort by Character
     mapped = mapped.sort((a, b) => {
        if (a.y === b.y) {
           return a.label.charCodeAt(0) - b.label.charCodeAt(0)
        }
        return a.y - b.y
     })

     // once sorted the x value can be attached; Victory sorts by x
     mapped.forEach((e, i) => {
        e['x'] = i
        e['fill'] = this.state.colors[i]
     })
     this.setState({charFrequency: mapped})
  }

  _handleClick() {
    this.setState({isBarChart: !this.state.isBarChart})
  }

  _renderChart() {
    if(this.state.isBarChart) {
      return <BarChart {...this.state}/>
    } else {
      return <PieChart {...this.state}/>
    }
  }

  _getTitleText(titleText) {
    this.setState({titleText})
  }

  _displayTitleText(titleText) {
    if(titleText) {
      return <TitleTextColor {...this.state}/>
    } else {
      return <h1 className='text-center title'>Character Frequency</h1>
    }
  }

  render() {
    const {titleText, isBarChart, charFrequency} = this.state
    return (
      <div className="container">
        <div className="row">
          <div className="col-md-offset-2 col-md-8">
            {this._displayTitleText(titleText)}
            <TextInput
              setFrequency={this._charFrequency}
              getTitleText={this._getTitleText}
            />
            <button
              type="button"
              className="btn btn-success btnChart"
              onClick={this._handleClick}>
              {isBarChart ? "Pie Chart" : "Bar Chart"}
            </button>
          </div>
          {charFrequency ? this._renderChart() : <h3>Loading...</h3>}
        </div>
      </div>
    )
  }
}
