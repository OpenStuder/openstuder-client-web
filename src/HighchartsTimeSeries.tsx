import * as React from 'react';
import * as Highcharts from 'highcharts';
import { ChartObject } from 'highcharts';

// noinspection TsLint
const Boost = require('highcharts/modules/boost');
Boost(Highcharts); // WebGL-backed rendering (https://www.highcharts.com/blog/tutorials/higcharts-boost-module/)

const slidingTimeWindowSec = 500;

type Data = {
    readonly timestamp: number,
    readonly value: number,
}

type Props = {
    readonly dataPoint: Data
}

class HighchartsTimeSeries extends React.Component<Props, {}> {

    private readonly renderToId = 'highcharts-container';
    // @ts-ignore
    private chart: ChartObject;
    /*
    constructor(props: Props) {
        super(props);
    }
    */
    public componentDidMount() {
        Highcharts.setOptions({
            global: {
                useUTC: false
            }
        });
        this.chart = Highcharts.chart(this.renderToId, {
            title: {
                text: 'Total power'
            },
            xAxis: {
                type: 'datetime'
            },
            yAxis: {
                min: 0,
                max: 2.5
            },
            series: [{
                name: '[kW]',
                data: [this.props.dataPoint]
            }]
        });
        requestAnimationFrame(this.redrawChart);
    }

    public componentDidUpdate() {
        const series = this.chart.series[0];
        const firstPoint = series.data[0];
        const shouldShift = series.data[0] ? firstPoint.x < Date.now() - slidingTimeWindowSec * 1000 : false;
        series.addPoint([this.props.dataPoint.timestamp, this.props.dataPoint.value], false, shouldShift, false);
    }

    public render() {
        return (
            <div id={this.renderToId}/>
        );
    }

    private redrawChart = () => {
        this.chart.redraw(false);
        requestAnimationFrame(this.redrawChart);
    }

}

export default HighchartsTimeSeries;