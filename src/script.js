$(document).ready(function () {
    var manual = [];
    var autonomous = [];

    $.when(
        $.getJSON('../data/manual.json', function (result) {
            manual = result;
        }),
        $.getJSON('../data/autonomous.json', function (result) {
            autonomous = result;
        })
    ).then(function () {
        Chart.defaults.global.defaultFontColor = 'rgb(23, 23, 23)';

        renderBarChart(manual, document.getElementById('bar-chart-manual'), 'Timp parcurgeri cu mașinile operate manual (s)', 'rgb(196,40,27)');
        renderBarChart(autonomous, document.getElementById('bar-chart-autonomous'), 'Timp parcurgeri cu mașinile operate autonom (s)', 'rgb(75,151,74)');
    });

    var renderBarChart = function (data, element, label, backgroundColor) {
        var barChartData = {
            labels: data.map(function (value) {
                return value['Nr'];
            }),
            datasets: [{
                label: '',
                backgroundColor: 'rgb(246, 238, 36)',
                backgroundColor: backgroundColor,
                borderWidth: 1,
                data: data.map(function (value) {
                    var time = value['Timp parcurgere'];
                    if (typeof time == 'string') {
                        var timeUnits = time.split(':');
                        return timeUnits[0] * 60 + parseInt(timeUnits[1], 10);
                    } else {
                        return 0;
                    }
                })
            }]
        };


        var ctx = element.getContext('2d');
        window.myBar = new Chart(ctx, {
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
                                suggestedMax: 250
                            }
                        }
                    ]
                }
            }
        });
    }
});