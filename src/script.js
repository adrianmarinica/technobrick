$(document).ready(function () {
    var manual = [];
    var autonomous = [];

    var red = 'rgb(196,40,27)';
    var green = 'rgb(75,151,74)';

    var redTransparent = 'rgba(196,40,27,0.2)';
    var greenTransparent = 'rgba(75,151,74,0.2)';

    var scatterDataMapper1 = function (item) {
        return {
            x: item['Lungimea masinii'] * item['Latimea masinii'],
            y: item['Iesiri Traseu']
        }
    };

    var scatterDataMapper2 = function (item) {
        return {
            x: item['Lungimea masinii'] * item['Latimea masinii'],
            y: timeMapper(item)
        }
    };

    var timeMapper = function (value) {
        var time = value['Timp parcurgere'];
        if (typeof time == 'string') {
            var timeUnits = time.split(':');
            return timeUnits[0] * 60 + parseInt(timeUnits[1], 10);
        } else {
            return 0;
        }
    };

    var incidentMapper = function (list) {
        var outs = 0, opposite = 0, knocks = 0, interventions = 0;
        for (var i = 0; i < list.length; i++) {
            outs += list[i]['Iesiri Traseu'];
            opposite += list[i]['Intrari sens opus'];
            knocks += list[i]['Ciocniri parcare'];
            interventions += list[i]['Nr. Interventii'];
        }
        return [
            (outs / list.length).toFixed(2),
            (opposite / list.length).toFixed(2),
            (knocks / list.length).toFixed(2),
            (interventions / list.length).toFixed(2)
        ];
    }

    $.when(
        $.getJSON('data/manual.json', function (result) {
            manual = result;
        }),
        $.getJSON('data/autonomous.json', function (result) {
            autonomous = result;
        })
    ).then(function () {
        Chart.defaults.global.defaultFontColor = 'rgb(23, 23, 23)';

        renderBarChart(manual, document.getElementById('bar-chart-manual'), 'Timp parcurgeri cu mașinile operate manual', red);
        renderBarChart(autonomous, document.getElementById('bar-chart-autonomous'), 'Timp parcurgeri cu mașinile operate autonom', green);
        renderPlotChart(manual, autonomous, scatterDataMapper1, document.getElementById('scatter-chart-surface-exits'), 'Suprafața mașinii vs Ieșiri traseu', null, 'cm²');
        renderPlotChart(manual, autonomous, scatterDataMapper2, document.getElementById('scatter-chart-surface-time'), 'Suprafața mașinii vs Timp parcurgere', 's', 'cm²');
        renderDoubleRadarChart(manual, autonomous, document.getElementById('radar-chart-incidents'), 'Incidente pe traseu (în medie)');
    });

    var renderBarChart = function (data, element, label, backgroundColor) {
        var barChartData = {
            labels: data.map(function (value) {
                return value['Nr'];
            }),
            datasets: [{
                label: '',
                backgroundColor: backgroundColor,
                borderWidth: 1,
                data: data.map(timeMapper)
            }]
        };


        var ctx = element.getContext('2d');
        new Chart(ctx, {
            type: 'bar',
            data: barChartData,
            options: {
                responsive: true,
                legend: {
                    display: false
                },
                title: {
                    display: true,
                    text: label
                },
                tooltips: {
                    callbacks: {
                        title: function () { }
                    }
                },
                scales: {
                    yAxes: [
                        {
                            id: 'yAxis1',
                            ticks: {
                                suggestedMin: 0,
                                suggestedMax: 250,
                                callback: function (value) {
                                    return value + ' s';
                                }
                            }
                        }
                    ]
                }
            }
        });
    }

    var renderPlotChart = function (manual, autonomous, mapper, element, label, yUnit, xUnit) {
        var scatterChartData = {
            datasets: [{
                label: 'Manual',
                backgroundColor: red,
                data: manual.map(mapper)
            }, {
                label: 'Autonom',
                backgroundColor: green,
                data: autonomous.map(mapper)
            }]
        };

        var ctx = element.getContext('2d');
        Chart.Scatter(ctx, {
            data: scatterChartData,
            options: {
                title: {
                    display: true,
                    text: label
                },
                scales: {
                    yAxes: [
                        {
                            id: 'yAxis1',
                            ticks: {
                                callback: function (value) {
                                    if (yUnit) {
                                        return value + ' ' + yUnit;
                                    } else return value;
                                }
                            }
                        }
                    ],
                    xAxes: [
                        {
                            id: 'xAxis1',
                            ticks: {
                                callback: function (value) {
                                    if (xUnit) {
                                        return value + ' ' + xUnit;
                                    } else return value;
                                }
                            }
                        }
                    ]
                }
            }
        });
    };

    var renderDoubleRadarChart = function (manual, autonomous, element, label) {
        var config = {
            type: 'radar',
            data: {
                labels: [['Ieșiri', 'traseu'], ['Intrări', 'sens opus'], ['Ciocniri', 'parcare'], 'Intervenții'],
                datasets: [{
                    label: 'Manual',
                    backgroundColor: redTransparent,
                    borderColor: red,
                    pointBackgroundColor: red,
                    data: incidentMapper(manual)
                }, {
                    label: 'Autonom',
                    backgroundColor: greenTransparent,
                    borderColor: green,
                    pointBackgroundColor: green,
                    data: incidentMapper(autonomous)
                }]
            },
            options: {
                legend: {
                    position: 'top',
                },
                title: {
                    display: true,
                    text: label
                },
                scale: {
                    ticks: {
                        beginAtZero: true
                    }
                }
            }
        };

        new Chart(element, config);
    }
});