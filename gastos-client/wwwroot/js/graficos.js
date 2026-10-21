
window.estadisticasGastos = (() => {
    const graficos = new Map();

    function inicializar() {
        if (typeof echarts === "undefined") {
            throw new Error("Apache ECharts no está cargado.");
        }
    }

    function obtenerGrafico(id) {
        const elemento = document.getElementById(id);
        if (!elemento) return null;

        let grafico = graficos.get(id);

        if (!grafico || grafico.isDisposed()) {
            grafico = echarts.init(elemento);
            graficos.set(id, grafico);
        }

        return grafico;
    }

    function renderizar(datos) {
        inicializar();

        for (const persona of datos.personas) {
            const pie = obtenerGrafico(`pie-${persona.index}`);
            const linea = obtenerGrafico(`line-${persona.index}`);

            if (pie) {
                pie.setOption({
                    tooltip: {
                        trigger: "item",
                        formatter: p =>
                            `${p.name}<br/>S/ ${Number(p.value).toLocaleString(
                                "es-PE",
                                { minimumFractionDigits: 2 }
                            )} (${p.percent}%)`
                    },
                    legend: {
                        bottom: 0,
                        type: "scroll"
                    },
                    series: [{
                        name: "Gastos por categoría",
                        type: "pie",
                        radius: ["35%", "65%"],
                        center: ["50%", "43%"],
                        avoidLabelOverlap: true,
                        itemStyle: {
                            borderRadius: 5,
                            borderColor: "#fff",
                            borderWidth: 2
                        },
                        label: {
                            formatter: "{b}\n{d}%"
                        },
                        data: persona.pie
                    }],
                    dataZoom: [
                        {
                            type: 'slider',
                            xAxisIndex: 'all',
                            left: '5%',
                            right: '5%',
                            bottom: 20,
                            height: 30,
                            throttle: 120
                        },
                        {
                            type: 'inside',
                            xAxisIndex: 'all',
                            throttle: 120
                        }
                    ],
                    graphic: persona.pie.length
                        ? []
                        : [{
                            type: "text",
                            left: "center",
                            top: "middle",
                            style: {
                                text: "Sin gastos en este mes",
                                fill: "#888",
                                fontSize: 14
                            }
                        }]
                }, true);
            }

            if (linea) {
                const series = persona.series.map(s => ({
                    name: s.name,
                    type: "line",
                    data: s.data,
                    smooth: true,
                    showSymbol: true,
                    symbolSize: 6,
                    lineStyle: {
                        width: s.name === "Total" ? 3.5 : 2
                    },
                    emphasis: {
                        focus: "series"
                    }
                }));

                linea.setOption({
                    tooltip: {
                        trigger: "axis",
                        valueFormatter: valor =>
                            `S/ ${Number(valor).toLocaleString("es-PE", {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2
                            })}`
                    },
                    legend: {
                        type: "scroll",
                        bottom: 0
                    },
                    grid: {
                        left: 60,
                        right: 20,
                        top: 25,
                        bottom: 85
                    },
                    xAxis: {
                        type: "category",
                        boundaryGap: false,
                        data: persona.meses,
                        axisLabel: {
                            formatter: valor => {
                                const [anio, mes] = valor.split("-");
                                const fecha = new Date(
                                    Number(anio),
                                    Number(mes) - 1,
                                    1
                                );
                                return fecha.toLocaleDateString("es-PE", {
                                    month: "short",
                                    year: "2-digit"
                                });
                            }
                        }
                    },
                    yAxis: {
                        type: "value",
                        name: "S/",
                        axisLabel: {
                            formatter: valor =>
                                Number(valor).toLocaleString("es-PE")
                        }
                    },
                    dataZoom: [
                        {
                            type: 'slider',
                            xAxisIndex: 'all',
                            left: '5%',
                            right: '5%',
                            bottom: 20,
                            height: 30,
                            throttle: 120
                        },
                        {
                            type: 'inside',
                            xAxisIndex: 'all',
                            throttle: 120
                        }
                    ],
                    series
                }, true);
            }
        }

        // El tamaño de los gráficos se adapta al contenedor.
        for (const grafico of graficos.values()) {
            grafico.resize();
        }
    }

    function destruir() {
        for (const grafico of graficos.values()) {
            if (!grafico.isDisposed()) grafico.dispose();
        }
        graficos.clear();
    }

    window.addEventListener("resize", () => {
        for (const grafico of graficos.values()) {
            if (!grafico.isDisposed()) grafico.resize();
        }
    });

    return { inicializar, renderizar, destruir };
})();
